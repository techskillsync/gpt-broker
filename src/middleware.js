const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const validateUser = async (ctx, next) => {
	const authHeader = ctx.headers['authorization'];
	if (!authHeader) {
		ctx.status = 401;
		ctx.body = { error: 'Authorization header is required' };
		return;
	}

	const token = authHeader.split(' ')[1];
	const { data: user, error } = await supabase.auth.getUser(token);

	if (error || !user) {
		ctx.status = 401;
		ctx.body = { error: 'Invalid or expired token' };
		return;
	}

	// The user object is nested.. that why we do the below
	ctx.state.user = user.user;
	await next();
};

async function checkRateLimit(ctx, next) {

	const user = ctx.state.user;

	if (!user) { throw Error("checkRateLimit could not get the user object. Make sure previous middleware added it to ctx.state.user before calling checkRateLimit") }

	const { data: rate_limit_data, error: rate_limit_fetch_error } = await supabase
		.from('rate_limit')
		.select('*')
		.eq('id', user.id)
		.single()

	// Throw error unless we haven't added the user yet.
	// If we haven't added the user yet then add them.
	if (rate_limit_fetch_error && rate_limit_fetch_error.code !== "PGRST116") {
		ctx.status = 500;
		ctx.body = { error: `Error fetching user usage limit` }
		console.log(" - 🚨 error fetching user usage limit");
		console.log(rate_limit_fetch_error)
		return;
	}
	else if (rate_limit_fetch_error) {
		const { data: insertedData, error: insertError } = await supabase
			.from('rate_limit')
			.insert([{ id: user.id, usage: 1, email: user.email }])

		if (insertError) {
			ctx.status = 500;
			ctx.body = { error: `Error inserting user into rate_limit table` }
			console.log(" - 🚨 error inserting user into rate_limit table");
			return;
		}
	}
	else {
		if (rate_limit_data.rate_limited !== false && rate_limit_data.usage >= process.env.DAILY_LIMIT) {
			ctx.status = 429;
			ctx.body = { error: `You have exceeded your daily limit of ${process.env.DAILY_LIMIT} requests. Please try again tomorrow.` };
			return;
		}
		const { data: updatedData, error: updateError } = await supabase
			.from('rate_limit')
			.update({ usage: rate_limit_data.usage + 1 })
			.eq('id', user.id);
		if (updateError) {
			ctx.status = 500;
			ctx.body = { error: `Error updating user usage limit` };
			console.log(" - 🚨 error updating user usage limit");
			return;
		}
	}

	await next();
}

module.exports = { validateUser, checkRateLimit };
