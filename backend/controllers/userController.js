const ErrorHandler = require('../utils/errorhandler');
const UserNotification = require('../models/userNotification');
const Transaction = require('../models/transaction');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const WithdrawDetails = require('../models/withdrawDetailsModel');
const DepositDetails = require('../models/depositDetails');
const LotteryDetails = require('../models/lotteryDetails');
const SendDetails = require('../models/sendDetails');
const ConvertRecord = require('../models/convertRecordModel');
const TradeRecord = require('../models/tradeRecord');
const AiRobotRecord = require('../models/aiRobotRecord');
const Team = require('../models/teamModel');
const sendToken = require('../utils/jwtToken');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const createTransaction = require('../utils/tnx');
const { v4: uuidv4 } = require('uuid');
const ip = require('ip');
const Mining = require('../models/miningModel');
const PlayDetails = require('../models/playDetails');
const registrationTemplate = require('../utils/templateR');
const securityTemplate = require('../utils/templateS');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const cron = require('node-cron');
const RankRecord = require('../models/rankRecord');

//======================================
//seed user => /api/v1/seed/user
//======================================
const users = [
	{
		name: 'Zakaria Sumon',
		email: 'hmzwork22@gmail.com',
		phone: '01757454532',
		password: 'Su112200',
		role: 'user',
		avatar: {
			url: 'https://zakaria.live/static/124534a3125ce276f9d169f8847cab07/2dde6/hero-img1.webp',
		},
		email_verification: true,
	},
	{
		name: 'Zakaria Admin',
		email: 'admin@gamil.com',
		phone: '01757454531',
		password: 'Su112200',
		role: 'admin',
		avatar: {
			url: 'https://zakaria.live/static/124534a3125ce276f9d169f8847cab07/2dde6/hero-img1.webp',
		},
		email_verification: true,
	},
];

// unique nik_name generator
function generateUniqueNickname(baseName) {
	const suffix = crypto.randomBytes(2).toString('hex');
	const nickname = baseName + suffix;
	return nickname;
}

// cerate user 9 digit customer id
function generateUniqueId() {
	const timestamp = new Date().getTime().toString();
	const random = Math.floor(Math.random() * 100000000)
		.toString()
		.padStart(9, '0');
	return timestamp + random;
}

exports.seedUser = catchAsyncErrors(async (req, res, next) => {
	// create user
	const user = await User.create({
		name: 'Glomax Master',
		username: 'glomaxmaster',
		email: 'wfcuser2023@gmail.com',
		phone: '+15854044409',
		customer_id: generateUniqueId().substring(0, 9),
		password: 'Assad@1564',
		role: 'user',
		email_verified: true,
		is_active: true,
		parent_1: {
			customer_id: generateUniqueId().substring(0, 9),
			name: 'RW Master',
		},
		parent_2: {
			customer_id: generateUniqueId().substring(0, 9),
			name: 'RW Master',
		},
		parent_3: {
			customer_id: generateUniqueId().substring(0, 9),
			name: 'RW Master',
		},
	});

	// update user
	user.email_verified = true;
	user.verify_code = null;
	await user.save();

	// create withdraw details
	await WithdrawDetails.create({
		user_id: user._id,
		email: user.email,
		customer_id: user.customer_id,
	});

	// create deposit details
	await DepositDetails.create({
		user_id: user._id,
		email: user.email,
		customer_id: user.customer_id,
	});

	// create Play details
	await PlayDetails.create({
		user_id: user._id,
		email: user.email,
		phone: user.phone,
		customer_id: user.customer_id,
	});

	// create team
	await Team.create({
		user_id: user._id,
		email: user.email,
		customer_id: user.customer_id,
	});

	// convert record
	await ConvertRecord.create({
		user_id: user._id,
		customer_id: user.customer_id,
		username: user.username,
	});

	// create Trade Record
	await TradeRecord.create({
		user_id: user._id,
		customer_id: user.customer_id,
		name: user.name,
	});

	// find sponsor 1 customer id
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	});
	// console.log(parent_1);
	if (!parent_1) {
		return next(new ErrorHandler('Sponsor 1 not found', 400));
	}

	// find parent1 team
	const parent1_team = await Team.findOne({ user_id: parent_1._id });
	if (!parent1_team) {
		return next(new ErrorHandler('Sponsor 1 team not found'));
	}

	// find sponsor 2 user_id;
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	});
	if (!parent_2) {
		return next(new ErrorHandler('Sponsor 2 not found', 400));
	}

	// find parent 2 team
	const parent2_team = await Team.findOne({ user_id: parent_2._id });
	if (!parent2_team) {
		return next(new ErrorHandler('Sponsor 2 team not found', 400));
	}

	// find parent 3
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	});
	if (!parent_3) {
		return next(new ErrorHandler('Sponsor 2 not found', 400));
	}

	// find parent3 team
	const parent3_team = await Team.findOne({ user_id: parent_3._id });
	if (!parent3_team) {
		return next(new ErrorHandler('Sponsor 2 team not found', 400));
	}

	res.status(200).json({
		success: true,
		message: 'User created successfully',
	});
});

//======================================
// Register a user => /api/v1/register
//======================================

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
	const { name, email, username, password, referral, phone } = req.body;
	console.log(referral);
	// console.log(req.body);
	// check if user already exists by email or username or phone
	const existUser = await User.findOne({
		$or: [{ username }, { email }, { phone }],
	});
	if (existUser) {
		if (existUser.username === username) {
			return next(new ErrorHandler('Username already exists', 400));
		} else if (existUser.email === email) {
			return next(new ErrorHandler('Email already exists', 400));
		} else if (existUser.phone === phone) {
			return next(new ErrorHandler('Phone already exists', 400));
		}
	}

	// find company by company id
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// find parent 1
	const parent_1 = await User.findOne({ customer_id: referral });
	if (!parent_1) {
		return next(new ErrorHandler('Invalid Invite Code!', 400));
	}

	// find parent 2 (parent_1's parent)
	const parent_2 = await User.findOne({
		customer_id: parent_1.parent_1.customer_id,
	});
	if (!parent_2) {
		return next(new ErrorHandler('Parent Not Found(2)', 400));
	}

	// find parent 3 (parent_2's parent)
	const parent_3 = await User.findOne({
		customer_id: parent_2.parent_1.customer_id,
	});
	if (!parent_3) {
		return next(new ErrorHandler('Parent Not Found(3)', 400));
	}

	// find parent 4 (parent_3's parent)
	const parent_4 = await User.findOne({
		customer_id: parent_3.parent_1.customer_id,
	});

	if (!parent_4) {
		return next(new ErrorHandler('Parent Not Found(4)', 400));
	}

	// find parent 5 (parent_4's parent)
	const parent_5 = await User.findOne({
		customer_id: parent_4.parent_1.customer_id,
	});

	if (!parent_5) {
		return next(new ErrorHandler('Parent Not Found(5)', 400));
	}

	// 9 digit customer id
	const customer_id = generateUniqueId().substring(0, 12);

	// 6 digit verification code
	const verify_code = Math.floor(100000 + Math.random() * 900000);

	// modify username to lowercase and remove space
	const nick_name = username.toLowerCase().replace(/\s/g, '');

	// console.log(nick_name);
	const user = await User.create({
		name,
		username: nick_name,
		email,
		phone,
		customer_id,
		role: 'user',
		password,
		text_password: password,
		parent_1: {
			customer_id: parent_1.customer_id,
			name: parent_1.name,
		},
		parent_2: {
			customer_id: parent_2.customer_id,
			name: parent_2.name,
		},
		parent_3: {
			customer_id: parent_3.customer_id,
			name: parent_3.name,
		},

		parent_4: {
			customer_id: parent_4.customer_id,
			name: parent_4.name,
		},

		parent_5: {
			customer_id: parent_5.customer_id,
			name: parent_5.name,
		},

		verify_code,
	});

	// update company
	company.users.total_users += 1;
	company.users.new_users += 1;
	await company.save();

	const html = registrationTemplate(name, verify_code);
	// send verify code to user email
	sendEmail({
		email: user.email,
		subject: 'Glomax Verification Code',
		html: html,
	});

	res.status(201).json({
		success: true,
		message: 'User registered successfully',
		user,
	});
});

//======================================
// Email verification => /api/v1/verify
//======================================
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
	const { code, email } = req.body;

	// check code and email validation
	if (!code || !email) {
		return next(new ErrorHandler('Invalid code or email', 400));
	}

	// console.log(req.body);
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (user.verify_code !== code) {
		return next(new ErrorHandler('Invalid code', 400));
	}

	// find parent 1
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	});
	if (!parent_1) {
		return next(new ErrorHandler('Sponsor not found', 400));
	}

	// parent 1 team
	const parent1_team = await Team.findOne({ user_id: parent_1._id });
	if (!parent1_team) {
		return next(new ErrorHandler('Sponsor team not found', 400));
	}

	// find parent 2
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	});
	if (!parent_2) {
		return next(new ErrorHandler('Sponsor not found', 400));
	}

	// parent 2 team
	const parent2_team = await Team.findOne({ user_id: parent_2._id });
	if (!parent2_team) {
		return next(new ErrorHandler('Sponsor team not found', 400));
	}

	// find parent 3
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	});
	if (!parent_3) {
		return next(new ErrorHandler('Sponsor not found', 400));
	}

	// parent 3 team
	const parent3_team = await Team.findOne({ user_id: parent_3._id });
	if (!parent3_team) {
		return next(new ErrorHandler('Sponsor team not found', 400));
	}

	// find parent 4
	const parent_4 = await User.findOne({
		customer_id: user.parent_4.customer_id,
	});

	if (!parent_4) {
		return next(new ErrorHandler('Parent 4 not found', 400));
	}

	// parent 4 team
	const parent4_team = await Team.findOne({ user_id: parent_4._id });
	if (!parent4_team) {
		return next(new ErrorHandler('Parent 4 team not found', 400));
	}

	// find parent 5
	const parent_5 = await User.findOne({
		customer_id: user.parent_5.customer_id,
	});

	if (!parent_5) {
		return next(new ErrorHandler('Parent 5 not found', 400));
	}

	// parent 5 team
	const parent5_team = await Team.findOne({ user_id: parent_5._id });
	if (!parent5_team) {
		return next(new ErrorHandler('Parent 5 team not found', 400));
	}

	// find company by company id
	const company = await Company.findById(process.env.COMPANY_ID);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// update user
	user.email_verified = true;
	user.verify_code = null;
	user.m_balance += 2;
	createTransaction(
		user._id,
		'cashIn',
		2,
		user.m_balance + user.ai_balance,
		'bonus',
		`Signup bonus $2.00 from Glomax`
	);
	user.signup_bonus += 2;
	user.trading_volume += 2 * 1;
	company.total_trade_volume += 2 * 1;
	await user.save();

	// create withdraw details
	await WithdrawDetails.create({
		user_id: user._id,
		email: user.email,
		customer_id: user.customer_id,
	});

	// create deposit details
	await DepositDetails.create({
		user_id: user._id,
		email: user.email,
		customer_id: user.customer_id,
	});

	// create Play details
	await PlayDetails.create({
		user_id: user._id,
		email: user.email,
		phone: user.phone,
		customer_id: user.customer_id,
	});
	// console.log(user.customer_id);
	// create team
	await Team.create({
		user_id: user._id,
		email: user.email,
	});

	// create convert record
	await ConvertRecord.create({
		user_id: user._id,
		customer_id: user.customer_id,
		username: user.username,
	});

	// create Trade Record
	await TradeRecord.create({
		user_id: user._id,
		customer_id: user.customer_id,
		name: user.name,
	});

	// create rank record
	await RankRecord.create({
		customer_id: user.customer_id,
		username: user.username,
		user_id: user._id,
	});

	// update parent 1
	parent_1.level_1_count += 1;
	await parent_1.save();

	// update parent 1 team
	parent1_team.level_1.push(user._id);
	await parent1_team.save();

	// update parent 2
	parent_2.level_2_count += 1;
	await parent_2.save();

	// update parent 2 team
	parent2_team.level_2.push(user._id);
	await parent2_team.save();

	// update parent 3
	parent_3.level_3_count += 1;
	await parent_3.save();

	// update parent 3 team
	parent3_team.level_3.push(user._id);
	await parent3_team.save();

	// update parent 4
	parent_4.level_4_count += 1;
	await parent_4.save();

	// update parent 4 team
	parent4_team.level_4.push(user._id);
	await parent4_team.save();

	// update parent 5
	parent_5.level_5_count += 1;
	await parent_5.save();

	// update parent 5 team
	parent5_team.level_5.push(user._id);
	await parent5_team.save();

	// update company
	company.users.email_verified_users += 1;
	company.cost.signup_bonus_cost += 2;
	company.cost.total_cost += 2;
	await company.save();

	const newUserData = {
		email: user.email,
		name: user.name,
		is_registration_done: user.is_registration_done,
	};

	res.status(200).json({
		success: true,
		message: 'Email verified successfully',
		user: newUserData,
	});
});

//======================================
// Email verification => /api/v1/verify
//======================================
exports.securityVerify = catchAsyncErrors(async (req, res, next) => {
	const { code, email } = req.body;

	// check code and email validation
	if (!code || !email) {
		return next(new ErrorHandler('Invalid code or email', 400));
	}

	// console.log(req.body);
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (user.verify_code !== code) {
		return next(new ErrorHandler('Invalid code', 400));
	}

	// update user
	user.email_verified = true;
	user.verify_code = null;
	await user.save();

	const newUserData = {
		email: user.email,
		name: user.name,
		is_registration_done: user.is_registration_done,
	};

	res.status(200).json({
		success: true,
		message: 'Email verified successfully',
		user: newUserData,
	});
});

//======================================
// Resend Email verification
//======================================
exports.resendEmailVerification = catchAsyncErrors(async (req, res, next) => {
	const { email } = req.body;
	// console.log(req.body);
	const user = await User.findOne({ email });

	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// generate verify code
	const verify_code = Math.floor(100000 + Math.random() * 900000);

	// update user
	user.verify_code = verify_code;

	await user.save();

	const html = securityTemplate(user.name, verify_code);

	// send verify code to user email
	sendEmail({
		email: user.email,
		subject: 'Glomax Verification Code',
		html: html,
	}); // send email

	res.status(200).json({
		success: true,
		message: 'Verification code sent to your email',
	});
});

//======================================
// Create Password => /api/v1/password
//======================================
exports.createPassword = catchAsyncErrors(async (req, res, next) => {
	const { password, email } = req.body;
	// console.log(req.body);

	if (!password || !email) {
		return next(new ErrorHandler('Please enter password', 400));
	}

	// find user by email
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	user.password = password;
	user.text_password = password;
	await user.save();

	// create token
	sendToken(user, 200, res);
});

//======================================
// Register Done => /api/v1/register-done
//======================================
exports.registerDone = catchAsyncErrors(async (req, res, next) => {
	const { email } = req.body;
	// console.log(email);
	// check code and email validation
	if (!email) {
		return next(new ErrorHandler(' Invalid email', 400));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// console.log(req.body);
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('WFC account not found', 404));
	}
	// console.log(user.parent_1.customer_id);
	// find sponsor 1 customer id
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	});
	// console.log(parent_1);
	if (!parent_1) {
		return next(new ErrorHandler('Sponsor 1 not found', 400));
	}

	// find parent1 team
	const parent1_team = await Team.findOne({ user_id: parent_1._id });
	if (!parent1_team) {
		return next(new ErrorHandler('Sponsor 1 team not found'));
	}

	//  find parent_mining_1
	const parent_mining_1 = await Mining.findOne({
		user_id: parent_1._id,
	}).select('mining_level mining_level_name mining_balance');

	// find sponsor 2 user_id;
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	});
	if (!parent_2) {
		return next(new ErrorHandler('Sponsor 2 not found', 400));
	}

	// find parent 2 team
	const parent2_team = await Team.findOne({ user_id: parent_2._id });
	if (!parent2_team) {
		return next(new ErrorHandler('Sponsor 2 team not found', 400));
	}

	// find parent_mining_2
	const parent_mining_2 = await Mining.findOne({
		user_id: parent_2._id,
	}).select('mining_level mining_level_name');

	// find parent 3
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	});
	if (!parent_3) {
		return next(new ErrorHandler('Sponsor 2 not found', 400));
	}

	// find parent3 team
	const parent3_team = await Team.findOne({ user_id: parent_3._id });
	if (!parent3_team) {
		return next(new ErrorHandler('Sponsor 2 team not found', 400));
	}
	// find parent_mining_3
	const parent_mining_3 = await Mining.findOne({
		user_id: parent_3._id,
	}).select('mining_level mining_level_name');

	// create withdraw details
	await WithdrawDetails.create({
		user_id: user._id,
		email: user.email,
	});

	// create deposit details
	await DepositDetails.create({
		user_id: user._id,
		email: user.email,
	});

	// create team
	await Team.create({
		user_id: user._id,
		email: user.email,
	});

	// update parent_1
	parent_1.level_1_count += 1;
	parent_1.referral_bonus += 10;
	parent_1.mining_balance += 10;
	createTransaction(
		parent_1._id,
		'cashIn',
		10,
		parent_1.m_balance + parent_1.ai_balance,
		'bonus',
		`Referral Bonus from ${user.name}`
	);
	await parent_1.save();

	// update parent_1 team
	parent1_team.level_1.push(user._id);
	await parent1_team.save();

	// update parent_2
	parent_2.level_2_count += 1;
	await parent_2.save();

	// update sponsor_2 team
	parent2_team.level_2.push(user._id);
	await parent2_team.save();

	// update parent_3
	parent_3.level_3_count += 1;
	await parent_3.save();

	// update parent3 team
	parent3_team.level_3.push(user._id);
	await parent3_team.save();

	// create mining
	await Mining.create({
		user_id: user._id,
		name: user.name,
		email: user.email,
		mining_balance: 100,
		parents: [parent_mining_1._id, parent_mining_2._id, parent_mining_3._id],
	});

	// update user
	user.is_registration_done = true;
	user.signup_bonus = 100;
	user.mining_balance = 100;
	user.is_mining = true;
	createTransaction(
		user._id,
		'cashIn',
		100,
		user.m_balance + user.ai_balance,
		'bonus',
		`Signup Bonus from Glomax`
	);
	await user.save();

	// update parent_mining_1
	parent_mining_1.mining_balance += 10;
	await parent_mining_1.save();

	// update company
	company.users.total_users += 1;
	company.users.new_users += 1;
	company.cost.signup_bonus_cost += 100;
	company.cost.referral_bonus_cost += 10;
	company.cost.total_cost += 110;
	company.cost.mining_cost += 110;
	//update mining value
	company.target.mining -= 110;
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Registration done successfully',
	});
});
//======================================
// Login user => /api/v1/login
//======================================

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;
	// console.log(req.body);
	const fullIpAddress = ip.address();

	if (!email || !password) {
		return next(new ErrorHandler('Please enter email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}
	// check if user is email verified
	if (user.email_verified === false) {
		// generate verify code
		const verify_code = Math.floor(100000 + Math.random() * 900000);
		// update user
		user.verify_code = verify_code;
		await user.save();
		const html = securityTemplate(user.name, verify_code);
		// send verify code to user email
		sendEmail({
			email: email,
			subject: 'Glomax Verification Code',
			html: html,
		});
		console.log('email not verified', email);
		return next(new ErrorHandler('Please verify your email', 405));
	}

	user.login_info = {
		date: Date.now(),
		ip_address: fullIpAddress,
	};
	user.last_login_info = {
		date: Date.now(),
		ip_address: fullIpAddress,
	};
	await user.save();

	// find company
	const company = await Company.findById(companyId).select(
		'-lottery -convert -withdraw -deposit -lucky_box -cost -income -verify -notifications'
	);
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// update company
	company.users.logged_in_users += 1;
	await company.save();

	sendToken(user, 200, res);
});

//======================================
// admin login => /api/v1/admin/login
//======================================

exports.adminLogin = catchAsyncErrors(async (req, res, next) => {
	// console.log(req.headers);
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorHandler('Please enter email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}

	// check if user is admin
	if (user.role !== 'admin') {
		return next(new ErrorHandler("You're not an admin", 401));
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}

	sendToken(user, 200, res);
});

//======================================
// Logout User
//======================================
exports.logout = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	const fullIpAddress = ip.address();

	// update user last_login_info
	user.last_login_info = {
		date: Date.now(),
		ip_address: fullIpAddress,
	};
	await user.save();

	res.cookie('token', null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});

	// find company
	const company = await Company.findById(companyId).select(
		'-lottery -convert -withdraw -deposit -lucky_box -cost -income -verify -notifications'
	);

	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// update company
	if (company.users.logged_in_users > 0) {
		company.users.logged_in_users -= 1;
		await company.save();
	}

	res.status(200).json({
		success: true,
		message: 'Logged Out',
	});
});

//======================================
// get users => /api/v1/admin/users
//======================================
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find({ role: 'user' });

	res.status(200).json({
		success: true,
		users,
	});
});

//======================================
// Check if user is exist by email
//======================================
exports.checkUserByEmail = catchAsyncErrors(async (req, res, next) => {
	const { email } = req.body;
	console.log(email);
	// find user by email
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('WFC account not found', 404));
	}

	res.status(200).json({
		success: true,
		message: 'WFC Account Found',
	});
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// Get ResetPassword Token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetPasswordUrl = `${req.protocol}://${req.get(
		'host'
	)}/password/reset/${resetToken}`;

	const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Recovery',
			message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email} successfully`,
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorHander(error.message, 500));
	}
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
	// creating token hash
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.body.token)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(
			new ErrorHandler(
				'Reset Password Token is invalid or has been expired',
				400
			)
		);
	}

	if (req.body.password !== req.body.confirmPassword) {
		return next(new ErrorHandler('Password does not password', 400));
	}

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
	const id = req.params.id;
	const user = await User.findOne({ customer_id: id }).select('-password');
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// find team by user id
	const team = await Team.findOne({ user_id: user._id });
	if (!team) {
		return next(new ErrorHandler('Team not found', 404));
	}

	const allTeamIds = [
		...team.level_1,
		...team.level_2,
		...team.level_3,
		...team.level_4,
		...team.level_5,
	];

	// find all team members
	const allTeamMembers = await User.find({ _id: { $in: allTeamIds } }).select(
		'-password'
	);

	// filter active members
	const activeMembers = allTeamMembers.filter((member) => member.is_active);

	// get ai robotRecord
	const aiRobotRecord = await AiRobotRecord.findOne({ user_id: user._id });
	if (!aiRobotRecord) {
		console.log('robot record not found');
	}

	// convert record
	const convertRecord = await ConvertRecord.findOne({ user_id: user._id });
	if (!convertRecord) {
		console.log('convert record not found');
	}

	// get deposit details
	const depositDetails = await DepositDetails.findOne({ user_id: user._id });
	if (!depositDetails) {
		return next(new ErrorHandler('Deposit Details not found', 404));
	}

	// get withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({ user_id: user._id });
	if (!withdrawDetails) {
		return next(new ErrorHandler('Withdraw Details not found', 404));
	}

	// get trade record
	const tradeRecord = await TradeRecord.findOne({ user_id: user._id });
	if (!tradeRecord) {
		console.log('trade record not found');
	}

	// get last 5 transactions
	const transactions = await Transaction.find({ user_id: user._id })
		.sort({
			createdAt: -1,
		})
		.limit(5);
	if (transactions.length === 0) {
		console.log('transactions not found');
	}

	//
	// console.log(user);
	res.status(200).json({
		success: true,
		user,
		team,
		activeMembers: activeMembers.length,
		allTeamMembers: allTeamMembers.length,
		aiRobotRecord,
		convertRecord,
		depositDetails,
		withdrawDetails,
		tradeRecord,
		transactions,
	});
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

	if (!isPasswordMatched) {
		return next(new ErrorHander('Old password is incorrect', 400));
	}

	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(new ErrorHander('password does not match', 400));
	}

	user.password = req.body.newPassword;

	await user.save();

	sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
	};

	if (req.body.avatar !== '') {
		const user = await User.findById(req.user.id);

		const imageId = user.avatar.public_id;

		await cloudinary.v2.uploader.destroy(imageId);

		const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
			folder: 'avatars',
			width: 150,
			crop: 'scale',
		});

		newUserData.avatar = {
			public_id: myCloud.public_id,
			url: myCloud.secure_url,
		};
	}

	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();

	let newUsers = [];
	users.forEach((user) => {
		newUsers.push({
			_id: user._id,
			name: user.name,
			phone: user.phone,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
			is_active: user.is_active,
			email_verified: user.email_verified,
			balance: {
				m: user.m_balance,
				b: user.b_balance,
				w: user.w_balance,
			},
		});
	});

	res.status(200).json({
		success: true,
		users: newUsers,
	});
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHander(`User does not exist with Id: ${req.params.id}`)
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
		active_status: req.body.active_status,
		balance: req.body.balance,
		pxc_balance: req.body.pxc_balance,
	};

	await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
		);
	}

	if (user.avatar.public_id) {
		const imageId = user.avatar.public_id;
		await cloudinary.v2.uploader.destroy(imageId);
	}

	await user.remove();

	res.status(200).json({
		success: true,
		message: 'User Deleted Successfully',
	});
});

// find user by phone number
exports.findUserByPhoneNumber = catchAsyncErrors(async (req, res, next) => {
	const user = await User.find({ phone: req.body.phone });

	if (!user) {
		return next(
			new ErrorHander(
				`User does not exist with phone number: ${req.body.phone_number}`,
				400
			)
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// resend email verification code
exports.resendEmailVerificationCode = catchAsyncErrors(
	async (req, res, next) => {
		const { phone } = req.query;
		const user = await User.findOne({ phone });
		if (!user) {
			return next(new ErrorHander('User not found', 404));
		}

		const code = Math.floor(100000 + Math.random() * 900000);
		user.verify_code = code;
		await user.save();

		const message = `Your verification code is ${code}`;
		sendEmail({
			email: user.email,
			subject: 'Email Verification Code',
			message,
		});

		res.status(200).json({
			success: true,
			message: 'Email verification code sent successfully',
		});
	}
);

// get logged in user details
exports.loadUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id).select('-password');
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	sendToken(user, 200, res);
});

// get user by phone
exports.getUserByPhone = catchAsyncErrors(async (req, res, next) => {
	const { phone } = req.query;
	// find user
	const user = await User.findOne({ phone });
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// get logged in user members
exports.getMembers = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// find members with sponsor.sponsor_id
	const members = await User.find({ 'sponsor.sponsor_id': user._id });
	if (!members) {
		return next(new ErrorHander('Members not found', 404));
	}
	// console.log(members.length);

	let newMembers = [];
	members.forEach((member) => {
		newMembers.push({
			_id: member._id,
			name: member.name,
			phone: member.phone,
			email: member.email,
			is_active: member.is_active,
			join_date: member.createdAt,
		});
	});

	res.status(200).json({
		success: true,
		members: newMembers,
	});
});

// get single user details for admin
exports.getSingleUserAdmin = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// find convert details
	const convertDetails = await ConvertDetails.findOne({
		user_id: user._id,
	});

	// find deposit details
	const depositDetails = await DepositDetails.findOne({ user_id: user._id });

	// find withdraw details
	const withdrawDetails = await WithdrawDetails.findOne({ user_id: user._id });

	// find lottery details
	const lotteryDetails = await LotteryDetails.findOne({ user_id: user._id });

	// find send details
	const sendDetails = await SendDetails.findOne({ user_id: user._id });

	res.status(200).json({
		success: true,
		user,
		convertDetails,
		depositDetails,
		withdrawDetails,
		lotteryDetails,
		sendDetails,
	});
});

// get logged in user team
exports.getTeam = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// get team
	const team = await Team.findOne({ user_id: user._id });
	if (!team) {
		return next(new ErrorHandler('Team not found', 404));
	}

	// find all members by level_1, level_2, level_3, level_4, level_5
	const level_1 = await User.find({ 'parent_1.customer_id': user.customer_id });
	// console.log(level_1.length);
	const level_2 = await User.find({ 'parent_2.customer_id': user.customer_id });
	// console.log(level_2.length);
	const level_3 = await User.find({ 'parent_3.customer_id': user.customer_id });
	// console.log(level_3.length);
	const level_4 = await User.find({ 'parent_4.customer_id': user.customer_id });
	// console.log(level_4.length);
	const level_5 = await User.find({ 'parent_5.customer_id': user.customer_id });
	// console.log(level_5.length);

	// all members
	let allMembers = [...level_1, ...level_2, ...level_3, ...level_4, ...level_5];

	let newMembers = [];
	let level = 1;
	for (let i = 0; i < allMembers.length; i++) {
		const member = allMembers[i];
		// console.log(member);

		// Define the level
		if (level_1.includes(member)) {
			level = 1;
		} else if (level_2.includes(member)) {
			level = 2;
		} else if (level_3.includes(member)) {
			level = 3;
		} else if (level_4.includes(member)) {
			level = 4;
		} else if (level_5.includes(member)) {
			level = 5;
		}

		newMembers.push({
			_id: member._id,
			name: member.name,
			phone: member.phone,
			email: member.email,
			is_active: member.is_active,
			join_date: member.createdAt,
			kyc_verified: member.kyc_verified,
			is_mining: member.is_mining,
			customer_id: member.customer_id,
			total_withdraw: member.total_withdraw,
			total_deposit: member.total_deposit,
			level,
		});
	}

	res.status(200).json({
		success: true,
		members: newMembers,
	});
});

// get logged in user level 1 members
exports.getLevel1Members = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find all members by level_1
	const level_1 = await User.find({ 'parent_1.customer_id': user.customer_id });
	// console.log(level_1.length);

	// all members
	let allMembers = [...level_1];

	let newMembers = [];
	for (let i = 0; i < allMembers.length; i++) {
		const member = allMembers[i];
		const mining = await Mining.findOne({ user_id: member._id }).select(
			'is_start'
		);

		newMembers.push({
			_id: member._id,
			name: member.name,
			phone: member.phone,
			email: member.email,
			is_active: member.is_active,
			join_date: member.createdAt,
			kyc_verified: member.kyc_verified,
			is_mining: member.is_mining,
			customer_id: member.customer_id,
			is_start: mining.is_start,
		});
	}

	res.status(200).json({
		success: true,
		members: newMembers,
	});
});

// change email
exports.changeEmail = catchAsyncErrors(async (req, res, next) => {
	const { email, newEmail, code } = req.body;

	// find user by email
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// check code is valid or not
	if (user.verify_code !== code) {
		return next(new ErrorHandler('Invalid code', 400));
	}

	// update user
	user.email = newEmail;
	user.verify_code = null;
	await user.save();

	// send verify code to user email
	sendEmail({
		email: email,
		subject: 'WFC Verification Code',
		message: `Dear ${user.name},\n\nYour new email address has been changed successfully to ${newEmail}.\n\nThanks,\nWFC Team`,
	});

	res.status(200).json({
		success: true,
		message: 'Email changed successfully',
	});
});

// verify code for change email
exports.verifyCodeForChangeEmail = catchAsyncErrors(async (req, res, next) => {
	const { email, newEmail } = req.body;
	console.log(email, newEmail);
	// check if email is already taken
	const existEmail = await User.findOne({ email: newEmail }).select('email');
	if (existEmail) {
		return next(new ErrorHandler('Email already taken', 400));
	}

	console.log(existEmail);

	const code = Math.floor(100000 + Math.random() * 900000);

	// find user by email
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	user.verify_code = code;
	await user.save();

	// send verify code to user email
	sendEmail({
		email: email,
		subject: 'WFC Verification Code',
		message: `Dear ${user.name},\n\nYour verification code is ${code}.\n\nThanks,\nWFC Team`,
	});

	res.status(200).json({
		success: true,
		message: 'Verification code sent successfully',
	});
});

// add phone number
exports.addPhoneNumber = catchAsyncErrors(async (req, res, next) => {
	const { phone, id } = req.body;

	// check if phone number is already taken
	const existPhone = await User.findOne({ phone: phone }).select('phone');
	if (existPhone) {
		return next(new ErrorHandler('Phone number already taken', 400));
	}

	// find user by id
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update user
	user.phone = phone;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'Phone number added successfully',
	});
});

// change phone number
exports.changePhoneNumber = catchAsyncErrors(async (req, res, next) => {
	const { newPhone, id } = req.body;

	// check if phone number is already taken
	const existUser = await User.findOne({ phone: newPhone }).select('phone');
	if (existUser) {
		return next(new ErrorHandler('Phone number already taken', 400));
	}

	// find user by id
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	//find play details
	const playDetails = await PlayDetails.findOne({ user_id: id });
	if (!playDetails) {
		return next(new ErrorHandler('Play details not found', 404));
	}

	// update user phone number
	user.phone = newPhone;
	await user.save();

	// update play details phone number
	playDetails.phone = newPhone;
	await playDetails.save();

	res.status(200).json({
		success: true,
		message: 'Phone number changed successfully',
	});
});

// update user profile picture
exports.updateProfilePicture = catchAsyncErrors(async (req, res, next) => {
	const { id, url } = req.body;
	// console.log(req.body);
	// find user by id
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update user profile picture
	user.avatar = {
		url: url,
	};
	await user.save();
	console.log(user.avatar);
	res.status(200).json({
		success: true,
		message: 'Profile picture updated successfully',
	});
});

// update user full name
exports.updateFullName = catchAsyncErrors(async (req, res, next) => {
	const { id, name } = req.body;
	// console.log(req.body);
	// find user by id
	const user = await User.findById(id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update user full name
	user.name = name;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'Full name updated successfully',
	});
});

// get logged in user transactions
exports.getTransactions = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find transactions
	const transactions = await Transaction.find({ user_id: user._id }).sort({
		createdAt: -1,
	});

	res.status(200).json({
		success: true,
		transactions,
	});
});

// get admin transactions
exports.getAdminTransactions = catchAsyncErrors(async (req, res, next) => {
	const transactions = await Transaction.find({ user_id: req.params.id })
		.sort({
			createdAt: -1,
		})
		.limit(300);

	res.status(200).json({
		success: true,
		transactions,
	});
});

// add all users parent 4 and 5 to default username = rwmaster
exports.addParent4And5 = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find({ role: 'user' });
	if (!users) {
		return next(new ErrorHandler('Users not found', 404));
	}

	// find default user by username = rwmaster
	const defaultUser = await User.findOne({ username: 'glomaxmaster' });
	if (!defaultUser) {
		return next(new ErrorHandler('Default user not found', 404));
	}

	// find default user team
	const defaultUserTeam = await Team.findOne({ user_id: defaultUser._id });
	if (!defaultUserTeam) {
		return next(new ErrorHandler('Default user team not found', 404));
	}

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		// console.log(user);

		// update user parent 4 and 5
		user.parent_4 = {
			customer_id: defaultUser.customer_id,
			name: defaultUser.name,
		};

		user.parent_5 = {
			customer_id: defaultUser.customer_id,
			name: defaultUser.name,
		};

		await user.save();

		// update default user team
		defaultUserTeam.level_4.push(user._id);
		defaultUserTeam.level_5.push(user._id);
		await defaultUserTeam.save();
	}

	res.status(200).json({
		success: true,
		message: 'Parent 4 and 5 added successfully',
	});
});

// every 1 minute corn job
cron.schedule('0 * * * *', async () => {
	// get all active users
	const users = await User.find({ is_active: true, rank_is_processing: false });
	if (!users) {
		console.log('users not found');
	}

	console.log('Length', users.length);

	// get all active users team
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		// console.log(user);

		// create rank record if not exist
		let rankRecord = await RankRecord.findOne({ user_id: user._id });
		if (!rankRecord) {
			rankRecord = await RankRecord.create({
				user_id: user._id,
				customer_id: user.customer_id,
				username: user.username,
			});
		}

		// find user team
		const team = await Team.findOne({ user_id: user._id });
		if (!team) {
			console.log('team not found');
		}

		// get all level 1 active members
		const level_1_count = await User.countDocuments({
			'parent_1.customer_id': user.customer_id,
			is_active: true,
		});

		// find level 1 members
		const level_1_members = await User.find({
			'parent_1.customer_id': user.customer_id,
			is_active: true,
		});

		// get all level 2 active members
		const level_2_count = await User.countDocuments({
			'parent_2.customer_id': user.customer_id,
			is_active: true,
		});

		// get all level 3 active members
		const level_3_count = await User.countDocuments({
			'parent_3.customer_id': user.customer_id,
			is_active: true,
		});

		// get all level 4 active members
		const level_4_count = await User.countDocuments({
			'parent_4.customer_id': user.customer_id,
			is_active: true,
		});

		// get all level 5 active members
		const level_5_count = await User.countDocuments({
			'parent_5.customer_id': user.customer_id,
			is_active: true,
		});

		const total_members =
			level_1_count +
			level_2_count +
			level_3_count +
			level_4_count +
			level_5_count;

		// console.log(
		// 	'Name',
		// 	user.name,
		// 	'Total Members',
		// 	total_members,
		// 	'Level 1',
		// 	level_1_count
		// );

		// for rank marvelous
		const gloriousUsers = level_1_members.filter(
			(member) => member.rank === 'glorious'
		);

		// for rank supreme
		const marvelousUsers = level_1_members.filter(
			(member) => member.rank === 'marvelous'
		);

		// update user rank
		if (user.rank === 'member' && level_1_count >= 5 && total_members >= 30) {
			user.rank_is_processing = true;
			user.processing_for = 'premier';
			user.rank_claimed = false;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'premier';
			rankRecord.current_rank_amount = 50;
			await rankRecord.save();

			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Premier Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		} else if (
			user.rank === 'premier' &&
			level_1_count >= 8 &&
			total_members >= 50
		) {
			user.rank_is_processing = true;
			user.processing_for = 'elite';
			user.rank_claimed = false;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'elite';
			rankRecord.current_rank_amount = 100;
			await rankRecord.save();
			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Elite Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		} else if (
			user.rank === 'elite' &&
			level_1_count >= 10 &&
			total_members >= 70
		) {
			user.rank_is_processing = true;
			user.processing_for = 'majestic';
			user.rank_claimed = false;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'majestic';
			rankRecord.current_rank_amount = 200;
			await rankRecord.save();
			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Majestic Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		} else if (
			user.rank === 'majestic' &&
			level_1_count >= 12 &&
			total_members >= 100
		) {
			user.rank_is_processing = true;
			user.processing_for = 'royal';
			user.rank_claimed = false;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'royal';
			rankRecord.current_rank_amount = 300;
			await rankRecord.save();
			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Royal Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		} else if (
			user.rank === 'royal' &&
			level_1_count >= 15 &&
			total_members >= 150
		) {
			user.rank_is_processing = true;
			user.processing_for = 'glorious';
			user.rank_claimed = false;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'glorious';
			rankRecord.current_rank_amount = 500;
			await rankRecord.save();
			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Glorious Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		} else if (
			user.rank === 'glorious' &&
			gloriousUsers.length >= 5 &&
			total_members >= 600
		) {
			user.rank_is_processing = true;
			user.processing_for = 'marvelous';
			user.rank_claimed = false;
			user.is_salary = true;
			await user.save();

			// update rank record
			rankRecord.current_rank = 'marvelous';
			rankRecord.current_rank_amount = 500;
			rankRecord.current_salary = 200;
			rankRecord.salary_start_date = Date.now();
			await rankRecord.save();
			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Rank Promotion',
				description: `Congratulations! You have been promoted to Marvelous Rank.
				Please claim your rank bonus.
				`,
				url: '/rank-claim',
			});
			console.log(userNotification);
			global.io.emit('user-notification', userNotification);
		}
	}
});

// update all users rank_is_processing: false
exports.updateAllUsersRankIsProcessing = catchAsyncErrors(
	async (req, res, next) => {
		const users = await User.find();
		if (!users) {
			console.log('users not found');
		}

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			user.rank_is_processing = false;
			await user.save();
		}

		res.status(200).json({
			success: true,
			message: 'All users rank_is_processing: false updated successfully',
		});
	}
);

// claim rank bonus
exports.claimRankBonus = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find rank record
	let rankRecord = await RankRecord.findOne({ user_id: user._id });
	if (!rankRecord) {
		// create rank record
		rankRecord = await RankRecord.create({
			user_id: user._id,
			customer_id: user.customer_id,
			username: user.username,
		});
	}

	const numAmount = Number(rankRecord.current_rank_amount);

	// check if user rank_is_processing: true
	if (user.rank_is_processing === false) {
		return next(new ErrorHandler('Please wait for rank update', 400));
	}

	// check if user rank_claimed: true
	if (user.rank_claimed === true) {
		return next(new ErrorHandler('Rank bonus already claimed', 400));
	}

	// update user rank_claimed: true
	user.m_balance += numAmount;
	createTransaction(
		user._id,
		'cashIn',
		numAmount,
		user.m_balance + user.a_balance,
		'bonus',
		`Rank Bonus from Glomax rank of ${rankRecord.current_rank}`
	);
	user.b_balance += numAmount;
	user.rank_claimed = true;
	user.rank_is_processing = false;
	user.rank = rankRecord.current_rank;
	await user.save();

	// update rank record
	rankRecord.rank_history.push({
		rank: rankRecord.current_rank,
		updated_at: Date.now(),
		amount: numAmount,
	});
	rankRecord.ranks.push(rankRecord.current_rank);
	rankRecord.total_rank_bonus += numAmount;
	await rankRecord.save();

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// update company

	company.cost.total_cost += numAmount;
	await company.save();

	console.log('rank bonus claimed', user.name);
	res.status(200).json({
		success: true,
		message: 'Rank bonus claimed successfully',
	});
});

// add all users is_block: false
exports.updateAllUsersIsBlock = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();
	if (!users) {
		console.log('users not found');
	}

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		user.is_block = false;
		await user.save();
	}

	res.status(200).json({
		success: true,
		message: 'All users is_block: false updated successfully',
	});
});

// change user status by user id
exports.changeUserStatus = catchAsyncErrors(async (req, res, next) => {
	const { user_id, status } = req.body;
	// console.log(user_id, status);

	// find user
	const user = await User.findById(user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// console.log(user.full_name);

	// update user status
	user.is_active = status;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'User status updated successfully',
	});
});

// change block status by user id
exports.changeBlockStatus = catchAsyncErrors(async (req, res, next) => {
	const { user_id, block } = req.body;
	// console.log(user_id, block);

	// find user
	const user = await User.findById(user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// console.log(user.full_name);

	// update user status
	user.is_block = block;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'User block status updated successfully',
	});
});

// update rank records
exports.updateRankRecords = catchAsyncErrors(async (req, res, next) => {
	// find user rank is premier || elite || majestic || royal || glorious || marvelous
	const users = await User.find({
		$or: [
			{ rank: 'premier' },
			{ rank: 'elite' },
			{ rank: 'majestic' },
			{ rank: 'royal' },
			{ rank: 'glorious' },
			{ rank: 'marvelous' },
		],
	});

	console.log(users.length);

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		// console.log(user);

		// create rank record if not exist
		let rankRecord = await RankRecord.findOne({ user_id: user._id });
		if (!rankRecord) {
			rankRecord = await RankRecord.create({
				user_id: user._id,
				customer_id: user.customer_id,
				username: user.username,
			});
		}

		if (user.rank === 'premier') {
			rankRecord.current_rank = 'premier';
			rankRecord.current_rank_amount = 50;
			rankRecord.rank_updated_at = user.rank_details.achieved_date;
			rankRecord.rank_history.push({
				rank: user.rank,
				updated_at: user.rank_details.achieved_date,
				amount: 50,
			});
			rankRecord.ranks.push('premier');
			rankRecord.total_rank_bonus = 50;
			await rankRecord.save();
		} else if (user.rank === 'elite') {
			rankRecord.current_rank = 'elite';
			rankRecord.current_rank_amount = 100;
			rankRecord.rank_updated_at = user.rank_details.achieved_date;
			rankRecord.rank_history.push({
				rank: user.rank,
				updated_at: user.rank_details.achieved_date,
				amount: 100,
			});
			rankRecord.ranks.push('premier ', 'elite');
			rankRecord.total_rank_bonus = 150;
			await rankRecord.save();
		} else if (user.rank === 'majestic') {
			rankRecord.current_rank = 'majestic';
			rankRecord.current_rank_amount = 200;
			rankRecord.rank_updated_at = user.rank_details.achieved_date;
			rankRecord.rank_history.push({
				rank: user.rank,
				updated_at: user.rank_details.achieved_date,
				amount: 200,
			});
			rankRecord.ranks.push('premier ', 'elite', 'majestic');
			rankRecord.total_rank_bonus = 350;
			await rankRecord.save();
		} else if (user.rank === 'royal') {
			rankRecord.current_rank = 'royal';
			rankRecord.current_rank_amount = 300;
			rankRecord.rank_updated_at = user.rank_details.achieved_date;
			rankRecord.rank_history.push({
				rank: user.rank,
				updated_at: user.rank_details.achieved_date,
				amount: 300,
			});
			rankRecord.ranks.push('premier ', 'elite', 'majestic', 'royal');
			rankRecord.total_rank_bonus = 650;
			await rankRecord.save();
		} else if (user.rank === 'glorious') {
			rankRecord.current_rank = 'glorious';
			rankRecord.current_rank_amount = 500;
			rankRecord.rank_updated_at = user.rank_details.achieved_date;
			rankRecord.rank_history.push({
				rank: user.rank,
				updated_at: user.rank_details.achieved_date,
				amount: 500,
			});
			rankRecord.ranks.push(
				'premier ',
				'elite',
				'majestic',
				'royal',
				'glorious'
			);
			rankRecord.total_rank_bonus = 1150;
			await rankRecord.save();
		}
	}

	res.status(200).json({
		success: true,
		message: 'Rank records updated successfully',
	});
});

// get logged in user rank record
exports.getRankRecord = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find rank records
	const rankRecord = await RankRecord.findOne({ user_id: user._id });

	res.status(200).json({
		success: true,
		rankRecord,
	});
});

// get logged in user rank members
exports.getRankMembers = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// get team
	const team = await Team.findOne({ user_id: user._id });
	if (!team) {
		return next(new ErrorHandler('Team not found', 404));
	}

	// get all level 1 active members
	const level_1_count = await User.countDocuments({
		'parent_1.customer_id': user.customer_id,
		is_active: true,
	});

	// find level 1 members
	const level_1_members = await User.find({
		'parent_1.customer_id': user.customer_id,
		is_active: true,
	});

	// get all level 2 active members
	const level_2_count = await User.countDocuments({
		'parent_2.customer_id': user.customer_id,
		is_active: true,
	});

	// get all level 3 active members
	const level_3_count = await User.countDocuments({
		'parent_3.customer_id': user.customer_id,
		is_active: true,
	});

	// get all level 4 active members
	const level_4_count = await User.countDocuments({
		'parent_4.customer_id': user.customer_id,
		is_active: true,
	});

	// get all level 5 active members
	const level_5_count = await User.countDocuments({
		'parent_5.customer_id': user.customer_id,
		is_active: true,
	});

	const total_members =
		level_1_count +
		level_2_count +
		level_3_count +
		level_4_count +
		level_5_count;

	// console.log(
	// 	'Name',
	// 	user.name,
	// 	'Total Members',
	// 	total_members,
	// 	'Level 1',
	// 	level_1_count
	// );

	// filter premier members
	const premierUsers = level_1_members.filter(
		(member) => member.rank === 'premier'
	);

	// filter elite members
	const eliteUsers = level_1_members.filter(
		(member) => member.rank === 'elite'
	);

	// filter majestic members
	const majesticUsers = level_1_members.filter(
		(member) => member.rank === 'majestic'
	);

	// filter royal members
	const royalUsers = level_1_members.filter(
		(member) => member.rank === 'royal'
	);

	// for rank marvelous
	const gloriousUsers = level_1_members.filter(
		(member) => member.rank === 'glorious'
	);

	res.status(200).json({
		success: true,
		premierUsers,
		eliteUsers,
		majesticUsers,
		royalUsers,
		gloriousUsers,
	});
});

// get logged in user rank members
exports.getRankMembersByRank = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	const { rank } = req.params;

	// get team
	const team = await Team.findOne({ user_id: user._id });
	if (!team) {
		return next(new ErrorHandler('Team not found', 404));
	}

	// find level 1 members
	const level_1_members = await User.find({
		'parent_1.customer_id': user.customer_id,
		is_active: true,
	});

	// filter premier members
	const users = level_1_members.filter(
		(member) => member.rank === rank.toLowerCase()
	);

	res.status(200).json({
		success: true,
		users,
	});
});

// create all active user rank record
exports.createAllActiveUserRankRecord = catchAsyncErrors(
	async (req, res, next) => {
		// get all active users
		const users = await User.find({ is_active: true });
		if (!users) {
			console.log('users not found');
		}

		console.log('Length', users.length);

		// get all active users team
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			// console.log(user);

			// create rank record if not exist
			let rankRecord = await RankRecord.findOne({ user_id: user._id });
			if (!rankRecord) {
				rankRecord = await RankRecord.create({
					user_id: user._id,
					customer_id: user.customer_id,
					username: user.username,
				});
			}
		}
		res.status(200).json({
			success: true,
			message: 'All active user rank record created successfully',
		});
	}
);

// remove previous 1 month transactions
exports.removePreviousMonthTransactions = catchAsyncErrors(
	async (req, res, next) => {
		const transactions = await Transaction.find({
			createdAt: {
				$lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
			},
		});
		if (!transactions) {
			console.log('transactions not found');
		}

		console.log('Length', transactions.length);

		for (let i = 0; i < transactions.length; i++) {
			const transaction = transactions[i];
			// console.log(transaction);
			await transaction.remove();
		}

		res.status(200).json({
			success: true,
			message: 'All previous month transactions removed successfully',
		});
	}
);

// remove 5 ago all transactions
exports.remove5AgoTransactions = catchAsyncErrors(async (req, res, next) => {
	const transactions = await Transaction.find({
		createdAt: {
			$lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		},
	});
	if (!transactions) {
		console.log('transactions not found');
	}

	console.log('Length', transactions.length);

	for (let i = 0; i < transactions.length; i++) {
		const transaction = transactions[i];
		// console.log(transaction);
		await transaction.remove();
	}

	res.status(200).json({
		success: true,
		length: transactions.length,
		message: 'All 5 ago transactions removed successfully',
	});
});

// check user m_balance and ai_balance is less than 30 if yes then update is_active: false
exports.checkUserBalance = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find({ is_active: true, ai_robot: false });
	if (!users) {
		console.log('users not found');
	}

	console.log('Length', users.length);

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		// console.log(user);

		const total = user.m_balance + user.ai_balance;

		if (total < 30) {
			user.is_active = false;
			// await user.save();

			console.log('In Active', user.name);

			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Account Deactivated',
				description: `Your account has been deactivated due to insufficient balance. Please deposit minimum 30 USD to activate your account.`,
				url: '/deposit',
			});

			global.io.emit('user-notification', userNotification);
		}
	}

	res.status(200).json({
		success: true,
		message: 'User balance checked successfully',
	});
});

cron.schedule('0 * * * *', async () => {
	console.log('Cron job started 1min');
	const users = await User.find({ is_active: true, ai_robot: false });
	if (!users) {
		console.log('users not found');
	}

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		// console.log(user);

		// console.log('Active > 30', user.name, user.customer_id);

		const total = user.m_balance + user.ai_balance;

		if (total < 30) {
			user.is_active = false;
			await user.save();

			// console.log('In Active', user.name);

			// send notification to user
			const userNotification = await UserNotification.create({
				user_id: user._id,
				subject: 'Account Deactivated',
				description: `Your account has been deactivated due to insufficient balance. Please deposit minimum 30 USD to activate your account.`,
				url: '/deposits',
			});

			global.io.emit('user-notification', userNotification);
		}
	}
});
