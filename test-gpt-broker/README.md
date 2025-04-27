# test-gpt-broker

This is its own package, it requires its own set of .env's and dependencies. 
test-gpt-broker will perform end to end testing on gpt-broker for both supabase
projects locally and on their production endpoints.

### To run tests:

Four .env's are required, all have the same keys but different values.

 1. `.env.sksndev` Values for the local container of the SkillSyncDev project running on port 8011
 2. `.env.sksndev_prod` Values for the production endpoint of the SkillSyncDev gpt-broker
 3. `.env.techsksn` Values for the local container of the techskillsync project running on port 8023
 4. `.env.techsksn` Values for the production endpoint of the techskillsync gpt-broker


All .env's must have the following values:

~~~
BASE_URL=<service_base_url>
SUPABASE_URL=<supabase_url>
SUPABASE_ANON_KEY=<supabase_anon_key>
SUPABASE_EMAIL=<admin@skillsync.work>
SUPABASE_PASSWORD=<supabase_account_password>
~~~

After the .env's are setup run the following to see the test resuts:
~~~
pnpm i
pnpm test
~~~

