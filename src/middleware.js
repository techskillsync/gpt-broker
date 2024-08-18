const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function validateUser(ctx, next) {
	console.time("ValidateUser");
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
	console.timeEnd("ValidateUser");
	await next();
};

async function CheckRateLimit(ctx, next) {
	console.time("CheckRateLimit");
	const user = ctx.state.user;

	if (!user) { throw Error("checkRateLimit could not get the user object. Make sure previous middleware added it to ctx.state.user before calling checkRateLimit") }

	const key = `rate_limit:${user.id}`;
	const expirationTime = 24 * 60 * 60; // 24 hrs
	const replies = await ctx.redis.multi()
		.incr(key)
		.expire(key, expirationTime)
		.get(key)
		.exec((err, replies) => {
			if (err) {
				console.error(' - ‼️ redis error: ' + err);
			} else {
				console.log(replies)
			}
		});
	
	const ID_WHITE_LIST = process.env.ID_WHITE_LIST;
	const DAILY_LIMIT = process.env.DAILY_LIMIT;

	if (!ID_WHITE_LIST.includes(user.id)) {
		const currentRequests = parseInt(replies[2])
		if (currentRequests > DAILY_LIMIT) {
			ctx.status = 429;
			ctx.body = { error: 'GPT Rate limit exceeded.', message: null }
			return;
		}
	}

	console.timeEnd("CheckRateLimit");
	await next();
}

module.exports = { validateUser, CheckRateLimit };
