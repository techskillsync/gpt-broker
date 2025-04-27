import { config } from 'dotenv';
import { spawnSync } from 'child_process';

const configs = [
	'.env.sksndev',
	'.env.sksndev_prod',
	'.env.techsksn',
	'.env.techsksn_prod'
];

const pnpm_check = spawnSync('pnpm', ['--version'], {
	stdio: 'pipe',
	encoding: 'utf-8'
});

if (pnpm_check.error) {
	console.error('❌ pnpm is not installed or not in PATH.');
	process.exit(1);
}


for (const env of configs) {
	console.log(`Running tests with config ${env}`)

	config({ path: env, override: true })

	const result =spawnSync('pnpm', ['mocha', 'EndToEnd.js', '--timeout', '15000'], {
		stdio: 'inherit',
		env: { ...process.env }
	})

	if (result.status !== 0) {
		console.error(`test failed for ${env}`)
	}
}
