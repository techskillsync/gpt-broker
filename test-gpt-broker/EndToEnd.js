import { config } from 'dotenv'
config()
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
import request from'supertest';
import { expect } from 'chai';
import http from 'http'

describe('E2E Testing for GPT API on localhost', function () {

	let bearer_token = undefined;

	before(async function () {
		const serverUrl = 'http://localhost:8023';

		await new Promise((resolve, reject) => {
			const req = http.get(serverUrl, (res) => {
				resolve();
			});

			req.on('error', (err) => {
				console.error(`Server is not running on ${serverUrl}. Please start it.`);
				reject(new Error(`Server not running on ${serverUrl}`));
			});
		});

		await supabase.auth.signInWithPassword({email: process.env.SUPABASE_EMAIL, password: process.env.SUPABASE_PASSWORD});
		const response = await supabase.auth.getSession();
		bearer_token = response.data.session.access_token
		if (typeof bearer_token !== "string") {
			throw new Error('Problem getting bearer token from supabase. Quitting')
		}
	});

	it('should return 400 if prompt is missing in GET /simple-gpt-4o-mini-complete', async function () {
		const res = await request('http://localhost:8023')
			.get('/simple-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "Missing required 'prompt' query parameter");
	});

	it('should return GPT response for valid prompt in GET /simple-gpt-4o-mini-complete', async function () {
		const res = await request('http://localhost:8023')
			.get('/simple-gpt-4o-mini-complete')
			.query({ prompt: 'Hello GPT' })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty;
	});

	it('should not be an ok response if messages are missing in POST /advanced-gpt-4o-mini-complete', async function () {
		const res = await request('http://localhost:8023')
			.post('/advanced-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);
		expect(res.status).to.not.be.within(200, 299);
	});

	it('should return GPT response for valid messages in POST /advanced-gpt-4o-mini-complete', async function () {
		const messages = [{ "role": "system", "content": "give me a one word response" }];
		const res = await request('http://localhost:8023')
			.post('/advanced-gpt-4o-mini-complete')
			.send(messages)
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty; // Adjust based on your response structure
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 401 if no Authorization header', async function () {
		const messages = [{"role":"system", "content":"give me a one word response"}];
		const res = await request('http://localhost:8023')
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages });

		expect(res.status).to.equal(401);
		expect(res.body).to.have.property('error', "Authorization header is required");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 if messages is missing', async function () {
		const res = await request('http://localhost:8023')
			.post('/v2/advanced-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "Missing required 'messages' in body of request");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 on invalid temperature', async function () {
		const messages = [{"role":"system", "content":"give me a one word response"}];
		const res = await request('http://localhost:8023')
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages, temperature: -1 })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "'temperature' must be a number between [0, 1]");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 on malformed messages', async function () {
		const messages = [{"role":"system"}, { "content":"hello" }];
		const res = await request('http://localhost:8023')
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "each 'message' object must have a 'role' and 'content' property");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should get response on successful request', async function () {
		const messages = [{ "role": "system", "content": "give me a one word response" }];
		const res = await request('http://localhost:8023')
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages, temperature: 0.3 })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty;
	});
});
