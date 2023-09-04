const app = require('./app');
const cloudinary = require('cloudinary');
const connectDB = require('./config/db');
const http = require('http');
const server = http.createServer(app);
const socketIO = require('./socket');

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Uncaught Exception`);
	process.exit(1);
});

// Config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	require('dotenv').config({ path: 'backend/config/config.env' });
}

// Database connection
connectDB();

// Cloudinary config
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Socket.io
// io.on('connection', (socket) => {
// 	console.log('A user connected', socket.id);

// 	// Handle custom events
// 	socket.on('chat message', (message) => {
// 		console.log('Received message:', message);
// 		// Broadcast the message to all connected clients
// 		io.emit('chat message', message);
// 	});

// 	socket.join('clock-room');

// 	// Handle disconnection
// 	socket.on('disconnect', () => {
// 		console.log('User disconnected');
// 	});
// });

// Start the server
const port = process.env.PORT || 5000; // Use the environment variable PORT if available, otherwise
const httpServer = server.listen(port, () => {
	console.log(`Server is working on http://localhost:${port}`);
});

// Use the same http server to listen for Socket.IO connections
socketIO.attach(httpServer);

global.io = socketIO;

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Unhandled Promise Rejection`);

	httpServer.close(() => {
		process.exit(1);
	});
});
