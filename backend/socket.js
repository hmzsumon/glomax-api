// socket.js

const http = require('http');
const io = require('socket.io');

// Export the io object instead of starting the server
const socketServer = http.createServer();
const socketIO = io(socketServer, {
	cors: {
		origin: ['https://glomax.vercel.app', 'https://glomax-admin.vercel.app'], // Replace with your allowed client-side domains
		methods: ['GET', 'POST'], // Update this to allow connections from specific origins only
	},
});

socketIO.on('connection', (socket) => {
	console.log('A user connected');

	// Handle custom events
	socket.on('chat message', (message) => {
		console.log('Received message:', message);
		// Broadcast the message to all connected clients
		socketIO.emit('chat message', message);
	});
	socket.join('test-room');

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// Make io available globally
global.io = socketIO;
module.exports = socketIO;
