const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const createTransaction = require('../utils/tnx');
const AiRobot = require('../models/aiRobotModel');
const AiRobotRecord = require('../models/aiRobotRecord');
const cron = require('node-cron');

// new aiRobot
exports.newAiRobot = catchAsyncErrors(async (req, res, next) => {
	const { investment, pair, grid_no, price_range, last_price, auto_create } =
		req.body;
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// console.log(req.body);
	// check if user al_balance is greater than investment
	if (user.al_balance < investment) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// find aiRobotRecord by user_id if not found create new
	let aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });
	if (!aiRobotRecord) {
		aiRobotRecord = await AiRobotRecord.create({
			user_id: user._id,
			customer_id: user.customer_id,
		});
	}

	// console.log(aiRobotRecord._id);

	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	const newAiRobot = await AiRobot.create({
		user_id: user._id,
		customer_id: user.customer_id,
		total_investment: investment,
		current_investment: investment,
		auto_create,
		pair,
		grid_no,
		price_range,
		profit_percent: '1.5% - 30%',
		last_price,
		open_time: Date.now(),
	});

	// update user balance
	user.ai_balance -= Number(investment);
	createTransaction(
		user._id,
		'cashOut',
		investment,
		'aiRobot',
		`Investment in Ai Robot`
	);
	user.ai_robot = true;
	await user.save();

	// update aiRobotRecord
	aiRobotRecord.active_robot_id = newAiRobot._id;
	aiRobotRecord.total_investment += Number(investment);
	aiRobotRecord.current_investment += Number(investment);
	aiRobotRecord.total_robot_count += 1;
	await aiRobotRecord.save();

	// update company balance
	company.total_ai_balance -= Number(investment);
	company.total_ai_robot_balance += Number(investment);
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Ai Robot created successfully',
		aiRobot: newAiRobot,
	});
});

// logged in user aiRobot
exports.loggedInUserAiRobot = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	const aiRobot = await AiRobot.findOne({ user_id: user._id, is_active: true });

	res.status(200).json({
		success: true,
		aiRobot,
	});
});

// cancel aiRobot
exports.cancelAiRobot = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find aiRobot is_active true
	const aiRobot = await AiRobot.findOne({ user_id: user._id, is_active: true });
	if (!aiRobot) {
		return next(new ErrorHandler('Ai Robot not found', 404));
	}

	// find aiRobotRecord by user_id
	const aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });
	if (!aiRobotRecord) {
		return next(new ErrorHandler('Ai Robot Record not found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	const cancel_charge = aiRobot.current_investment * 0.01;
	const refund_amount = aiRobot.current_investment - cancel_charge;

	// update user balance
	user.ai_balance = user.ai_balance + refund_amount;
	createTransaction(
		user._id,
		'cashIn',
		refund_amount,
		'aiRobot',
		`Ai Robot Cancelled`
	);
	user.ai_robot = false;
	await user.save();

	// update company balance
	company.total_ai_balance += refund_amount;
	company.income.ai_robot_income += cancel_charge;
	company.income.total_income += cancel_charge;
	company.total_ai_robot_balance -= aiRobot.current_investment;
	await company.save();

	// update aiRobot
	aiRobot.is_active = false;
	aiRobot.auto_create = false;
	aiRobot.close_time = Date.now();
	aiRobot.status = 'cancelled';
	aiRobot.cancel_charge = cancel_charge;
	aiRobot.refund_amount = refund_amount;
	await aiRobot.save();

	// update aiRobotRecord
	aiRobotRecord.active_robot_id = null;
	aiRobotRecord.current_investment -= aiRobot.current_investment;
	aiRobotRecord.total_investment -= aiRobot.current_investment;
	aiRobotRecord.t_cancel_robot += 1;
	aiRobotRecord.t_cancel_charge += cancel_charge;
	await aiRobotRecord.save();

	res.status(200).json({
		success: true,
		message: 'Ai Robot cancelled successfully',
		aiRobot,
	});
});

exports.editAiRobot = catchAsyncErrors(async (req, res, next) => {
	const {
		investment,
		pair,
		grid_no,
		price_range,
		last_price,
		robot_id,
		auto_create,
	} = req.body;
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// check if user al_balance is greater than investment
	if (user.al_balance < investment) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// find aiRobot robot_id
	const aiRobot = await AiRobot.findOne({ _id: robot_id, is_active: true });
	if (!aiRobot) {
		return next(new ErrorHandler('Ai Robot not found', 404));
	}

	// find aiRobotRecord by user_id
	const aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });
	if (!aiRobotRecord) {
		return next(new ErrorHandler('Ai Robot Record not found', 404));
	}

	// find difference between new investment and current investment
	const difference = Math.abs(aiRobot.current_investment - investment);

	if (investment > aiRobot.current_investment) {
		// update user balance
		user.ai_balance -= difference;
		createTransaction(
			user._id,
			'cashOut',
			difference,
			'aiRobot',
			`Investment in Ai Robot updated`
		);
		await user.save();
		// update aiRobotRecord
		aiRobotRecord.total_investment += difference;
		aiRobotRecord.current_investment += difference;
		await aiRobotRecord.save();
	} else {
		// update user balance
		user.ai_balance += difference;
		createTransaction(
			user._id,
			'cashIn',
			difference,
			'aiRobot',
			`Refund from Ai Robot updated`
		);
		await user.save();

		// update aiRobotRecord
		aiRobotRecord.total_investment -= difference;
		aiRobotRecord.current_investment -= difference;
		await aiRobotRecord.save();
	}

	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// update aiRobot
	aiRobot.total_investment = investment;
	aiRobot.current_investment = investment;
	aiRobot.pair = pair;
	aiRobot.grid_no = grid_no;
	aiRobot.price_range = price_range;
	aiRobot.last_price = last_price;
	aiRobot.open_time = Date.now();
	aiRobot.auto_create = auto_create;
	await aiRobot.save();

	// update company balance
	if (investment > aiRobot.current_investment) {
		company.total_ai_balance -= difference;
		company.total_ai_robot_balance += difference;
		await company.save();
	} else {
		company.total_ai_balance += difference;
		company.total_ai_robot_balance -= difference;
		await company.save();
	}

	res.status(200).json({
		success: true,
		message: 'Ai Robot updated successfully',
	});
});

// cron job for active aiRobot every 5 minutes
cron.schedule('*/5 * * * *', async () => {
	const aiRobots = await AiRobot.find({
		is_active: true,
	});

	// find company
	const company = await Company.findById(companyId).select('cost income ');

	// console.log(aiRobots.length);
	let profit = {
		1: 0.015,
		2: 0.016,
		3: 0.018,
	};

	for (let i = 4; i <= 170; i++) {
		profit[i] = 0.02;
	}

	for (let i = 0; i < aiRobots.length; i++) {
		const aiRobot = aiRobots[i];
		const age = Math.floor((Date.now() - aiRobot.open_time) / 60000);
		console.log(aiRobot.customer_id, age);
		if (age >= 5) {
			const profit_amount =
				aiRobot.current_investment * profit[aiRobot.grid_no];
			const aiRobotCharge = profit_amount * 0.02;
			const netProfit = profit_amount - aiRobotCharge;

			// find user
			const user = await User.findById(aiRobot.user_id).select(
				'ai_robot ai_balance m_balance username parent_1 parent_2 parent_3'
			);

			// find parent_1
			const parent_1 = await User.findOne({
				customer_id: user.parent_1.customer_id,
			}).select('trade_com m_balance username');

			// find parent_2
			const parent_2 = await User.findOne({
				customer_id: user.parent_2.customer_id,
			}).select('trade_com m_balance username');

			// find parent_3
			const parent_3 = await User.findOne({
				customer_id: user.parent_3.customer_id,
			}).select('trade_com m_balance username');

			// find aiRobotRecord by user_id
			const aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });

			// update user balance
			user.ai_robot = false;
			user.ai_balance += netProfit + aiRobot.current_investment;
			createTransaction(
				user._id,
				'cashIn',
				netProfit + aiRobot.current_investment,
				'aiRobot',
				`Profit from Ai Robot`
			);
			await user.save();

			// update parent_1 balance
			parent_1.m_balance += aiRobotCharge * 0.4;
			parent_1.trade_com.level_1 += aiRobotCharge * 0.4;
			createTransaction(
				parent_1._id,
				'cashIn',
				aiRobotCharge * 0.4,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_1.save();

			// update parent_2 balance
			parent_2.m_balance += aiRobotCharge * 0.3;
			parent_2.trade_com.level_2 += aiRobotCharge * 0.3;
			createTransaction(
				parent_2._id,
				'cashIn',
				aiRobotCharge * 0.3,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_2.save();

			// update parent_3 balance
			parent_3.m_balance += aiRobotCharge * 0.2;
			parent_3.trade_com.level_3 += aiRobotCharge * 0.2;
			createTransaction(
				parent_3._id,
				'cashIn',
				aiRobotCharge * 0.2,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_3.save();

			// update aiRobotRecord
			aiRobotRecord.active_robot_id = null;
			aiRobotRecord.current_investment -= aiRobot.current_investment;
			aiRobotRecord.total_profit += netProfit;
			aiRobotRecord.t_close_robot += 1;
			aiRobotRecord.t_trade_charge += aiRobotCharge;
			await aiRobotRecord.save();

			// for auto create aiRobot previous investment
			// const previous_investment = aiRobot.current_investment;

			// update aiRobot
			aiRobot.is_active = false;
			aiRobot.close_time = Date.now();
			aiRobot.status = 'completed';
			aiRobot.profit_percent = `${profit[aiRobot.grid_no] * 100}%`;
			aiRobot.profit = profit_amount;
			aiRobot.trade_charge = aiRobotCharge;
			aiRobot.take_profit = netProfit;
			await aiRobot.save();

			// update company balance
			company.cost.ai_robot_cost += aiRobotCharge * 0.9;
			company.cost.total_cost += aiRobotCharge * 0.9;
			company.income.ai_robot_income += aiRobotCharge * 0.1;
			company.income.total_income += aiRobotCharge * 0.1;
			await company.save();

			if (aiRobot.auto_create) {
				await autoCreateAiRobot(aiRobot);
				console.log('Auto create aiRobot');
			}

			// console.log('User', user.username, user.ai_balance);
			// console.log('Parent 1', parent_1.username, parent_1.m_balance);
			// console.log('Parent 2', parent_2.username, parent_2.m_balance);
			// console.log('Parent 3', parent_3.username, parent_3.m_balance);

			// console.log('Ai Robot completed');
		}
	}
});

// function autoCreateAiRobot()

const autoCreateAiRobot = async (aiRobot) => {
	const {
		current_investment,
		pair,
		grid_no,
		price_range,
		last_price,
		auto_create,
		user_id,
	} = aiRobot;

	const user = await User.findById(user_id);
	if (!user) {
		return console.log('User not found');
	}
	// console.log(req.body);
	// check if user al_balance is greater than investment
	if (user.al_balance < current_investment) {
		// update aiRobot
		aiRobot.is_active = false;
		aiRobot.close_time = Date.now();
		aiRobot.status = 'cancelled';
		aiRobot.auto_create = false;
		await aiRobot.save();
		return console.log('Insufficient balance');
	}

	// find aiRobotRecord by user_id if not found create new
	let aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });
	if (!aiRobotRecord) {
		aiRobotRecord = await AiRobotRecord.create({
			user_id: user._id,
			customer_id: user.customer_id,
		});
	}

	// console.log(aiRobotRecord._id);

	const company = await Company.findById(companyId);
	if (!company) {
		return console.log('Company not found');
	}

	const newAiRobot = await AiRobot.create({
		user_id: user._id,
		customer_id: user.customer_id,
		total_investment: current_investment,
		current_investment: current_investment,
		auto_create,
		pair,
		grid_no,
		price_range,
		profit_percent: '1.5% - 30%',
		last_price,
		auto_create,
		open_time: Date.now(),
	});

	// update user balance
	user.ai_balance -= Number(current_investment);
	createTransaction(
		user._id,
		'cashOut',
		current_investment,
		'aiRobot',
		`Investment in Ai Robot fro auto create`
	);
	user.ai_robot = true;
	await user.save();

	// update aiRobotRecord
	aiRobotRecord.active_robot_id = newAiRobot._id;
	aiRobotRecord.total_investment += Number(current_investment);
	aiRobotRecord.current_investment += Number(current_investment);
	aiRobotRecord.total_robot_count += 1;
	await aiRobotRecord.save();

	// update company balance
	company.total_ai_balance -= Number(current_investment);
	company.total_ai_robot_balance += Number(current_investment);
	await company.save();
};

// update all is_active aiRobot age is => 3 minutes
exports.updateAiRobot = catchAsyncErrors(async (req, res, next) => {
	const aiRobots = await AiRobot.find({
		is_active: true,
	});

	// find company
	const company = await Company.findById(companyId).select('cost income ');

	console.log(aiRobots.length);
	let profit = {
		1: 0.015,
		2: 0.016,
		3: 0.018,
	};

	for (let i = 4; i <= 170; i++) {
		profit[i] = 0.02;
	}

	for (let i = 0; i < aiRobots.length; i++) {
		const aiRobot = aiRobots[i];
		const age = Math.floor((Date.now() - aiRobot.open_time) / 60000);
		console.log(aiRobot.customer_id, age);
		if (age >= 2) {
			const profit_amount =
				aiRobot.current_investment * profit[aiRobot.grid_no];
			const aiRobotCharge = profit_amount * 0.02;
			const netProfit = profit_amount - aiRobotCharge;

			// find user
			const user = await User.findById(aiRobot.user_id).select(
				'ai_robot ai_balance m_balance username parent_1 parent_2 parent_3'
			);

			// find parent_1
			const parent_1 = await User.findOne({
				customer_id: user.parent_1.customer_id,
			}).select('trade_com m_balance username');

			// find parent_2
			const parent_2 = await User.findOne({
				customer_id: user.parent_2.customer_id,
			}).select('trade_com m_balance username');

			// find parent_3
			const parent_3 = await User.findOne({
				customer_id: user.parent_3.customer_id,
			}).select('trade_com m_balance username');

			// find aiRobotRecord by user_id
			const aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });

			// update user balance
			user.ai_robot = false;
			user.ai_balance += netProfit;
			createTransaction(
				user._id,
				'cashIn',
				netProfit,
				'aiRobot',
				`Profit from Ai Robot`
			);
			await user.save();

			// update parent_1 balance
			parent_1.m_balance += aiRobotCharge * 0.4;
			parent_1.trade_com.level_1 += aiRobotCharge * 0.4;
			createTransaction(
				parent_1._id,
				'cashIn',
				aiRobotCharge * 0.4,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_1.save();

			// update parent_2 balance
			parent_2.m_balance += aiRobotCharge * 0.3;
			parent_2.trade_com.level_2 += aiRobotCharge * 0.3;
			createTransaction(
				parent_2._id,
				'cashIn',
				aiRobotCharge * 0.3,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_2.save();

			// update parent_3 balance
			parent_3.m_balance += aiRobotCharge * 0.2;
			parent_3.trade_com.level_3 += aiRobotCharge * 0.2;
			createTransaction(
				parent_3._id,
				'cashIn',
				aiRobotCharge * 0.2,
				'commission',
				`Commission from Ai Robot ${user.username}`
			);
			await parent_3.save();

			// update aiRobotRecord
			aiRobotRecord.active_robot_id = null;
			aiRobotRecord.total_profit += netProfit;
			aiRobotRecord.t_close_robot += 1;
			aiRobotRecord.t_trade_charge += aiRobotCharge;
			await aiRobotRecord.save();

			// update aiRobot
			aiRobot.is_active = false;
			aiRobot.close_time = Date.now();
			aiRobot.status = 'completed';
			aiRobot.profit_percent = `${profit[aiRobot.grid_no]}%`;
			aiRobot.profit = profit_amount;
			aiRobot.trade_charge = aiRobotCharge;
			aiRobot.take_profit = netProfit;
			await aiRobot.save();

			// update company balance
			company.cost.ai_robot_cost += aiRobotCharge * 0.9;
			company.cost.total_cost += aiRobotCharge * 0.9;
			company.income.ai_robot_income += aiRobotCharge * 0.1;
			company.income.total_income += aiRobotCharge * 0.1;
			await company.save();

			console.log('User', user.username, user.ai_balance);
			console.log('Parent 1', parent_1.username, parent_1.m_balance);
			console.log('Parent 2', parent_2.username, parent_2.m_balance);
			console.log('Parent 3', parent_3.username, parent_3.m_balance);

			console.log('Ai Robot completed');
		}
	}

	res.status(200).json({
		success: true,
		message: 'Ai Robot updated successfully',
	});
});

// get all aiRobot by user_id
exports.getAllAiRobot = catchAsyncErrors(async (req, res, next) => {
	const aiRobots = await AiRobot.find({
		user_id: req.user._id,
		is_active: false,
	}).sort({
		createdAt: -1,
	});

	res.status(200).json({
		success: true,
		aiRobots,
	});
});

// update aiRobot auto_create
exports.updateAiRobotAutoCreate = catchAsyncErrors(async (req, res, next) => {
	const { robot_id, auto_create } = req.body;

	// find aiRobot robot_id
	const aiRobot = await AiRobot.findOne({
		_id: robot_id,
		is_active: true,
	}).select('auto_create');
	if (!aiRobot) {
		return next(new ErrorHandler('Ai Robot not found', 404));
	}

	aiRobot.auto_create = auto_create;
	await aiRobot.save();

	res.status(200).json({
		success: true,
		message: 'Ai Robot auto create updated successfully',
	});
});
