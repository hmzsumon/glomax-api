const Queue = require('bull');
const path = require('path');
const { REDIS_URI, REDIS_PORT } = require('../config/redisCredential');

const emilQueue = new Queue('emailQueue', {
	redis: {
		host: REDIS_URI,
		port: REDIS_PORT,
	},
});

emilQueue.process(path.join(__dirname, 'emailProcessor.js'));

emilQueue.on('completed', (job, result) => {
	console.log(`Job with id ${job.id} completed`);
});
