# GPT Broker 💼

GPT Broker keeps your OpenAi token out of frontend code and also ensures only authenticated users are able to make requests using an OpenAi token.

This Koa server creates an endpoint that accepts a `prompt` parameter and a `Authentication` header.
  - `prompt` - The prompt to complete with Chat GPT
  - `Authentication` The user's session token from Supabase in the form: "Bearer <session-token>"

The only manual configuration is creating a .env file with the following:
```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-anon-key-here
```
