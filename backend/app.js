const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const responseTimeMiddleware = require('./middleware/responseTimeMiddleware');

const errorMiddleware = require('./middleware/error');

// Config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	require('dotenv').config({ path: 'backend/config/config.env' });
}
if (process.env.NODE_ENV !== 'PRODUCTION') {
	app.use(responseTimeMiddleware);
}

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

// Route Imports
const company = require('./routes/companyRoute');
const user = require('./routes/userRoute');
const winGame = require('./routes/winGameRoute');
const convert = require('./routes/convertRoute');
const trade = require('./routes/tradeRoute');
const aiRobot = require('./routes/aiRobotRoute');
const deposit = require('./routes/depositRoute');
const notification = require('./routes/notificationRoute');
const adminWinner = require('./routes/adminWinnerRoute');

// Middleware for Errors
app.use('/api/v1', company);
app.use('/api/v1', user);
app.use('/api/v1', winGame);
app.use('/api/v1', convert);
app.use('/api/v1', trade);
app.use('/api/v1', aiRobot);
app.use('/api/v1', deposit);
app.use('/api/v1', notification);
app.use('/api/v1', adminWinner);

// app.get('/', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'index.html'));
// });

// test route
app.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'This is the root route of the Rapid Win API',
	});
});

app.use(errorMiddleware);

module.exports = app;
