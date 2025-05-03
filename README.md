# GPT Broker 💼

GPT Broker keeps your OpenAI token out of frontend code and ensures only authenticated users access sensitive endpoints.

For Prometheus integration a /metrics endpoint with basic traffic information is exposed. Make sure public requests are denied from accessing it.

## Endpoints:

### /stream
```sh
# Streams a chat completion back to the user as it arrives

# Method:
POST

# Request Header:
Authorization: Bearer <supabase-access-token>

# Request Body:
{
    "messages": <string_to_query_4o_with>, # eg. `[ { "role": "system", "content": "Write me a poem" }, ... ]`
    "temperature": <float_between_0_and_1>,
    "model": <gpt_model_to_use> # either "gpt-4o" or "gpt-4o-mini"
}
```

### /gpt-4o
```sh
# Simple endpoint for 4o, supports temperature.

# Method:
POST

# Request Header:
Authorization: Bearer <supabase-access-token>

# Request Body:
{
    "messages": <string_to_query_4o_with>,
    "temperature": <float_between_0_and_1>
}
```

### /v2/advanced-gpt-4o-mini-complete
```sh
# v2 has small syntax tweaks and lets the caller specify a temperature to pass to gpt

# Method:
POST

# Request Header:
Authorization: Bearer <supabase-access-token>

# Request Body:
{
    "messages": <message_array_for_gpt>, # eg. `[ { "role": "system", "content": "Write me a poem" }, ... ]`
    "temperature": <float_between_0_and_1>
}
```

### /advanced-gpt-4o-mini-complete
```sh
# More complicated but allows full control over the prompts passed to ChatGPT.
# Does not support temperature, for that look for the v2 version of this endpoint.

# Method:
POST

# Request Header:
Authorization: Bearer <supabase-access-token>

# Request Body:
{
    "messages": <message_array_for_gpt>, # eg. `[ { "role": "system", "content": "Write me a poem" }, ... ]`
}
```

### /simple-gpt-4o-mini-complete
```sh
# For simple requests that fit in a query param.

# Method:
GET

# Request Parameters:
prompt=<query_for_chat_gpt> # eg. "Write me a poem"

# Request Header: 
Authorization: Bearer <supabase-access-token>
```

### /metrics
```sh
# Method:
GET
```

## Setup:

Place two .env files in the root directory of this project. The first should have the information for the 
**SkillSyncDev** supabase project and it should have the name `.env.sksndev`. The second should have the 
information for the **techskillsync** supabase project and it should have the name `.env.techsksn`.

Both .env files should have the following fields:
```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here
REDIS_URL=redis://:@redis-stack:6379
DAILY_LIMIT=50
ID_WHITE_LIST=[]
```

Now run `./both_up` to boot up both containers and `./both_down` to stop both containers.


## Testing:

There is a testing suite for both containers as well as the production endpoints. See the project in `test-gpt-broker` for more info.
