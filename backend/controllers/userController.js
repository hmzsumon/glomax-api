const ErrorHandler = require('../utils/errorhandler');
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
		.padStart(8, '0');
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
		return next(new ErrorHandler('Invalid referral id', 400));
	}

	// 9 digit customer id
	const customer_id = generateUniqueId().substring(0, 9);

	// 6 digit verification code
	const verify_code = Math.floor(100000 + Math.random() * 900000);

	// console.log(nick_name);
	const user = await User.create({
		name,
		username,
		email,
		phone,
		customer_id,
		role: 'user',
		password,
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
		'bonus',
		`Signup bonus $2.00 from Glomax`
	);
	user.signup_bonus += 2;
	user.trading_volume += 2 * 5;
	company.total_trade_volume += 2 * 5;
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
	createTransaction(user._id, 'cashIn', 100, 'bonus', `Signup Bonus from`);
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
		return next(new ErrorHander('User not found', 404));
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
			new ErrorHander(
				'Reset Password Token is invalid or has been expired',
				400
			)
		);
	}

	if (req.body.password !== req.body.confirmPassword) {
		return next(new ErrorHander('Password does not password', 400));
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

	// find all members by level_1, level_2, level_3
	const level_1 = await User.find({ 'parent_1.customer_id': user.customer_id });
	// console.log(level_1.length);
	const level_2 = await User.find({ 'parent_2.customer_id': user.customer_id });
	// console.log(level_2.length);
	const level_3 = await User.find({ 'parent_3.customer_id': user.customer_id });
	// console.log(level_3.length);

	// all members
	let allMembers = [...level_1, ...level_2, ...level_3];

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
