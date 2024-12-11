const Router = require('koa-router')
const { validateUser, checkRateLimit } = require('./middleware')
const { generateResponse } = require('./utils')
const { register } = require('./metrics')

const router = new Router();

/*
 * Expects a param 'prompt' for GPT Generation
 * @returns - GPT's response in the message body
 */
router.get('/simple-gpt-4o-mini-complete', validateUser, CheckRateLimit, async ctx => {
	const prompt = ctx.query.prompt;

	if (!prompt) {
		ctx.status = 400;
		ctx.body = { error: "Missing required 'prompt' query parameter", message: null };
		return;
	}

	if (typeof prompt !== 'string') {
		ctx.status = 400;
		ctx.body = { error: "'prompt' must be a string", message: null };
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
router.post('/advanced-gpt-4o-mini-complete', validateUser, checkRateLimit, async ctx => {
	const messages = ctx.request.body;
	if (!messages) {
		ctx.status = 400;
		ctx.body = { error: "Missing required 'messages' in body of request", message: null };
		return;
	}
	try {
		const response = await generateResponse(messages);
		ctx.body = response;
	} catch (error) {
		console.log("error below:")
		console.error(error);
		ctx.status = 500;
		ctx.body = { error: `GPT Threw an error - ${error.message}`, message: null};
	}
})

/*
 * Request a 4o chat completion using a bearer token
 * @header Authorization - The SkillSync access token in the format Bearer <token>
 * @param {Array<Object>} messages - messages to prompt chat completion with
 * @param {number} temperature - (optional) temperature to pass to gpt
 * @returns {Object} - an object with either a "message" or "error" field
 * 
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer <token>",
 *   "Content-Type": "application/json"
 * }
 * 
 * @example
 * Request body:
 * {
 * 	messages: [ { role: 'system', content: "Write me a poem" } ]
 * }
 * 
 * @example
 * Request body:
 * {
 * 	messages: [ { role: 'system', content: "Write me a poem" } ]
 *  temperature: 0.7
 * }
 * 
 */
router.post('/v2/advanced-gpt-4o-mini-complete', validateUser, checkRateLimit, async ctx => {
	const messages = ctx.request.body.messages;
	const temperature = ctx.request.body.temperature;

	if (temperature && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
		ctx.status = 400;
		ctx.body = { error: "'temperature' must be a number between [0, 1]" };
		return;
	}

	if (!messages) {
		ctx.status = 400;
		ctx.body = { error: "Missing required 'messages' in body of request", message: null };
		return;
	}

	if (!Array.isArray(messages)) { 
		ctx.status = 400;
		ctx.body = {"error": "'messages' must be an array"}; 
		return;
	}

	for (const message of messages) {
		if (typeof message !== 'object' || !message.role || !message.content) {
			ctx.status = 400;
			ctx.body = {"error": "each 'message' object must have a 'role' and 'content' property"}; 
			return;
		}
	}

	try {
		const response = await generateResponse(messages, temperature);
		ctx.body = { message: response};
	} catch (error) {
		console.log("error below:")
		console.error(error);
		ctx.status = 500;
		ctx.body = { error: `GPT Threw an error - ${error.message}`, message: null};
	}
})


router.get('/metrics', async ctx => {
	ctx.type = 'text/plain';
	ctx.body = await register.metrics();
})

module.exports = { router };
