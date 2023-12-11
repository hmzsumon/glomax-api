const ErrorHandler = require('../utils/errorhandler');
const UserNotification = require('../models/userNotification');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const KycVerify = require('../models/kycModel');
const { sendEmail } = require('../utils/sendEmail');
const templateKycApprove = require('../utils/templateKycApprove');
const templateKycReject = require('../utils/templateKycReject');

// get all pending kyc
exports.getAllPendingKyc = catchAsyncErrors(async (req, res, next) => {
	const kyc = await KycVerify.find({ status: 'pending' });

	const kycList = await Promise.all(
		kyc.map(async (neKyc) => {
			const user = await User.findById(neKyc.user_id, {
				email: 1,
				m_balance: 1,
				ai_balance: 1,
				p_ai_balance: 1,
				rank: 1,
			});

			return {
				_id: neKyc._id,
				user_id: neKyc.user_id,
				customer_id: neKyc.customer_id,
				name: neKyc.name,
				email: user.email,
				address: neKyc.address,
				city: neKyc.city,
				user_country: neKyc.country,
				zip_code: neKyc.zip_code,
				balance: user.m_balance + user.ai_balance + user.p_ai_balance,
				rank: user.rank,
			};
		})
	);

	res.status(200).json({
		success: true,
		kycList,
	});
});

// get single pending kyc
exports.getSinglePendingKyc = catchAsyncErrors(async (req, res, next) => {
	// console.log('req.params.id', req.params.id);
	const kyc = await KycVerify.findById(req.params.id);
	const user = await User.findById(kyc.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	const newKyc = {
		_id: kyc._id,
		user_id: kyc.user_id,
		customer_id: kyc.customer_id,
		name: kyc.name,
		email: user.email,
		address: kyc.address,
		city: kyc.city,
		user_country: kyc.country,
		zip_code: kyc.zip_code,
		balance: user.m_balance + user.ai_balance + user.p_ai_balance,
		rank: user.rank,
		nid_1: kyc.nid_1_url,
		nid_2: kyc.nid_2_url,
		photo: kyc.photo_url,
		status: kyc.status,
		date: kyc.createdAt,
		join_date: user.createdAt,
		nid_no: kyc.nid_no,
	};

	res.status(200).json({
		success: true,
		kyc: newKyc,
	});
});

// approve kyc
exports.approveKyc = catchAsyncErrors(async (req, res, next) => {
	const kyc = await KycVerify.findById(req.params.id);
	if (!kyc) {
		return next(new ErrorHandler('KYC not found', 404));
	}
	const user = await User.findById(kyc.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update kyc
	kyc.status = 'approved';
	kyc.is_verified = true;
	await kyc.save();

	// update user
	user.kyc_verified = true;
	user.is_verify_request = false;
	await user.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'KYC Approved',
		description: 'Your KYC has been approved',
		link: '/profile',
	});

	global.io.emit('user-notification', userNotification);

	// send email to user
	const html = templateKycApprove(user.name);

	await sendEmail({
		email: user.email,
		subject: 'KYC Approved',
		html,
	});
	res.status(200).json({
		success: true,
		message: 'KYC approved',
	});
});

// kyc reject
exports.rejectKyc = catchAsyncErrors(async (req, res, next) => {
	const { reasons, id } = req.body;

	const kyc = await KycVerify.findById(id);
	if (!kyc) {
		return next(new ErrorHandler('KYC not found', 404));
	}
	const user = await User.findById(kyc.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update kyc
	kyc.status = 'rejected';
	kyc.is_verified = false;
	kyc.reject_reasons = reasons;
	await kyc.save();

	// update user
	user.kyc_verified = false;
	user.is_verify_request = false;
	await user.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'KYC Rejected',
		description: `Your KYC has been rejected. Reasons: ${reasons}`,
		link: '/profile',
	});

	global.io.emit('user-notification', userNotification);

	// send email to user
	const html = templateKycReject(user.name, reasons);

	await sendEmail({
		email: user.email,
		subject: 'KYC Rejected',
		html,
	});

	// remove this kyc
	await KycVerify.findByIdAndDelete(id);
	res.status(200).json({
		success: true,
		message: 'KYC rejected',
	});
});
