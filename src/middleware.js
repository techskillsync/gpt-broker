import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
import { totalRequests, successfulRequests, failedRequests } from './metrics.js';

// In-memory rate limiter store: { key: { count, resetAt } }
const rateStore = new Map();

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
	if (!user) {
		throw Error("checkRateLimit could not get the user object. Make sure previous middleware added it to ctx.state.user before calling checkRateLimit")
	}

	const key = `rate_limit:${user.id}`;
	const windowMs = 60 * 60 * 1000; // 1 hour
	const limit = 100;
	const now = Date.now();

	let entry = rateStore.get(key);
	if (!entry || now >= entry.resetAt) {
		entry = { count: 0, resetAt: now + windowMs };
		rateStore.set(key, entry);
	}

	entry.count += 1;

	if (entry.count > limit) {
		ctx.status = 429;
		ctx.body = { error: 'GPT Rate limit exceeded. Try again later.', message: null };
		return;
	}

	await next();
}

export { validateUser, checkRateLimit, updateMetrics };
