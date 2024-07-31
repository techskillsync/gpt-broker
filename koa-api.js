require('dotenv').config(); // Load environment variables

const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const { router } = require('./src/routes')
const { checkSupabaseSession } = require('./src/middleware')

const app = new Koa();

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(checkSupabaseSession);

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
