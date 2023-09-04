// responseTimeMiddleware.js
const colors = require('@colors/colors');
function responseTimeMiddleware(req, res, next) {
	const startTime = Date.now();
	res.on('finish', () => {
		const endTime = Date.now();
		const responseTime = endTime - startTime;
		console.log(colors.magenta(`Response time: ${responseTime}ms`));
	});
	next();
}

module.exports = responseTimeMiddleware;
