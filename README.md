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
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-service-key-here
SUPABASE_ADMIN_EMAIL=supabase-admin-username
SUPABASE_ADMIN_PASSWORD=supabase-admin-password
DAILY_LIMIT=50
```

## Testing:

There is an End to End test to make sure the whole process still works. 
To run the test start the docker container (needs to be exposed on 
default port 8011) then run `pnpm test`.