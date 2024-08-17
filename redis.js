require('dotenv').config(); // Load environment variables

const redis = require('redis');

async function Connect() {

    const client = await redis.createClient({url: 'redis://:@localhost:8013'})
        .on('error', err => console.log('Redis Client Error', err))
        .connect();
    
    await client.set('key', '123');
    const value = await client.get('key');
    console.log('value = ' + value);
    await client.disconnect();
}

Connect();