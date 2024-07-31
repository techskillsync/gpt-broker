const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
 * Generate a response with ChatGPT
 * @param {string} prompt - text you want GPT to respond to
 */
async function GenerateResponse(messages) {

	if (!Array.isArray(messages)) { 
		throw new Error("'messages' must be an array"); 
	}

	for (const message of messages) {
        if (typeof message !== 'object' || !message.role || !message.content) {
            throw new Error("Each message should be an object with 'role' and 'content' properties");
        }
    }
	
	console.log(` - 📝 Querying ChatGPT`)

	try {
		const response = await openai.chat.completions.create({
			messages: messages,
			model: "gpt-4o-mini",
		});
		return response.choices[0].message.content.trim();
	} catch {
		throw new Error(JSON.stringify(response));
	}
}

module.exports = { GenerateResponse }