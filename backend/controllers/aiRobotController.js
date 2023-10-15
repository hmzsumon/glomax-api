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

	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	const mumInvestment = Number(investment);

	const newAiRobot = await AiRobot.create({
		user_id: user._id,
		customer_id: user.customer_id,
		total_investment: investment,
		current_investment: investment,
		pair,
		grid_no,
		price_range,
		profit_percent: '1.5% - 30%',
		last_price,
		open_time: Date.now(),
	});

	// update user balance
	user.ai_balance -= mumInvestment;
	createTransaction(
		user._id,
		'cashOut',
		mumInvestment,
		'aiRobot',
		`Investment in Ai Robot`
	);
	user.ai_robot = true;
	await user.save();

	// update aiRobotRecord
	aiRobotRecord.active_robot_id = newAiRobot._id;
	aiRobotRecord.total_investment += mumInvestment;
	aiRobotRecord.current_investment += mumInvestment;
	aiRobotRecord.total_robot_count += 1;
	await aiRobotRecord.save();

	// update company balance
	company.total_ai_balance -= mumInvestment;
	company.total_active_ai_balance += mumInvestment;
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
	company.total_active_ai_balance -= aiRobot.current_investment;
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

// update all is_active aiRobot
cron.schedule('* * * * *', async () => {
	try {
		// Fetch active AI robots in batches
		const batchSize = 100; // Adjust the batch size as needed
		let offset = 0;

		while (true) {
			const aiRobots = await AiRobot.find({
				is_active: true,
			})
				.skip(offset)
				.limit(batchSize);

			if (aiRobots.length === 0) {
				break; // No more active AI robots to process
			}

			// Process the AI robots in parallel
			await Promise.all(
				aiRobots.map(async (aiRobot) => {
					aiRobot.time = aiRobot.time - 1;
					await aiRobot.save();

					if (aiRobot.time <= 0) {
						await updateAiRobot(aiRobot);
					}
				})
			);

			offset += batchSize;
		}
	} catch (error) {
		console.error('Error:', error);
	}
});

// update aiRobot
const updateAiRobot = async (aiRobot) => {
	try {
		// find company
		const company = await Company.findById(companyId);

		// console.log(aiRobots.length);
		let profit = {
			1: 0.023,
			2: 0.026,
			3: 0.03,
		};

		for (let i = 4; i <= 170; i++) {
			profit[i] = 0.035;
		}

		const profit_amount = aiRobot.current_investment * profit[aiRobot.grid_no];
		const aiRobotCharge = profit_amount * 0.02;
		const netProfit = profit_amount - aiRobotCharge;

		// update aiRobot
		aiRobot.is_active = false;
		aiRobot.close_time = Date.now();
		aiRobot.status = 'completed';
		await aiRobot.save();

		// find user by user_id
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
		company.total_active_ai_balance -= aiRobot.current_investment;
		company.total_ai_balance += aiRobot.current_investment + netProfit;

		createTransaction(
			user._id,
			'cashIn',
			netProfit + aiRobot.current_investment,
			'ai_robot',
			`Profit from Ai Robot $${Number(netProfit).toFixed(5)} and Refund $${
				aiRobot.current_investment
			}`
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
			`1st level Commission from Ai Robot by ${user.username}`
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
			`2nd level Commission from Ai Robot by ${user.username}`
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
			`3rd Commission from Ai Robot by ${user.username}`
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
		aiRobot.profit_percent = `${Number(
			profit[aiRobot.grid_no] * 100
		).toLocaleString('en-US', {
			minimumFractionDigits: 3,
			maximumFractionDigits: 5,
		})}%`;
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

		// console.log('updateAiRobot', aiRobot.customer_id);
	} catch (error) {
		console.error('Error:', error);
	}
};

// update all is_active aiRobot age is => 3 minutes
exports.updateAiRobot = catchAsyncErrors(async (req, res, next) => {
	// Calculate the timestamp for 3 minutes ago
	const threeMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 3 minutes in milliseconds
	console.log(threeMinutesAgo);
	// Find and update aiRobot documents
	const aiRobots = await AiRobot.find({
		is_active: true,
		open_time: { $gte: threeMinutesAgo }, // Find documents with open_time less than or equal to three minutes ago
	});

	// find company
	const company = await Company.findById(companyId);

	// console.log(aiRobots.length);
	let profit = {
		1: 0.023,
		2: 0.026,
		3: 0.03,
	};

	for (let i = 4; i <= 170; i++) {
		profit[i] = 0.035;
	}

	for (let i = 0; i < aiRobots.length; i++) {
		const aiRobot = aiRobots[i];
		console.log(aiRobot.customer_id);
	}

	res.status(200).json({
		success: true,
		message: `Updated Ai Robots successfully`, // Return the number of updated documents
		aiRobots,
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

// update all users ai_robot to false
exports.updateAllUsersAiRobot = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		user.ai_robot = false;
		await user.save();
	}

	res.status(200).json({
		success: true,
		message: 'All users ai_robot updated successfully',
	});
});

// get all aiRobot for admin
exports.getAllAiRobotAdmin = catchAsyncErrors(async (req, res, next) => {
	const aiRobots = await AiRobot.find();

	res.status(200).json({
		success: true,
		aiRobots,
	});
});

// get a single aiRobot for admin by robot_id
exports.getSingleAiRobotAdmin = catchAsyncErrors(async (req, res, next) => {
	const aiRobot = await AiRobot.findById(req.params.id);
	if (!aiRobot) {
		return next(new ErrorHandler('Ai Robot not found', 404));
	}

	// find aiRobotRecord by user_id
	const aiRobotRecord = await AiRobotRecord.findOne({
		user_id: aiRobot.user_id,
	});
	if (!aiRobotRecord) {
		return next(new ErrorHandler('Ai Robot Record not found', 404));
	}

	// find user
	const user = await User.findById(aiRobot.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	const newUser = {
		name: user.name,
		username: user.username,
		customer_id: user.customer_id,
		m_balance: user.m_balance,
		ai_balance: user.ai_balance,
	};

	res.status(200).json({
		success: true,
		aiRobot,
		aiRobotRecord,
		user: newUser,
	});
});
