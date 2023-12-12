const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const AiRobot = require('../models/aiRobotModel');

// create company
exports.createCompany = catchAsyncErrors(async (req, res, next) => {
	await Company.create({
		name: 'Glomax',
		short_name: 'glomax',
		email: 'glomaxservice24@gmail.com',
		phone: '+1(585)404-4409',
		address: '5151 Tomken Rd, Mississauga, ON L4W 3W4',
		city: 'Mississauga',
		state: 'Ontario',
		zipCode: 'L4W 3W4',
		about: 'WFC is the Bast Coin exchange and gaming  platform in  the world',
		website: '',
		logo: {
			logo_white_1:
				'https://res.cloudinary.com/dqodfarob/image/upload/v1684578063/logo/logo_white_j2f3ne.png',
			logo_black_1:
				'https://res.cloudinary.com/dqodfarob/image/upload/v1684577977/logo/logo_black_it1f9h.png',
			logo_icon:
				'https://res.cloudinary.com/dqodfarob/image/upload/v1684578783/logo/logo_icon_rfiymd.png',
		},
	});
	res.status(201).json({
		success: true,
		message: 'Company created successfully',
	});
});

// get company
exports.getCompanyAdmin = catchAsyncErrors(async (req, res, next) => {
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}
	res.status(200).json({
		success: true,
		company,
	});
});

// clear dailyWork todayWorkUsers
exports.clearDailyWorkTodayWorkUsers = catchAsyncErrors(
	async (req, res, next) => {
		const company = await Company.findById(companyId);
		if (!company) {
			return next(new ErrorHandler('No company found', 404));
		}

		company.update({ $set: { 'dailyWork.todayWorkUsers': [] } });
		res.status(200).json({
			success: true,
			message: 'Company updated',
		});
	}
);

// reset company
exports.restCompany = catchAsyncErrors(async (req, res, next) => {
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	company.users.total_users = 0;
	company.users.new_users = 0;
	company.users.email_verified_users = 0;
	company.users.total_active_users = 0;
	company.users.logged_in_users = 0;
	company.users.total_send_money_users = 0;

	company.lottery.totalSellCount = 0;
	company.lottery.totalSellAmount = 0;
	company.lottery.toDaySellCount = 0;
	company.lottery.toDaySellAmount = 0;
	company.lottery.lotteryProfit = 0;
	company.lottery.todayProfit = 0;
	company.lottery.totalDraw = 0;

	company.convert.totalConvert = 0;
	company.convert.totalConvertCount = 0;
	company.convert.todayConvert = 0;
	company.convert.todayConvertCount = 0;

	company.withdraw.totalWithdraw = 0;
	company.withdraw.totalWithdrawCount = 0;
	company.withdraw.todayWithdraw = 0;
	company.withdraw.total_w_charge = 0;
	company.withdraw.total_w_balance = 0;
	company.withdraw.todayWithdrawCount = 0;
	company.withdraw.new_withdraw = 0;
	company.withdraw.pending_withdraw_count = 0;
	company.withdraw.pending_withdraw_amount = 0;
	company.withdraw.todayWithdrawCount = 0;

	// cost
	company.cost.total_cost = 0;
	company.cost.today_cost = 0;
	company.cost.lottery_cost = 0;
	company.cost.lottery_cost_count = 0;
	company.cost.lucky_box_cost = 0;
	company.cost.signup_bonus_cost = 0;
	company.cost.referral_bonus_cost = 0;

	//income
	company.income.total_income = 0;
	company.income.today_income = 0;
	company.income.lottery_income = 0;
	company.income.withdraw_charge = 0;
	company.income.convert_charge = 0;

	// deposit
	company.deposit.totalDepositCount = 0;
	company.deposit.totalDepositAmount = 0;
	company.deposit.todayDepositCount = 0;
	company.deposit.todayDepositAmount = 0;
	company.deposit.total_d_bonus = 0;
	company.deposit.new_deposit_amount = 0;
	company.deposit.new_deposit_count = 0;
	company.deposit.rejectedDepositAmount = 0;
	company.deposit.rejectedDepositCount = 0;
	company.deposit.d_rejected_ids = [];

	await company.save();

	res.status(200).json({
		success: true,
		message: 'All properties updated',
	});
});

// all users balance and withdraw balance and deposit balance
exports.allUsersBalanceInfo = catchAsyncErrors(async (req, res, next) => {
	// find all users
	const users = await User.find();
	if (!users) {
		return next(new ErrorHandler('No users found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	let total_main_balance = 0;
	let total_ai_balance = 0;
	let total_trade_volume = 0;
	let total_ai_active_balance = 0;
	let total_e_balance = 0;

	for (let i = 0; i < users.length; i++) {
		total_main_balance += users[i].m_balance;
		total_ai_balance += users[i].ai_balance;
		total_trade_volume += users[i].trading_volume;
		total_e_balance += users[i].e_balance;
	}

	// find all active ai robots
	const aiRobots = await AiRobot.find({ is_active: true });
	if (!aiRobots) {
		return next(new ErrorHandler('No ai robots found', 404));
	}
	for (let i = 0; i < aiRobots.length; i++) {
		total_ai_active_balance += aiRobots[i].balance;
	}

	const balanceInfo = {
		total_main_balance,
		total_ai_balance,
		total_trade_volume,
		total_ai_active_balance,
		total_e_balance,
	};

	res.status(200).json({
		success: true,
		balanceInfo,
	});
});
