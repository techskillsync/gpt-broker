import { config } from 'dotenv';
import { spawnSync } from 'child_process';

const configs = [
	'.env.sksndev',
	'.env.sksndev_prod',
	'.env.techsksn',
	'.env.techsksn_prod'
];

for (const env of configs) {
	console.log(`Running tests with config ${env}`)

	config({ path: env, override: true })

	const result =spawnSync('npx', ['mocha', 'EndToEnd.js', '--timeout', '15000'], {
		stdio: 'inherit',
		env: { ...process.env }
	})

	if (result.status !== 0) {
		console.error(`test failed for ${env}`)
	}
}
