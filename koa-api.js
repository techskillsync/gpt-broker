require('dotenv').config(); // Load environment variables

const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = new Koa();
const router = new Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());

/*
 * Generate a response with ChatGPT
 * @param {string} prompt - text you want GPT to respond to
 */
async function GenerateResponse(prompt) {
	console.log(` - 📝 Sending ChatGPT ${prompt}`)
	const response = await openai.chat.completions.create({
		messages: [{ role: "system", content: prompt }],
		model: "gpt-4o-mini",
	});
	try {
		return response.choices[0].message.content.trim();
	} catch {
		throw new Error(JSON.stringify(response));
	}
}

// Middleware to check Supabase session
app.use(async (ctx, next) => {
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

    ctx.state.user = user;
    await next();
});

/*
 * Expects a param 'prompt' for GPT Generation
 * @returns - a response with a body being the GPT response
 */
router.get('/gpt-4o-mini-complete', async ctx => {
	const prompt = ctx.query.prompt;
	if (!prompt) {
		ctx.stauts = 400;
		ctx.body = { error: "Missing required 'prompt' query parameter" };
		return;
	}
	try {
		const response = await GenerateResponse(prompt);
		ctx.body = response;
	} catch (error) {
		ctx.status = 500;
		ctx.body = { error: `GPT Threw an error - ${error.message}`};
	}
})

app
	.use(router.routes())
	.use(router.allowedMethods());

// Error handling for non-existent endpoints
app.use(async (ctx) => {
	console.log(' - 📭 user requested non-existent endpoint')
    ctx.status = 404;
    ctx.body = { error: 'Endpoint not found' };
});

const PORT = 8011;
app.listen(PORT, () => {
	console.log(` - 💼 GPT Broker running on port ${PORT}`)
});