const http = require('http');
const io = require('socket.io');

// Export the io object instead of starting the server
const socketServer = http.createServer();
const socketIO = io(socketServer, {
	transports: ['websocket', 'polling'],
	cors: {
		origin: [
			'https://glomax.vercel.app',
			'https://glomax-admin.vercel.app',
			'http://localhost:3000',
			'http://localhost:3001',
		], // Replace with your allowed client-side domains
		methods: ['GET', 'POST'], // Update this to allow connections from specific origins only
	},
});

socketIO.on('connection', (socket) => {
	console.log('A user connected');

	socket.join('game-room');

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// Make io available globally
global.io = socketIO;
module.exports = socketIO;
