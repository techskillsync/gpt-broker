# test-gpt-broker

This is its own package, it requires its own .env and dependencies. 
test-gpt-broker will perform end to end testing on gpt-broker to make 
sure all of its functionality is there.

### To run tests:

Make sure there is a `.env` in this directory with:

~~~
SUPABASE_URL_ONE=<supabase_url_one>
SUPABASE_ANON_KEY_ONE=<supabase_anon_key_one>
SUPABASE_EMAIL_ONE=<supabase_email_one>
SUPABASE_PASSWORD_ONE=<supabase_password_one>

SUPABASE_URL_TWO=<supabase_url_two>
SUPABASE_ANON_KEY_TWO=<supabase_anon_key_two>
SUPABASE_EMAIL_TWO=<supabase_email_two>
SUPABASE_PASSWORD_TWO=<supabase_password_two>
~~~

Then run:  
~~~
pnpm i
pnpm test
~~~
