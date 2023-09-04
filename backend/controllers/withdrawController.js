const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const createTransaction = require('../utils/tnx');

const WithdrawDetails = require('../models/withdrawDetailsModel');
const Company = require('../models/companyModel');

const companyId = process.env.COMPANY_ID;
const Notification = require('../models/notificationModel');
const { sendEmail } = require('../utils/sendEmail');
const Withdraw = require('../models/withdraw');

// Create new withdraw request => /api/v1/withdraw/new
exports.newWithdrawRequest = catchAsyncErrors(async (req, res, next) => {
	const { amount, method_name, number } = req.body;

	const numAmount = Number(amount);
	const charge = numAmount * 0.1;
	const net_amount = numAmount - charge;
	// find user
	const user = await User.findById(req.user.id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// check if user is_active
	if (!user.is_active) {
		return next(new ErrorHander('User is not active', 400));
	}

	// check if user has enough balance
	if (user.w_balance < numAmount) {
		return next(new ErrorHander('Insufficient balance', 400));
	}

	// check if user has pending withdraw request
	const pendingWithdraw = await Withdraw.findOne({
		user_id: req.user.id,
		status: 'pending',
	});

	if (pendingWithdraw) {
		return next(
			new ErrorHander(
				"You have a pending withdraw request. You can't create a new one",
				902
			)
		);
	}

	// find wihdraw details
	const withdrawDetails = await WithdrawDetails.findOne({
		user_id: req.user.id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		await WithdrawDetails.create({
			user_id: req.user.id,
			name: user.name,
			phone: user.phone,
		});

		return next(
			new ErrorHander('Something went wrong. Please try again!', 901)
		);
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// user balance
	user.w_balance = user.w_balance - numAmount;
	createTransaction(
		user._id,
		'cashOut',
		numAmount,
		'withdraw',
		`Withdraw of ${numAmount}`
	);
	user.is_withdraw_requested = true;

	// create new withdraw request
	const withdraw = await Withdraw.create({
		user_id: req.user.id,
		name: user.name,
		phone: user.phone,
		email: user.email,
		amount: numAmount,
		net_amount,
		charge,
		method: {
			name: method_name,
			number,
		},
	});
	await user.save();

	// update company balance
	company.withdraw.new_withdraw += numAmount;
	company.withdraw.pending_withdraw_count += 1;
	await company.save();

	// send email
	sendEmail({
		email: user.email,
		subject: 'Withdraw request created',
		message: `Dear ${user.name},\n\nYour withdraw request of ${numAmount} was created successfully. Please wait for the admin to approve your request.\n\nRegards,\n${company.name}`,
	});

	// send email to admin
	sendEmail({
		email: company.email,
		subject: 'New withdraw request',
		message: `Dear ${company.name},\n\\nA new withdraw request of ${numAmount} was created by ${user.name}. Please login to your dashboard to approve the request.\n\\nRegards,\n${company.name}`,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request created successfully',
		withdraw,
	});
});

// get logged in user withdraw requests => /api/v1/withdraw/requests
exports.myWithdraws = catchAsyncErrors(async (req, res, next) => {
	const withdraws = await Withdraw.find({ user_id: req.user.id });
	if (!withdraws) {
		return next(new ErrorHander('Withdraw requests not found', 404));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({
		user_id: req.user.id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		await WithdrawDetails.create({
			user_id: req.user.id,
			name: req.user.name,
			phone: req.user.phone,
		});

		return next(
			new ErrorHander('Something went wrong. Please try again!', 901)
		);
	}

	res.status(200).json({
		success: true,
		withdraws,
		withdrawDetails,
	});
});

// get a single withdraw request => /api/v1/withdraw/:id
exports.getWithdraw = catchAsyncErrors(async (req, res, next) => {
	const withdraw = await Withdraw.findById(req.params.id);
	if (!withdraw) {
		return next(new ErrorHander('Withdraw request not found', 404));
	}

	res.status(200).json({
		success: true,
		withdraw,
	});
});

// get all withdraw requests => /api/v1/admin/withdraws
exports.allWithdraws = catchAsyncErrors(async (req, res, next) => {
	const withdraws = await Withdraw.find();
	if (!withdraws) {
		return next(new ErrorHander('Withdraw requests not found', 404));
	}

	res.status(200).json({
		success: true,
		withdraws,
	});
});

// get single withdraw for admin and manager => /api/v1/admin/withdraw/:id
exports.getWithdrawForAdmin = catchAsyncErrors(async (req, res, next) => {
	const withdraw = await Withdraw.findById(req.params.id);
	if (!withdraw) {
		return next(new ErrorHander('Withdraw request not found', 404));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({
		user_id: withdraw.user_id,
	});

	res.status(200).json({
		success: true,
		withdraw,
		withdrawDetails,
	});
});

// approve withdraw request => /api/v1/admin/withdraw/:id/approve
exports.approveWithdraw = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}

	// find withdraw request
	const withdraw = await Withdraw.findById(req.body.id);
	if (!withdraw) {
		return next(new ErrorHander('Withdraw request not found', 404));
	}

	// check if withdraw request is already approved
	if (withdraw.is_approved) {
		return next(new ErrorHander('Withdraw request already approved', 400));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({
		user_id: withdraw.user_id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		await WithdrawDetails.create({
			user_id: withdraw.user_id,
			name: withdraw.name,
			phone: withdraw.phone,
		});

		return next(
			new ErrorHander('Something went wrong. Please try again!', 901)
		);
	}
	// find user
	const user = await User.findById(withdraw.user_id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// update withdraw request
	withdraw.is_approved = true;
	withdraw.approved_by = admin._id;
	withdraw.approved_at = Date.now();
	withdraw.status = 'approved';
	withdraw.approved_method = {
		name: req.body.methodName,
		number: req.body.number,
		tnx_id: req.body.tnxId,
	};
	await withdraw.save();

	// update user balance
	user.is_withdraw_requested = false;
	await user.save();

	// update withdraw details
	withdrawDetails.total_withdraw += withdraw.amount;
	withdrawDetails.last_withdraw_amount = withdraw.amount;
	withdrawDetails.last_withdraw_date = Date.now();
	await withdrawDetails.save();

	// update company balance
	company.withdraw.totalWithdraw += withdraw.amount;
	company.withdraw.totalWithdrawCount += 1;
	company.withdraw.todayWithdraw += withdraw.amount;
	company.withdraw.total_w_charge += withdraw.charge;
	company.withdraw.new_withdraw -= withdraw.amount;
	company.withdraw.pending_withdraw_count -= 1;
	company.withdraw.withdraw_charge += withdraw.charge;
	company.withdraw.total_income -= withdraw.amount;
	await company.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Withdraw request approved',
		message: `Dear ${user.name},\n\nYour withdraw request of ${withdraw.amount} has been approved.\n\nThank you.\n\nBest regards,\n${company.name}`,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request approved successfully',
	});
});

// cancel withdraw request => /api/v1/admin/withdraw/:id/cancel
exports.cancelWithdraw = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}

	// find withdraw request
	const withdraw = await Withdraw.findById(req.body.id);
	if (!withdraw) {
		return next(new ErrorHander('Withdraw request not found', 404));
	}

	// check if withdraw request is already approved
	if (withdraw.is_cancelled) {
		return next(new ErrorHander('Withdraw request already approved', 400));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({
		user_id: withdraw.user_id,
	});

	if (!withdrawDetails) {
		return next(
			new ErrorHander('Something went wrong. Please try again!', 901)
		);
	}
	// find user
	const user = await User.findById(withdraw.user_id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// update withdraw request
	withdraw.is_cancelled = true;
	withdraw.cancelled_by = admin._id;
	withdraw.cancelled_at = Date.now();
	withdraw.status = 'cancelled';
	withdraw.cancelled_reason = req.body.reason;
	withdraw.comment = req.body.reason;
	await withdraw.save();

	// update user balance
	user.is_withdraw_requested = false;
	user.w_balance += withdraw.amount;
	createTransaction(
		user._id,
		'cashIn',
		withdraw.amount,
		'withdraw',
		`Withdraw request of ${numAmount} was cancelled`
	);

	await user.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Withdraw request cancelled',
		message: `Dear ${user.name},\n\nYour withdraw request of ${withdraw.amount} has been cancelled.\n\nReason: ${req.body.reason}\n\nThank you.\n\nBest regards,\n${company.name}`,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request cancelled successfully',
	});
});
