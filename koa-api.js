require('dotenv').config(); // Load environment variables

const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const redis = require('redis');

const { router } = require('./src/routes');
const { updateMetrics } = require('./src/middleware')

// Create Redis connection
const client = redis.createClient({ url: process.env.REDIS_URL });
client.on('error', err => {console.error('Redis Client Error', err); });
(async () => { await client.connect(); })();

const app = new Koa();

app.context.redis = client;

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(updateMetrics)

// Routes
app.use(router.routes())
app.use(router.allowedMethods())

// Error handling for non-existent endpoints
app.use(async (ctx) => {
	console.log(' - 📭 user requested non-existent endpoint')
    ctx.status = 404;
    ctx.body = { error: 'Endpoint not found' };
});

const PORT = 8011;
app.listen(PORT, () => {
	console.log(` - 💼 GPT Broker running on port ${PORT}`)
});

// Close Redis connection when stopping the server
process.on('SIGINT', async () => {
    await app.context.redis.quit();
    console.log(' - 🚪 GPT Broker stopped & connection with redis was closed')
    process.exit(0);
});
