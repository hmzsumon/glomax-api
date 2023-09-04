const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const AdminWinner = require('../models/adminWinner');
const cron = require('node-cron');

// Create a new winner
exports.createWinner = catchAsyncErrors(async (req, res, next) => {
	const { game_id, period_no, game_type, winner } = req.body;

	const adminWinner = await AdminWinner.create({
		game_id,
		period_no,
		game_type,
		winner,
	});

	res.status(201).json({
		success: true,
		adminWinner,
	});
});
