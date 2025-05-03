import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import { expect } from 'chai';

const BASE_URL = process.env.BASE_URL;

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
)

describe(`E2E Testing for GPT API on ${process.env.BASE_URL}`, function () {

	let bearer_token = undefined;

	before(async function () {
		try {
			const res = await fetch(`${BASE_URL}/health`);
			if (!res.ok) {
				throw new Error(`Server responded with ${res.status}`)
			}
		} catch (err) {
			throw new Error(`Server is not running or is unreachable at ${BASE_URL}`)
		}

		await supabase.auth.signInWithPassword({email: process.env.SUPABASE_EMAIL, password: process.env.SUPABASE_PASSWORD});
		const response = await supabase.auth.getSession();
		bearer_token = response.data.session.access_token
		if (typeof bearer_token !== "string") {
			throw new Error('Problem getting bearer token from supabase. Quitting')
		}
	});

	it('should return 400 if prompt is missing in GET /simple-gpt-4o-mini-complete', async function () {
		const res = await request(`${process.env.BASE_URL}`)
			.get('/simple-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "Missing required 'prompt' query parameter");
	});

	it('should return GPT response for valid prompt in GET /simple-gpt-4o-mini-complete', async function () {
		const res = await request(`${process.env.BASE_URL}`)
			.get('/simple-gpt-4o-mini-complete')
			.query({ prompt: 'Hello GPT' })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty;
	});

	it('should not be an ok response if messages are missing in POST /advanced-gpt-4o-mini-complete', async function () {
		const res = await request(`${process.env.BASE_URL}`)
			.post('/advanced-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);
		expect(res.status).to.not.be.within(200, 299);
	});

	it('should return GPT response for valid messages in POST /advanced-gpt-4o-mini-complete', async function () {
		const messages = [{ "role": "system", "content": "give me a one word response" }];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/advanced-gpt-4o-mini-complete')
			.send(messages)
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty; // Adjust based on your response structure
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 401 if no Authorization header', async function () {
		const messages = [{"role":"system", "content":"give me a one word response"}];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages });

		expect(res.status).to.equal(401);
		expect(res.body).to.have.property('error', "Authorization header is required");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 if messages is missing', async function () {
		const res = await request(`${process.env.BASE_URL}`)
			.post('/v2/advanced-gpt-4o-mini-complete')
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "Missing required 'messages' in body of request");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 on invalid temperature', async function () {
		const messages = [{"role":"system", "content":"give me a one word response"}];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages, temperature: -1 })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "'temperature' must be a number between [0, 1]");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should return 400 on malformed messages', async function () {
		const messages = [{"role":"system"}, { "content":"hello" }];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(400);
		expect(res.body).to.have.property('error', "each 'message' object must have a 'role' and 'content' property");
	});

	it('/v2/advanced-gpt-4o-mini-complete - should get response on successful request', async function () {
		const messages = [{ "role": "system", "content": "give me a one word response" }];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/v2/advanced-gpt-4o-mini-complete')
			.send({ messages, temperature: 0.3 })
			.set('Authorization', `Bearer ${bearer_token}`);

		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty;
	});

	it ('/gpt-4o - should get response on successful request', async function() {
		const messages = [ { "role": "system", "content": "give me a one word response" } ];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/gpt-4o')
			.send({ messages })
			.set('Authorization', `Bearer ${bearer_token}`);
		expect(res.status).to.equal(200);
		expect(res.text).to.not.be.empty;
	});

	it ('/stream - should be able to stream gpt-4o-mini', async function() {
		const messages = [ { "role": "system", "content": "white me a ten line poem" } ];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/stream')
			.send({ messages, temperature: 0.7, model: "gpt-4o-mini" })
			.set('Authorization', `Bearer ${bearer_token}`)
			.buffer(true)
			// Below we define a customer parser. We need to do this because
			// gpt-broker will send many JSON objects separated by newlines,
			// this will break request's default parsing and it will throw 
			// an error.
			.parse((res, callback) => {
				let data = '';
				res.on('data', chunk => { data += chunk.toString('utf8') });
				res.on('end', () => callback(null, data));
			});
		
		expect(res.status).to.equal(200);
		const res_body = res.body;
		const lines = res_body.split('\n');
		expect(lines.length).to.be.greaterThan(1);
	});

	it ('/stream - should be able to stream gpt-4o', async function() {
		const messages = [ { "role": "system", "content": "white me a ten line poem" } ];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/stream')
			.send({ messages, temperature: 0.7, model: "gpt-4o-mini" })
			.set('Authorization', `Bearer ${bearer_token}`)
			.buffer(true)
			// Below we define a customer parser. We need to do this because
			// gpt-broker will send many JSON objects separated by newlines,
			// this will break request's default parsing and it will throw 
			// an error.
			.parse((res, callback) => {
				let data = '';
				res.on('data', chunk => { data += chunk.toString('utf8') });
				res.on('end', () => callback(null, data));
			});
		
		expect(res.status).to.equal(200);
		const res_body = res.body;
		const lines = res_body.split('\n');
		expect(lines.length).to.be.greaterThan(1);
	});

	it ('/stream should fail if bad token', async function() {
		const messages = [ { "role": "system", "content": "white me a ten line poem" } ];
		const res = await request(`${process.env.BASE_URL}`)
			.post('/stream')
			.send({ messages, temperature: 0.7, model: "gpt-4o-mini" })
			.set('Authorization', 'Bearer abcdefg')
			.buffer(true)
			// Below we define a customer parser. We need to do this because
			// gpt-broker will send many JSON objects separated by newlines,
			// this will break request's default parsing and it will throw 
			// an error.
			.parse((res, callback) => {
				let data = '';
				res.on('data', chunk => { data += chunk.toString('utf8') });
				res.on('end', () => callback(null, data));
			});
		
		expect(res.status).to.equal(401);
	});
});
