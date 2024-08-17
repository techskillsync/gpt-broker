const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function validateUser(ctx, next) {

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

	const client = ctx.context.client;
	const user = ctx.state.user;

	if (!user) { throw Error("checkRateLimit could not get the user object. Make sure previous middleware added it to ctx.state.user before calling checkRateLimit") }

	const key = `rate_limit:${user.id}`;
	const expirationTime = 24 * 60 * 60; // 24 hrs
    await client.multi()
		.incr(key)
		.expire(key, expirationTime)
		.exec((err, replies) => {
			if (err) {
				console.error(' - ‼️ redis error: ' + err);
			} else {
				console.log(replies)
			}
		});
	
	await next();
}

module.exports = { validateUser, checkRateLimit };
