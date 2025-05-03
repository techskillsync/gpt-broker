import client from 'prom-client'
const register = new client.Registry()

const totalRequests = new client.Counter({
	name: 'gpt_broker_requests_total',
	help: 'Number of requests made to gpt-broker',
	labelNames: ['method', 'status_code'],
})

const successfulRequests = new client.Counter({
	name: 'gpt_broker_valid_requests',
	help: 'The number of requests that passed security and queried GPT',
	labelNames: ['method', 'status_code']
})

const failedRequests = new client.Counter({
	name: 'gpt_broker_failed_requests',
	help: 'The number of requests that failed security checks',
	labelNames: ['method', 'status_code']
})

register.registerMetric(totalRequests);
register.registerMetric(successfulRequests);
register.registerMetric(failedRequests);

export {
	register,
	totalRequests,
	successfulRequests,
	failedRequests,
}

