const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const AdminNotification = require('../models/adminNotification');
const createTransaction = require('../utils/tnx');
const DepositDetails = require('../models/depositDetails');
const { sendEmail } = require('../utils/sendEmail');
const cloudinary = require('cloudinary');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const mongoose = require('mongoose');

// Create a new deposit
exports.createDeposit = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find DepositDetails
	let depositDetails = await DepositDetails.findOne({ user_id: req.user.id });
	if (!depositDetails) {
		// create new DepositDetails
		depositDetails = await DepositDetails.create({
			user_id: req.user.id,
			name: user.name,
			is_new: false,
		});
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// console.log(req.body);
	const { amount, transactionId, is_bonus } = req.body;

	// convert amount to number
	const numAmount = Number(amount);

	// // unique transactionId
	const isTransactionIdExist = await Deposit.findOne({ transactionId });
	if (isTransactionIdExist) {
		return next(new ErrorHandler('Transaction ID already exist', 405));
	}

	const newDeposit = await Deposit.create({
		user_id: user._id,
		customer_id: user.customer_id,
		name: user.name,
		phone: user.phone,
		amount: numAmount,
		transactionId,
		is_bonus,
	});

	// update deposit details
	if (user.is_newUser) {
		depositDetails.is_new = true;
		await depositDetails.save();
	}

	// update company balance
	company.deposit.new_deposit_amount += numAmount;
	company.deposit.new_deposit_count += 1;
	await company.save();

	// send notification to admin
	const adminNotification = await AdminNotification.create({
		subject: 'New Deposit Request',
		subject_id: newDeposit._id,
		username: user.name,
		message: `New deposit request of ${amount} from ${user.name}`,
		url: `/deposit/${newDeposit._id}`,
	});

	global.io.emit('notification', adminNotification);

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Deposit Request',
		message: `Dear ${user.name},\n\nYour deposit request of ${amount} has been received. We will confirm your deposit within 24 hours.\n\nThank you for choosing ${company.name}.`,
	});

	// send email to admin
	sendEmail({
		email: company.email,
		subject: 'New Deposit Request',
		message: `Dear Admin,\n\nA new deposit request of ${amount} has been received from ${user.name}.\n\nThank you for choosing ${company.name}.`,
	});
	res.status(201).json({
		success: true,
		message: 'Deposit request received successfully',
		deposit: newDeposit,
	});
});

// Get all deposits
exports.getAllDeposits = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (!user.role === 'manager' || !user.role === 'admin') {
		return next(
			new ErrorHandler('You are not authorized to access this route', 403)
		);
	}
	const deposits = await Deposit.find();

	res.status(200).json({
		success: true,
		deposits,
	});
});

// Get a single deposit
exports.getSingleDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}
	res.status(200).json({
		success: true,
		deposit,
	});
});

// Update a single deposit
exports.updateDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	res.status(200).json({
		success: true,
		deposit,
	});
});

// get logged in user's deposits
exports.getUserDeposits = catchAsyncErrors(async (req, res, next) => {
	const deposits = await Deposit.find({
		user_id: req.user._id,
		is_rejected: false,
	}).sort({ createdAt: -1 });
	res.status(200).json({
		success: true,
		deposits,
	});
});

// delete a single deposit
exports.deleteDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findByIdAndDelete(req.params.id);
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	res.status(204).json({
		success: true,
	});
});

// cancel a single deposit
exports.cancelDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	deposit.status = 'cancelled';
	deposit.cancelledAt = Date.now();
	await deposit.save();
	res.status(200).json({
		success: true,
	});
});

// delete all pending deposits
exports.deleteAllPendingDeposits = catchAsyncErrors(async (req, res, next) => {
	const pendingDeposits = await Deposit.find({ status: 'pending' });
	if (pendingDeposits.length === 0) {
		return next(new ErrorHandler('No pending deposits found', 404));
	}
	for (let i = 0; i < pendingDeposits.length; i++) {
		await pendingDeposits[i].remove();
	}
	res.status(200).json({
		success: true,
	});
});

// approve a single deposit
exports.approveDeposit = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = req.user;
	if (!admin) {
		return next(new ErrorHandler('No admin found with that ID', 404));
	}
	// check if admin or manager is authorized
	if (!admin.role === 'admin' || !admin.role === 'manager') {
		return next(
			new ErrorHandler('You are not authorized to approve deposits', 403)
		);
	}
	// find deposit
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}

	// find user
	const user = await User.findById(deposit.user_id);
	if (!user) {
		return next(new ErrorHandler('No user found with that ID', 404));
	}

	// find DepositDetails
	const depositDetails = await DepositDetails.findOne({ user_id: user._id });
	if (!depositDetails) {
		return next(new ErrorHandler('Deposit details not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	//update deposit details
	deposit.status = 'approved';
	deposit.approvedAt = Date.now();
	deposit.approved_by = admin.name;
	deposit.approvedAt = Date.now();
	deposit.is_approved = true;
	deposit.comment = 'Approved by admin';
	deposit.update_by = admin._id;
	await deposit.save();

	// update user
	user.m_balance += deposit.amount;
	createTransaction(
		user._id,
		'cashIn',
		deposit.amount,
		'deposit',
		'Approved Deposit'
	);

	let totalCost = 0;

	if (deposit.amount >= 50 && deposit.is_bonus === true) {
		user.b_balance += deposit.amount * 0.1;
		user.m_balance += deposit.amount * 0.1;
		user.trading_volume += deposit.amount * 0.1 * 5;
		console.log('trading_volume', deposit.amount * 0.1 * 5);
		createTransaction(
			user._id,
			'cashIn',
			deposit.amount * 0.1,
			'bonus',
			'First Deposit Bonus'
		);
		totalCost += deposit.amount * 0.1;
	}

	if (user.is_newUser) {
		console.log('new user');
		depositDetails.first_deposit_amount += deposit.amount;
		depositDetails.first_deposit_date = Date.now();
		depositDetails.s_bonus += 2;
		depositDetails.is_new = false;

		// find parent_1
		const sponsor = await User.findOne({
			customer_id: user.parent_1.customer_id,
		});

		if (!sponsor) {
			return next(new ErrorHandler('Sponsor not found', 404));
		}

		// update sponsor
		sponsor.m_balance += 2;
		sponsor.b_balance += 2;
		sponsor.referral_bonus += 2;
		createTransaction(
			sponsor._id,
			'cashIn',
			2,
			'bonus',
			`Referral Bonus from ${user.name}`
		);
		await sponsor.save();
		totalCost += 2;
		// update user
		user.is_newUser = false;
		user.is_active = true;
		company.cost.referral_bonus_cost += 2;
		company.users.total_active_users += 1;
		company.users.new_users -= 1;
	}

	// update deposit details
	depositDetails.total_deposit += deposit.amount;
	depositDetails.last_deposit_amount += deposit.amount;
	depositDetails.last_deposit_date = Date.now();
	await depositDetails.save();
	await user.save();

	// update company balance
	company.deposit.new_deposit_amount -= deposit.amount;
	company.deposit.new_deposit_count -= 1;
	company.deposit.total_deposit_amount += deposit.amount;
	company.deposit.total_deposit_count += 1;
	company.deposit.total_d_bonus += totalCost;
	company.cost.total_cost += totalCost;
	await company.save();

	console.log('totalCost', totalCost);

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Deposit Approved',
		message: `Dear ${user.name},\n\nYour deposit of ${deposit.amount} has been approved.\n\nThank you for choosing ${company.name}.`,
	});

	// send email to admin
	sendEmail({
		email: company.email,
		subject: 'Deposit Approved',
		message: `Dear ${admin.name},\n\n${user.name} deposit of ${deposit.amount} has been approved.\n\nThank you for choosing ${company.name}.`,
	});
	res.status(200).json({
		success: true,
		message: 'Deposit approved',
	});
});

// reject a single deposit
exports.rejectDeposit = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHandler('No admin found with that ID', 404));
	}
	// find deposit
	// console.log(req.body);
	const deposit = await Deposit.findById(req.body.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}

	// find user
	const user = await User.findById(deposit.user_id);
	if (!user) {
		return next(new ErrorHandler('No user found with that ID', 404));
	}

	// find DepositDetails
	const depositDetails = await DepositDetails.findOne({ user_id: user._id });
	if (!depositDetails) {
		return next(new ErrorHandler('Deposit details not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	//update deposit
	deposit.status = 'rejected';
	deposit.is_rejected = true;
	deposit.reason = req.body.reason;
	deposit.comment = req.body.reason;
	deposit.rejectedAt = Date.now();
	deposit.rejected_by = admin.name;
	deposit.update.update_by = admin._id;
	await deposit.save();

	// update deposit details
	depositDetails.rejected_amount += deposit.amount;
	depositDetails.rejected_count += 1;
	if (depositDetails.rejected_count > 3) {
		user.is_active = false;
		await user.save();
	}
	await depositDetails.save();

	// update company balance
	company.deposit.new_deposit_amount -= deposit.amount;
	company.deposit.new_deposit_count -= 1;
	company.deposit.rejectedDepositAmount += deposit.amount;
	company.deposit.rejectedDepositCount += 1;
	await company.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Deposit Rejected',
		message: `Dear ${user.name},\n\nYour deposit of ${deposit.amount} has been rejected.\n\nReason: ${req.body.reason}\n\nThank you for choosing ${company.name}.`,
	});

	// send email to admin
	sendEmail({
		email: company.email,
		subject: 'Deposit Rejected',
		message: `Dear ${admin.name},\n\n${user.name} deposit of ${deposit.amount} has been rejected.\n\nReason: ${req.body.reason}\n\nThank you for choosing ${company.name}.`,
	});

	res.status(200).json({
		success: true,
		message: 'Deposit rejected',
	});
});
