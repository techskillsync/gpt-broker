# GPT Broker 💼

GPT Broker keeps your OpenAI token out of frontend code and ensures only authenticated users access sensitive endpoints.

For Prometheus integration a /metrics endpoint with basic traffic information is exposed. Make sure public requests are denied from accessing it.

## Endpoints:

### /v2/advanced-gpt-4o-mini-complete
This version has small syntax tweaks and lets the caller specify a temperature to pass to gpt
  - **Request Headers:** - An Authorization header with the user's access token, in the format "Authorization": "Bearer <access_token>"
  - **Request Body:** An object with a "messages" field and an optional "temperature" field. Messages Must be a valid array of messages that ChatGPT accepts. Ie, in the format: `[ { role: 'system', content: "Write me a poem" }, ... ]`

### /advanced-gpt-4o-mini-complete
More complicated but allows full control over the prompts passed to ChatGPT. Requires:
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"
  - **messages** passed in the message body as JSON. Must be a valid array of messages that ChatGPT accepts. Ie, in the format: `[ { role: 'system', content: "Write me a poem" }, ... ]`

### /simple-gpt-4o-mini-complete
For simple requests that fit in a URL. Requires:
  - **prompt** - A URL parameter to give to ChatGPT
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"

### /metrics
Application metrics for Prometheus

## Setup:
Make a .env file in the root directory with the following. Then run `docker compose up` to start **gpt_broker**.
```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here
REDIS_URL=redis://:@redis-stack:6379
DAILY_LIMIT=50
ID_WHITE_LIST=[]
```

## Testing:

There is an End to End test to make sure the whole process still works. 
To run the test start the docker container (needs to be exposed on 
default port 8011) then run 
```
cd test-gpt-broker
pnpm test
```
