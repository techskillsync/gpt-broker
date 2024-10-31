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

async function CheckRateLimit(ctx, next) {
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

	const id_white_list = ['87b3d3cb-8643-46e8-9e54-39c0ffe2a585'];
	const DAILY_LIMIT = 200;

	if (!id_white_list.includes(user.id)) {
		const currentRequests = parseInt(replies[2])
		if (currentRequests > DAILY_LIMIT) {
			ctx.status = 429;
			ctx.body = { error: 'GPT Rate limit exceeded.', message: null }
			return;
		}
	}

	await next();
}

module.exports = { validateUser, CheckRateLimit };
