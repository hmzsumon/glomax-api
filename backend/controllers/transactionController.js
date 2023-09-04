const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHander = require('../utils/errorhander');
const Transaction = require('./../models/transaction');
const User = require('./../models/userModel');

const { sendMe, sendEmail } = require('../utils/sendEmail');
const createTransaction = require('../utils/tnx');

exports.createTransaction = catchAsyncErrors(async (req, res, next) => {
	let {
		amount,
		currency,
		paymentStatus,
		transactionType,
		coin_price,
		recipient_id,
		total_amount,
		fee,
	} = req.body;
	const userId = req.user._id;

	const sender = await User.findById(userId);
	const recipient = await User.findOne({ customer_id: recipient_id });
	if (!recipient) {
		return new ErrorHander(400, 'Recipient not found');
	}
	let sponsor_user = await User.findById(recipient.sponsor_id);

	const pxcPrices = await PxcPrice.find();
	let priceLength = pxcPrices.length;
	const currentPrice = await pxcPrices[priceLength - 1].price;

	// let recipientUserId = {};

	const transaction = await Transaction.create({
		amount,
		currency,
		paymentStatus,
		transactionType,
		fee,
		total_amount,
		author: userId,
		recipient: recipient._id,
	});

	if (transaction.transactionType === 'transfer') {
		let pxc = Number(amount / coin_price);
		sender.balance = sender.balance - total_amount;
		sender.transactions.push(transaction._id);
		sender.pxc_balance = sender.pxc_balance - total_amount;

		if (sponsor_user && recipient.transactions.length === 0) {
			let pxc = 5 / currentPrice;

			sponsor_user.balance = sponsor_user.balance + 5;
			sponsor_user.pxc_balance = sponsor_user.pxc_balance + pxc;
			sponsor_user.referral_token = sponsor_user.referral_token + 5;
			sponsor_user.referal_users.push(recipient._id);
			await sponsor_user.save();
		}

		if (recipient.transactions.length === 0) {
			let pxc = Number(10 / coin_price);
			recipient.balance = recipient.balance + 10;
			recipient.pxc_balance = recipient.pxc_balance + pxc;
			recipient.sinUp_bonus = 0;
			await recipient.save();
		}

		recipient.balance = recipient.balance + transaction.amount;
		recipient.pxc_balance = recipient.pxc_balance + pxc;
		recipient.transactions.push(transaction._id);
		recipientUserId = recipient._id;

		await sender.save();
		await recipient.save();
	}

	if (transaction.transactionType === 'deposit') {
		const recipient = await User.findOne({ customer_id: recipient_id });
		// console.log(recipient);
		if (!recipient) {
			return res.status(404).json({
				status: 'failed',
				message: 'Recipient not found',
			});
		}

		let pxc = transaction.amount / coin_price;
		recipient.balance = recipient.balance + transaction.amount;
		recipient.pxc_balance = recipient.pxc_balance + pxc;
		recipient.transactions.push(transaction._id);
		await recipient.save();
	}

	await sendMe({
		subject: `${transactionType}`,
		message: `TransactionId: ${transaction._id}, Amount: ${transaction.amount} \n Sender: ${sender.name}, Recipient: ${recipient.name}`,
	});
	res.status(201).json({
		success: true,
		transaction,
		userId,
	});
});

// convert transaction
exports.convertTransaction = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	const pxcPrices = await PxcPrice.find();
	let priceLength = pxcPrices.length;
	const currentPrice = await pxcPrices[priceLength - 1].price;

	let token = user.referral_token;

	let tokenAmount = Number(req.body.token_amount);
	// console.log(typeof tokenAmount);

	if (tokenAmount > token) {
		return res.status(400).json({
			status: 'failed',
			message: 'You do not have enough referral tokens',
		});
	}

	let usd_amount = tokenAmount * 0.005;
	let remaining_usd_amount = usd_amount - 20;
	let pxc_amount = remaining_usd_amount / currentPrice;

	user.referral_token = token - tokenAmount;
	user.balance = user.balance + remaining_usd_amount;
	user.pxc_balance = user.pxc_balance + pxc_amount;

	user.transactions.push(req.body.transaction_id);
	await user.save();

	const transaction = await Transaction.create({
		referral_token: tokenAmount,
		pxc_amount,
		usd_amount,
		currency: 'USD',
		paymentStatus: 'paid',
		transactionType: 'convert',
		fee: 20,
		author: req.user._id,
	});

	res.status(200).json({
		success: true,
		user,
	});
});

// get all transactions
exports.getAllTransactions = catchAsyncErrors(async (req, res, next) => {
	const transactions = await Transaction.find({});
	res.status(200).json({
		success: true,
		transactions,
	});
});

// get single transaction
exports.getSingleTransaction = catchAsyncErrors(async (req, res, next) => {
	const transaction = await Transaction.findById(req.params.id)
		.populate('author', '-password', 'name email')
		.populate('recipient', '-password', 'name email');
	if (!transaction) {
		return new ErrorHander(404, 'Transaction not found');
	}
	res.status(200).json({
		success: true,
		transaction,
	});
});

// get logged in user transactions
exports.getUserTransactions = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const send = await Transaction.find({
		author: userId,
	});

	const receive = await Transaction.find({
		recipient: userId,
	})
		.populate(
			'author',
			'-transactions -avatar -password  -phone -address -balance -pxc_balance -sponsor_id -referral_token -referal_users -createdAt -updatedAt '
		)
		.populate(
			'recipient',
			'-transactions -avatar -password -email  -phone -address -balance -pxc_balance -sponsor_id -referral_token -referal_users -createdAt -updatedAt'
		);
	let totalTransactions = (await send.length) + receive.length;
	res.status(200).json({
		success: true,
		totalTransactions,
		transactions: {
			send,
			receive,
		},
	});
});

// get all transactions total a
exports.getAllTransactionsTotal = catchAsyncErrors(async (req, res, next) => {
	const transactions = await Transaction.find({});
	let totalTransactions = transactions.length;
	let totalAmount = 0;
	transactions.forEach((transaction) => {
		totalAmount = totalAmount + transaction.amount;
	});
	res.status(200).json({
		success: true,
		totalTransactions,
		totalAmount,
	});
});

// get all transactions total a by user
exports.getUserTransactionsTotal = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const transactions = await Transaction.find({ author: userId });
	let totalTransactions = transactions.length;
	let totalAmount = 0;
	transactions.forEach((transaction) => {
		totalAmount = totalAmount + transaction.amount;
	});
	res.status(200).json({
		success: true,
		totalTransactions,
		totalAmount,
	});
});

// send money
exports.sendMoney = catchAsyncErrors(async (req, res, next) => {
	// coin price
	const prices = await PxcPrice.find().sort({ _id: -1 }).limit(1);
	const currentPrice = prices[0].price;

	// sender
	const sender = await User.findById(req.user._id);
	if (!sender) {
		return new ErrorHander('Sender not found', 404);
	}

	// recipient
	const recipientId = req.body.recipientId;
	// check recipient it self
	if (sender.customer_id === recipientId) {
		return next(new ErrorHander('You cannot send money to yourself', 400));
	}
	// console.log(recipientId);
	const recipient = await User.findOne({ customer_id: recipientId });
	if (!recipient) {
		return next(new ErrorHander('Recipient not found', 404));
	}

	// amount
	const amount = Number(req.body.amount);

	// fee
	const fee = Number(amount * 0.005);

	// total amount
	const totalAmount = amount + fee;

	// pxc amount
	const pxcAmount = amount / currentPrice;

	// pxc fee
	const pxcFee = pxcAmount * 0.005;

	// pxc total amount
	const pxcTotalAmount = pxcAmount + pxcFee;

	// console.log(totalAmount, fee);
	// check if sender has enough balance
	if (sender.balance < totalAmount) {
		return next(new ErrorHander('You do not have enough balance', 400));
	}

	// check if sender has enough pxc balance
	if (sender.pxc_balance < pxcTotalAmount) {
		return next(new ErrorHander('You do not have enough pxc balance', 400));
	}

	//  update sender balance
	if (sender.role === 'merchant') {
		let merchantProfit = totalAmount * 0.15;
		sender.balance = sender.balance - amount;
		sender.pxc_balance = sender.pxc_balance - pxcTotalAmount;
		sender.merchant_profit = sender.merchant_profit + merchantProfit;
	} else {
		sender.balance = sender.balance - totalAmount;
		sender.pxc_balance = sender.pxc_balance - pxcTotalAmount;
		createTransaction(
			sender._id,
			'cashOut',
			totalAmount,
			'send',
			`Send Money to ${recipient.name}`
		);
	}

	await sender.save();

	//  update recipient balance
	recipient.balance = recipient.balance + amount;
	recipient.pxc_balance = recipient.pxc_balance + pxcAmount;
	createTransaction(
		recipient._id,
		'cashIn',
		amount,
		'receive',
		`Receive Money from ${sender.name}`
	);
	await recipient.save();

	res.status(200).json({
		success: true,
		message: 'Transaction successful',
	});
});

// get login user transactions
exports.getLoginUserTransactions = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const transactions = await Transaction.find({ userId });
	res.status(200).json({
		success: true,
		transactions,
	});
});
