# GPT Broker 💼

GPT Broker keeps your OpenAI token out of frontend code and ensures only authenticated users access sensitive endpoints.

For Prometheus integration a /metrics endpoint with basic traffic information is exposed. Make sure public requests are denied from accessing it.

## Endpoints:
### /simple-gpt-4o-mini-complete
For simple requests that fit in a URL. Requires:
  - **prompt** - A URL parameter to give to ChatGPT
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"

### /advanced-gpt-4o-mini-complete
More complicated but allows full control over the prompts passed to ChatGPT. Requires:
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"
  - **messages** passed in the message body as JSON. Must be a valid array of messages that ChatGPT accepts. Ie, in the format: `[ { role: 'system', content: "Write me a poem" }, ... ]` [Read more here](https://platform.openai.com/docs/guides/chat-completions/getting-started?lang=node.js).

### /metrics
Application metrics for Prometheus

## Setup:
Make a .env file in the root directory with the following. Then run `docker compose up` to start **gpt_broker**.
```
OPENAI_API_KEY=openai-key
SUPABASE_SERVICE_KEY=supabase-service-key
SUPABASE_URL=https://supabase-url
REDIS_URL=redis-connection-string
ID_WHITE_LIST=list-of-user-id's
DAILY_LIMIT=limit-num
```
