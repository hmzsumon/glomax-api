const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const createTransaction = require('../utils/tnx');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const Convert = require('../models/convertModel');
const ConvertRecord = require('../models/convertRecordModel');

// Convert
exports.convert = catchAsyncErrors(async (req, res, next) => {
	const { amount, from, to, id } = req.body;
	// console.log(req.body);
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (from === 'main' && user.m_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	if (from === 'ai' && user.ai_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// find convert record by user id
	const convertRecord = await ConvertRecord.findOne({ user_id: user._id });
	if (!convertRecord) {
		return next(new ErrorHandler('Convert record not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	const convert = await Convert.create({
		user_id: user._id,
		customer_id: user.customer_id,
		amount,
		from,
		to,
		status: 'success',
	});

	if (from === 'main') {
		user.m_balance -= amount;
		createTransaction(
			user._id,
			'cashOut',
			Number(amount),
			'convert',
			`Convert ${amount} from main to ai balance`
		);
		user.ai_balance += amount;
		convertRecord.main_to_ai_total += amount;
		convertRecord.total_convert += amount;
		convertRecord.last_convert = {
			date: Date.now(),
			amount,
			from,
		};

		company.total_main_balance -= amount;
		company.total_ai_balance += amount;
		company.total_convert += amount;
	} else {
		user.ai_balance -= amount;
		user.m_balance += amount;
		convertRecord.ai_to_main_total += amount;
		convertRecord.total_convert += amount;
		convertRecord.last_convert = {
			date: Date.now(),
			amount,
			from,
		};

		company.total_main_balance += amount;
		company.total_ai_balance -= amount;
		company.total_convert += amount;
	}

	await user.save();
	await convertRecord.save();
	await company.save();

	res.status(200).json({
		success: true,
		data: convert,
	});
});

// Get all convert
exports.getAllConvert = catchAsyncErrors(async (req, res, next) => {
	const convert = await Convert.find({ user_id: req.user.id }).sort({
		createdAt: -1,
	});

	res.status(200).json({
		success: true,
		data: convert,
	});
});

// create convert record fr all user
exports.createConvertRecord = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find({});

	// find existing convert record

	users.forEach(async (user) => {
		// find existing convert record
		const convertRecord = await ConvertRecord.findOne({ user_id: user._id });

		if (!convertRecord) {
			await ConvertRecord.create({
				user_id: user._id,
				customer_id: user.customer_id,
				username: user.username,
			});
		}
	});

	res.status(200).json({
		success: true,
		message: 'Convert record created',
	});
});

// Get all convert record by user id
exports.getAllConvertRecord = catchAsyncErrors(async (req, res, next) => {
	const records = await Convert.find({
		user_id: req.user._id,
	}).sort({
		createdAt: -1,
	});

	res.status(200).json({
		success: true,
		records,
	});
});
