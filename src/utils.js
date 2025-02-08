const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
 * Generate a response with ChatGPT
 * @param {string} prompt - text you want GPT to respond to
 * @param {number} temperature - (optional) temperature to pass to GPT
 */
async function generateResponse(messages, temperature=0.7, model) {
	if (!Array.isArray(messages)) { 
		throw new Error("'messages' must be an array"); 
	}

	for (const message of messages) {
		if (typeof message !== 'object' || !message.role || !message.content) {
			throw new Error("Each message should be an object with 'role' and 'content' properties");
		}
	}

	if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
		throw new Error("temperature' must be a number between 0 and 1");
	}

	if (model !== "gpt-4o" && model !== "gpt-4o-mini") {
		throw new Error("Model must be one of gpt-4o and gpt-4o-mini");
	}
	
	console.log(` - 📝 Querying ChatGPT`);

	try {
		const response = await openai.chat.completions.create({
			messages: messages,
			model: model,
			temperature,
		});
		console.log(response)
		return response.choices[0].message.content.trim();
	} catch (error) {
		throw new Error(error);
	}
}

module.exports = { generateResponse }
