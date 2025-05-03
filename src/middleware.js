import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
import { totalRequests, successfulRequests, failedRequests } from './metrics.js';

async function updateMetrics(ctx, next) {
	await next();

	if (ctx.path !== "/metrics") {
		totalRequests.inc({ method: ctx.method, status_code: ctx.status })
		if (200 <=ctx.status && ctx.status <= 299) {
			successfulRequests.inc({ method: ctx.method, status_code: ctx.status})
		} else {
			failedRequests.inc({ method: ctx.method, status_code: ctx.status })
		}
	}
}

async function validateUser(ctx, next) {
	const authHeader = ctx.headers['authorization'];
	if (!authHeader) {
		ctx.status = 401;
		ctx.body = { error: 'Authorization header is required', message: null };
		return;
	}

	const token = authHeader.split(' ')[1];
	const { data, error } = await supabase.auth.getUser(token);


	if (error || !data) {
		console.log(`Failed to authenticate user with token ${token}`)
		ctx.status = 401;
		ctx.body = { error: 'Invalid or expired token', message: null };
		return;
	}

	ctx.state.user = data.user;

	await next();
};

async function checkRateLimit(ctx, next) {
	
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

	await next();
}

export { validateUser, checkRateLimit, updateMetrics };
