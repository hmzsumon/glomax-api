const Bull = require('bull');

const tradeQueue = new Bull('trade', 'redis://127.0.0.1:6379');

// Process tasks from the queue
tradeQueue.process(async () => {
	console.log('Processing trade queue');
	// This will be executed after the delay
	await updateTrade();
});

module.exports = tradeQueue;
