import 'dotenv/config';
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import { router } from './src/routes.js';
import { updateMetrics } from './src/middleware.js';

const app = new Koa();

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

const PORT = 5002;
app.listen(PORT, () => {
	console.log(` - 💼 GPT Broker running on port ${PORT}`)
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(' - 🚪 GPT Broker stopping')
    process.exit(0);
});
