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
const depositTemplate = require('../utils/templateD');
const UserNotification = require('../models/userNotification');
const TxId = require('../models/txIdModel');

// check tx_id match then approve deposit
async function checkTxIdMatch(id) {
	try {
		// find tx_id
		const txId = await TxId.findOne({ tx_id: id });
		if (!txId) {
			// throw new error
			return function () {
				console.log('tx_id not found');
			};
		}

		// find deposit by tx_id
		const deposit = await Deposit.findOne({ transactionId: txId.tx_id });
		if (!deposit) {
			return function () {
				console.log('deposit not found');
			};
		}

		// check if deposit is already approved
		if (deposit.status === 'approved') {
			return function () {
				console.log('deposit already approved');
			};
		}

		// check if deposit is already rejected
		if (deposit.status === 'rejected') {
			return function () {
				console.log('deposit already rejected');
			};
		}

		// find user
		const user = await User.findById(deposit.user_id);
		if (!user) {
			return function () {
				console.log('user not found');
			};
		}

		// find DepositDetails
		const depositDetails = await DepositDetails.findOne({ user_id: user._id });
		if (!depositDetails) {
			return function () {
				console.log('deposit details not found');
			};
		}

		// find parent 1
		const parent_1 = await User.findOne({
			customer_id: user.parent_1.customer_id,
		});
		if (!parent_1) {
			return function () {
				console.log('Invalid Invite Code!');
			};
		}

		// find parent 2 (parent_1's parent)
		const parent_2 = await User.findOne({
			customer_id: user.parent_2.customer_id,
		});
		if (!parent_2) {
			return function () {
				console.log('Parent Not Found(2)');
			};
		}

		// find parent 3 (parent_2's parent)
		const parent_3 = await User.findOne({
			customer_id: user.parent_3.customer_id,
		});
		if (!parent_3) {
			return function () {
				console.log('Invalid referral id');
			};
		}

		// find parent 4
		const parent_4 = await User.findOne({
			customer_id: user.parent_4.customer_id,
		});

		if (!parent_4) {
			return function () {
				console.log('Parent not Found(4)');
			};
		}

		// find parent 5
		const parent_5 = await User.findOne({
			customer_id: user.parent_5.customer_id,
		});
		if (!parent_5) {
			return function () {
				console.log('Parent not Found(5)');
			};
		}

		// find company
		const company = await Company.findById(companyId);
		if (!company) {
			return function () {
				console.log('Company not found');
			};
		}

		//update deposit details
		deposit.status = 'approved';
		deposit.approvedAt = Date.now();
		deposit.approved_by = 'Ai admin';
		deposit.approvedAt = Date.now();
		deposit.is_approved = true;
		deposit.comment = 'Approved by admin';
		deposit.update_by = 'Ai admin';
		deposit.is_demo = false;
		deposit.amount = txId.amount;
		await deposit.save();

		// update user
		user.is_deposit_requested = false;
		user.m_balance += txId.amount;
		user.is_can_withdraw = false;
		createTransaction(
			user._id,
			'cashIn',
			txId.amount,
			'deposit',
			`Deposit Success ${txId.amount}`
		);
		user.total_deposit += txId.amount;

		let totalCost = 0;
		let mainBalance = txId.amount;
		let tradingVolume = txId.amount * 0.1;

		if (deposit.amount >= 10 && deposit.is_bonus === true) {
			user.b_balance += txId.amount * 0.05;
			user.m_balance += txId.amount * 0.05;
			tradingVolume += txId.amount * 0.05 * 5;
			mainBalance += txId.amount * 0.05;
			// console.log('trading_volume', deposit.amount * 0.1 * 5);
			createTransaction(
				user._id,
				'cashIn',
				txId.amount * 0.05,
				'bonus',
				`Deposit Bonus from Glomax $${txId.amount * 0.05} & 
			increase trading volume 
			 ${txId.amount * 0.05 * 5} `
			);
			totalCost += txId.amount * 0.05;
			company.total_tarde_volume += txId.amount * 0.05 * 5;
		}

		if (user.is_newUser) {
			// console.log('new user', user.name);
			depositDetails.first_deposit_amount += txId.amount;
			depositDetails.first_deposit_date = Date.now();
			depositDetails.s_bonus += 2;
			depositDetails.is_new = false;

			// update sponsor
			parent_1.m_balance += 2;
			parent_1.b_balance += 2;
			parent_1.referral_bonus += 2;
			createTransaction(
				parent_1._id,
				'cashIn',
				2,
				'bonus',
				`Referral Bonus from Glomax by ${user.name}`
			);
			totalCost += 2;
			// update user
			user.is_newUser = false;
			user.is_active = true;
			company.cost.referral_bonus_cost += 2;
			company.users.total_active_users += 1;
			company.users.new_users -= 1;

			// console.log('new user p-1', parent_1.name);
		}

		// update deposit details
		depositDetails.total_deposit += txId.amount;
		depositDetails.last_deposit_amount += txId.amount;
		depositDetails.last_deposit_date = Date.now();
		await depositDetails.save();

		user.trading_volume += tradingVolume;
		await user.save();

		// update parent_1 m_balance 5% of deposit amount
		parent_1.m_balance += txId.amount * 0.05;
		parent_1.b_balance += txId.amount * 0.05;
		parent_1.referral_bonus += txId.amount * 0.05;
		totalCost += txId.amount * 0.05;
		createTransaction(
			parent_1._id,
			'cashIn',
			txId.amount * 0.05,
			'bonus',
			`1st Level Deposit Bonus from Glomax by ${user.name}`
		);
		await parent_1.save();

		// update parent_2 m_balance 3% of deposit amount
		parent_2.m_balance += txId.amount * 0.02;
		parent_2.b_balance += txId.amount * 0.02;
		parent_2.referral_bonus += txId.amount * 0.02;
		totalCost += deposit.amount * 0.02;
		createTransaction(
			parent_2._id,
			'cashIn',
			txId.amount * 0.02,
			'bonus',
			`2nd Level Deposit Bonus from Glomax by ${user.name}`
		);
		await parent_2.save();

		// update parent_3 m_balance 2% of deposit amount
		parent_3.m_balance += txId.amount * 0.01;
		parent_3.b_balance += txId.amount * 0.01;
		parent_3.referral_bonus += txId.amount * 0.01;
		totalCost += deposit.amount * 0.01;
		createTransaction(
			parent_3._id,
			'cashIn',
			txId.amount * 0.01,
			'bonus',
			`3rd Level Deposit Bonus from Glomax by ${user.name}`
		);
		await parent_3.save();

		// update parent_4 m_balance 1% of deposit amount
		parent_4.m_balance += txId.amount * 0.01;
		parent_4.b_balance += txId.amount * 0.01;
		parent_4.referral_bonus += txId.amount * 0.01;
		totalCost += txId.amount * 0.01;
		createTransaction(
			parent_4._id,
			'cashIn',
			txId.amount * 0.01,
			'bonus',
			`4th Level Deposit Bonus from Glomax by ${user.name}`
		);

		await parent_4.save();

		// update parent_5 m_balance 1% of deposit amount
		parent_5.m_balance += txId.amount * 0.01;
		parent_5.b_balance += txId.amount * 0.01;
		parent_5.referral_bonus += txId.amount * 0.01;
		totalCost += txId.amount * 0.01;
		createTransaction(
			parent_5._id,
			'cashIn',
			txId.amount * 0.01,
			'bonus',
			`5th Level Deposit Bonus from Glomax by ${user.name}`
		);
		await parent_5.save();

		// update company balance
		company.deposit.new_deposit_amount -= txId.amount;
		company.deposit.new_deposit_count -= 1;
		company.deposit.total_deposit_amount += txId.amount;
		company.deposit.total_deposit_count += 1;
		company.deposit.total_d_bonus += totalCost;
		company.cost.total_cost += totalCost;
		company.total_main_balance += mainBalance;
		await company.save();

		// send notification to user
		const userNotification = await UserNotification.create({
			user_id: user._id,
			subject: 'USDT Deposit Successful',
			description: `Your deposit of ${txId.amount} has been successful.`,
			url: `/deposits/${deposit._id}`,
		});

		global.io.emit('user-notification', userNotification);

		// update tx_id to is_approved = true
		txId.is_approved = true;
		await txId.save();
		console.log('tx_id approved');

		const html = depositTemplate(
			user.name,
			txId.amount,
			user.m_balance,
			deposit._id
		);

		// send email to user
		sendEmail({
			email: user.email,
			subject: 'Deposit Approved',
			html,
		});
	} catch (error) {
		console.log('error from checkTxIdMatch', error);
		throw error;
	}
}

// Create a new deposit
exports.createDeposit = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// check user is_blocked
	if (user.is_block) {
		return next(new ErrorHandler('You are blocked', 403));
	}

	// check if user is is_deposit_requested
	if (user.is_deposit_requested) {
		return next(new ErrorHandler('Deposit already requested', 400));
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

	// sl_no for deposit
	const sl_no = (await Deposit.countDocuments({})) + 1;

	const newDeposit = await Deposit.create({
		user_id: user._id,
		customer_id: user.customer_id,
		name: user.name,
		phone: user.phone,
		amount: numAmount,
		transactionId,
		is_bonus,
		sl_no,
	});

	// update user is_deposit_requested
	user.is_deposit_requested = true;
	await user.save();

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
		type: 'deposit',
		username: user.name,
		message: `New deposit request of ${amount} from ${user.name}`,
		url: `/deposit/${newDeposit._id}`,
	});

	global.io.emit('notification', adminNotification);

	// for update deposit
	checkTxIdMatch(transactionId);

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
		is_approved: true,
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
	// console.log(req.body);

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
	const deposit = await Deposit.findById(req.body.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}

	// check if deposit is already approved
	if (deposit.status === 'approved') {
		return next(new ErrorHandler('Deposit already approved', 400));
	}

	// check if deposit is already rejected
	if (deposit.status === 'rejected') {
		return next(new ErrorHandler('Deposit already rejected', 400));
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

	// find parent 1
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	});
	if (!parent_1) {
		return next(new ErrorHandler('Invalid Invite Code!', 400));
	}

	// find parent 2 (parent_1's parent)
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	});
	if (!parent_2) {
		return next(new ErrorHandler('Parent Not Found(2)', 400));
	}

	// find parent 3 (parent_2's parent)
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	});
	if (!parent_3) {
		return next(new ErrorHandler('Invalid referral id', 400));
	}

	// find parent 4
	const parent_4 = await User.findOne({
		customer_id: user.parent_4.customer_id,
	});

	if (!parent_4) {
		return next(new ErrorHandler('Parent not Found(4)', 400));
	}

	// find parent 5
	const parent_5 = await User.findOne({
		customer_id: user.parent_5.customer_id,
	});
	if (!parent_5) {
		return next(new ErrorHandler('Parent not Found(5)', 400));
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
	deposit.is_demo = req.body.is_demo;
	await deposit.save();

	// update user
	user.is_deposit_requested = false;
	user.m_balance += deposit.amount;
	user.is_can_withdraw = false;
	createTransaction(
		user._id,
		'cashIn',
		deposit.amount,
		'deposit',
		`Deposit Success ${deposit.amount}`
	);
	user.total_deposit += deposit.amount;

	let totalCost = 0;
	let mainBalance = deposit.amount;
	let tradingVolume = deposit.amount * 0.1;

	if (deposit.amount >= 10 && deposit.is_bonus === true) {
		user.b_balance += deposit.amount * 0.05;
		user.m_balance += deposit.amount * 0.05;
		tradingVolume += deposit.amount * 0.05 * 5;
		mainBalance += deposit.amount * 0.05;
		// console.log('trading_volume', deposit.amount * 0.1 * 5);
		createTransaction(
			user._id,
			'cashIn',
			deposit.amount * 0.05,
			'bonus',
			`Deposit Bonus from Glomax $${deposit.amount * 0.05} & 
			increase trading volume 
			 ${deposit.amount * 0.05 * 5} `
		);
		totalCost += deposit.amount * 0.05;
		company.total_tarde_volume += deposit.amount * 0.05 * 5;
	}

	if (user.is_newUser) {
		// console.log('new user', user.name);
		depositDetails.first_deposit_amount += deposit.amount;
		depositDetails.first_deposit_date = Date.now();
		depositDetails.s_bonus += 2;
		depositDetails.is_new = false;

		// update sponsor
		parent_1.m_balance += 2;
		parent_1.b_balance += 2;
		parent_1.referral_bonus += 2;
		createTransaction(
			parent_1._id,
			'cashIn',
			2,
			'bonus',
			`Referral Bonus from Glomax by ${user.name}`
		);
		totalCost += 2;
		// update user
		user.is_newUser = false;
		user.is_active = true;
		company.cost.referral_bonus_cost += 2;
		company.users.total_active_users += 1;
		company.users.new_users -= 1;

		// console.log('new user p-1', parent_1.name);
	}

	// update deposit details
	depositDetails.total_deposit += deposit.amount;
	depositDetails.last_deposit_amount += deposit.amount;
	depositDetails.last_deposit_date = Date.now();
	await depositDetails.save();

	user.trading_volume += tradingVolume;
	await user.save();

	// update parent_1 m_balance 5% of deposit amount
	parent_1.m_balance += deposit.amount * 0.05;
	parent_1.b_balance += deposit.amount * 0.05;
	parent_1.referral_bonus += deposit.amount * 0.05;
	totalCost += deposit.amount * 0.05;
	createTransaction(
		parent_1._id,
		'cashIn',
		deposit.amount * 0.05,
		'bonus',
		`1st Level Deposit Bonus from Glomax by ${user.name}`
	);
	await parent_1.save();

	// update parent_2 m_balance 3% of deposit amount
	parent_2.m_balance += deposit.amount * 0.02;
	parent_2.b_balance += deposit.amount * 0.02;
	parent_2.referral_bonus += deposit.amount * 0.02;
	totalCost += deposit.amount * 0.02;
	createTransaction(
		parent_2._id,
		'cashIn',
		deposit.amount * 0.02,
		'bonus',
		`2nd Level Deposit Bonus from Glomax by ${user.name}`
	);
	await parent_2.save();

	// update parent_3 m_balance 2% of deposit amount
	parent_3.m_balance += deposit.amount * 0.01;
	parent_3.b_balance += deposit.amount * 0.01;
	parent_3.referral_bonus += deposit.amount * 0.01;
	totalCost += deposit.amount * 0.01;
	createTransaction(
		parent_3._id,
		'cashIn',
		deposit.amount * 0.01,
		'bonus',
		`3rd Level Deposit Bonus from Glomax by ${user.name}`
	);
	await parent_3.save();

	// update parent_4 m_balance 1% of deposit amount
	parent_4.m_balance += deposit.amount * 0.01;
	parent_4.b_balance += deposit.amount * 0.01;
	parent_4.referral_bonus += deposit.amount * 0.01;
	totalCost += deposit.amount * 0.01;
	createTransaction(
		parent_4._id,
		'cashIn',
		deposit.amount * 0.01,
		'bonus',
		`4th Level Deposit Bonus from Glomax by ${user.name}`
	);

	await parent_4.save();

	// update parent_5 m_balance 1% of deposit amount
	parent_5.m_balance += deposit.amount * 0.01;
	parent_5.b_balance += deposit.amount * 0.01;
	parent_5.referral_bonus += deposit.amount * 0.01;
	totalCost += deposit.amount * 0.01;
	createTransaction(
		parent_5._id,
		'cashIn',
		deposit.amount * 0.01,
		'bonus',
		`5th Level Deposit Bonus from Glomax by ${user.name}`
	);
	await parent_5.save();

	// update company balance
	company.deposit.new_deposit_amount -= deposit.amount;
	company.deposit.new_deposit_count -= 1;
	company.deposit.total_deposit_amount += deposit.amount;
	company.deposit.total_deposit_count += 1;
	company.deposit.total_d_bonus += totalCost;
	company.cost.total_cost += totalCost;
	company.total_main_balance += mainBalance;
	company.total_demo_deposit += req.body.is_demo ? deposit.amount : 0;
	await company.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'USDT Deposit Successful',
		description: `Your deposit of ${deposit.amount} has been successful.`,
		url: `/deposits/${deposit._id}`,
	});

	global.io.emit('user-notification', userNotification);

	const html = depositTemplate(
		user.name,
		deposit.amount,
		user.m_balance,
		deposit._id
	);

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Deposit Approved',
		html,
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

	//update user
	user.is_deposit_requested = false;
	await user.save();

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

	res.status(200).json({
		success: true,
		message: 'Deposit rejected',
	});
});

// add all deposits sl_no
exports.addSlNo = catchAsyncErrors(async (req, res, next) => {
	const deposits = await Deposit.find();
	for (let i = 0; i < deposits.length; i++) {
		deposits[i].sl_no = i + 1;
		await deposits[i].save();
	}
	res.status(200).json({
		success: true,
		message: 'Sl no added successfully',
	});
});

// get all deposits by transactionId start Demo lower  case or upper case
exports.getDepositByTransactionId = catchAsyncErrors(async (req, res, next) => {
	const deposits = await Deposit.find();

	console.log(deposits.length);

	// filter by transactionId start with Demo lower case or upper case
	const demoDeposit = deposits.filter((deposit) => {
		return deposit.transactionId.startsWith('demo');
	});

	// update all demo deposit is_demo = true
	for (let i = 0; i < demoDeposit.length; i++) {
		demoDeposit[i].is_demo = true;
		await demoDeposit[i].save();
	}

	res.status(200).json({
		success: true,
		demoDeposit,
	});
});

// add tx_id
exports.addTxId = catchAsyncErrors(async (req, res, next) => {
	const { txId, amount } = req.body;

	// check if tx_id already exist
	const exId = await TxId.findOne({ tx_id: txId });
	if (exId) {
		return next(new ErrorHandler('TxId already exist', 400));
	}

	if (!txId || !amount) {
		return next(new ErrorHandler('Please provide tx_id and amount', 400));
	}

	await TxId.create({
		tx_id: txId,
		amount,
	});

	// for update deposit
	checkTxIdMatch(txId);

	res.status(200).json({
		success: true,
		message: 'TxId added successfully',
	});
});

// get all tx_id
exports.getAllTxId = catchAsyncErrors(async (req, res, next) => {
	const txIds = await TxId.find({
		is_approved: false,
	});
	res.status(200).json({
		success: true,
		txIds,
	});
});
