
const VALID_STREAM_MODELS = ["gpt-4o", "gpt-4o-mini"]
/*
 * Validates a request for a call to /steam
 * if valid returns { valid: true, message: null },
 * if invalid returnse { valid: false, message: <error_message> }
 * @param {ctx} KoaJS ctx object for the reqeust
 * @returns {valid: <boolean>, message: <string|null>}
 */
function validateStreamResponse(ctx) {
	const temperature = ctx.request.body.temperature;
	const model = ctx.request.body.model;
	const messages = ctx.request.body.messages;

	if (temperature && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
		return { valid: false, message: "'temperature' must be a number between [0, 1]" }
	}

	if (!messages) {
		return { valid: false, message: "Missing required 'messages' in body of request", message: null };
	}

	if (!Array.isArray(messages)) { 
		return { valid: false, message: "'messages' must be an array"}; 
	}

	if (typeof model !== "string" || !VALID_STREAM_MODELS.includes(model)) {
		return { valid: false, message: `'model' must be one of ${VALID_STREAM_MODELS}`}
	}

	for (const message of messages) {
		if (typeof message !== 'object' || !message.role || !message.content) {
			return { valid: false, message: "each 'message' object must have a 'role' and 'content' property"}; 
		}
	}

	return { valid: true, message: null }
}

export { validateStreamResponse }
