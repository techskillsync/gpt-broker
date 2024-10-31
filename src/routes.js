const Router = require('koa-router')
const { generateResponse } = require('./utils')

const router = new Router();

/*
 * Expects a param 'prompt' for GPT Generation
 * @returns - GPT's response in the message body
 */
router.get('/simple-gpt-4o-mini-complete', async ctx => {
	const prompt = ctx.query.prompt;

	if (!prompt) {
		ctx.status = 400;
		ctx.body = { error: "Missing required 'prompt' query parameter" };
		return;
	}

	if (typeof prompt !== 'string') {
		ctx.status = 400;
		ctx.body = { error: "'prompt' must be a string" };
		return;
	}

	try {
		messages = [{ role: "system", content: prompt }]
		const response = await generateResponse(messages);
		ctx.body = response;
	} catch (error) {
		console.log("error below:")
		console.error(error);
		ctx.status = 500;
		ctx.body = { error: `GPT Threw an error - ${error.message}`};
	}
})

/*
 * Request body must contain an array of `messages` to pass to GPT
 * ie. [ { role: 'system', content: "Write me a poem" }, ... ]
 * @returns - a response with GPT's response in the body
 */
router.post('/advanced-gpt-4o-mini-complete', async ctx => {
	const messages = ctx.request.body;
	if (!messages) {
		ctx.status = 400;
		ctx.body = { error: "Missing required 'messages' in body of request" };
		return;
	}
	try {
		const response = await generateResponse(messages);
		ctx.body = response;
	} catch (error) {
		console.log("error below:")
		console.error(error);
		ctx.status = 500;
		ctx.body = { error: `GPT Threw an error - ${error.message}`};
	}
})

module.exports = { router };