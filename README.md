# GPT Broker 💼

GPT Broker keeps your OpenAi token out of frontend code and also ensures only authenticated users are able to make requests using an OpenAi token.

## Endpoints:
### /simple-gpt-4o-mini-complete
For simple requests that fit in a URL. Requires:
  - **prompt** - A URL parameter to give to ChatGPT
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"

### /advanced-gpt-4o-mini-complete
More complicated but allows full control over the prompts passed to ChatGPT. Requires:
  - **Autentication** - A header with the user's access token, in the format "Bearer <access_token>"
  - **messages** passed in the message body as JSON. Must be a valid array of messages that ChatGPT accepts. Ie, in the format: `[ { role: 'system', content: "Write me a poem" }, ... ]` [Read more here](https://platform.openai.com/docs/guides/chat-completions/getting-started?lang=node.js).

## Setup:
Make a .env file in the root directory with the following. Then run `node koa-api.js` or `docker compose up` to run **gpt_broker**.
```
OPENAI_API_KEY=openai-key
SUPABASE_SERVICE_KEY=supabase-service-key
SUPABASE_URL=https://supabase-url
REDIS_URL=redis-connection-string
ID_WHITE_LIST=list-of-user-id's
DAILY_LIMIT=limit-num
```