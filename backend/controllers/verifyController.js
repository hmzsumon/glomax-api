const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const {
	sendEmail,
	sendMe,
	sendVerificationEmail,
} = require('../utils/sendEmail');
const cloudinary = require('cloudinary');
const Verify = require('../models/verifyModel');
const Company = require('../models/companyModel');
const { verify } = require('crypto');
const companyId = process.env.COMPANY_ID;

// Create new verification request => /api/v1/verify
exports.newVerify = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id || req.user._id);
	// company find by company id
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// check if user has already sent a verification request
	if (user.is_verify_request) {
		return next(
			new ErrorHander(
				'You have already sent a verification request. Please wait for the admin to verify your account.',
				400
			)
		);
	}
	const imagesLink = [];
	for (let i = 0; i < req.files.length; i++) {
		const result = await cloudinary.v2.uploader.upload(req.files[i].path, {
			folder: 'verify-documents',
		});
		imagesLink.push({
			public_id: result.public_id,
			url: result.secure_url,
		});
	}

	const verify = await Verify.create({
		user_id: req.user.id || req.user._id,
		name: user.name,
		email: user.email,
		document_1: {
			public_id: imagesLink[0].public_id,
			url: imagesLink[0].url,
		},
		document_2: {
			public_id: imagesLink[1].public_id,
			url: imagesLink[1].url,
		},
		avatar: {
			public_id: imagesLink[2].public_id,
			url: imagesLink[2].url,
		},
		method: req.body.method,
	});

	// update user's is_verified to false
	user.is_verify_request = true;
	await user.save({ validateBeforeSave: false });

	// update company's verify pending count
	company.verify.pending += 1;
	company.verify.new_verify += 1;
	await company.save({ validateBeforeSave: false });

	// send email to admin
	await sendEmail({
		email: company.email,
		subject: `New verification request from ${user.name}`,
		message: `Please verify ${user.name}'s account`,
	});

	// send email to user
	await sendVerificationEmail({
		email: user.email,
		subject: `Verification request sent`,
		message: `Your verification request has been sent to the admin. Please wait for the admin to verify your account.`,
	});

	res.status(200).json({
		success: true,
		message: 'Verification request sent',
		verify,
	});
});

// test file upload with cloudinary
exports.test = catchAsyncErrors(async (req, res, next) => {
	console.log('req.files', req.files.path);
	for (let i = 0; i < req.files.length; i++) {
		console.log('i', req.files[i]);
		const result = await cloudinary.v2.uploader.upload(req.files[i].path, {
			folder: 'verify-documents',
		});
		console.log('R', result);
	}

	res.status(200).json({
		success: true,
	});
});

// Get all verification requests => /api/v1/verify
exports.getVerifications = catchAsyncErrors(async (req, res, next) => {
	const verifications = await Verify.find();
	res.status(200).json({
		success: true,
		verifications,
	});
});

// Get single verification request => /api/v1/verify/:id
exports.getVerification = catchAsyncErrors(async (req, res, next) => {
	const verification = await Verify.findById(req.params.id);
	if (!verification) {
		return next(new ErrorHander('Verification request not found', 404));
	}
	res.status(200).json({
		success: true,
		verification,
	});
});

// approve verification request => /api/v1/verify/:id/approve
exports.approveVerification = catchAsyncErrors(async (req, res, next) => {
	const verification = await Verify.findById(req.params.id);
	if (!verification) {
		return next(new ErrorHander('Verification request not found', 404));
	}

	// get admin's id
	const admin = await User.findById(req.user.id || req.user._id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}

	// update company's verify pending count
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// update verification request's status to approved
	verification.status = 'approved';
	verification.approved_at = Date.now();
	verification.is_verified = true;
	verification.update_by.userId = admin._id;
	verification.update_by.name = admin.name;
	await verification.save({ validateBeforeSave: false });

	// update user's is_verified to true
	const user = await User.findById(verification.user_id);
	user.is_identity_verified = true;
	user.is_verify_request = false;
	await user.save({ validateBeforeSave: false });

	company.verify.pending -= 1;
	company.verify.approved += 1;
	await company.save({ validateBeforeSave: false });

	// send email to user
	await sendVerificationEmail({
		email: user.email,
		subject: `Verification request approved`,
		message: `Your verification request has been approved by the admin. You can now start using the app.`,
	});

	// send email to admin
	await sendEmail({
		email: company.email,
		subject: `Verification request approved`,
		message: `Verification request for ${user.name} has been approved.`,
	});

	res.status(200).json({
		success: true,
		message: 'Verification request approved',
	});
});

// reject verification request => /api/v1/verify/:id/reject
exports.rejectVerification = catchAsyncErrors(async (req, res, next) => {
	const verification = await Verify.findById(req.body.id);
	if (!verification) {
		return next(new ErrorHander('Verification request not found', 404));
	}

	// update user's is_verified to false
	const user = await User.findById(verification.user_id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// update company's verify pending count
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// update verification request's status to rejected
	verification.status = 'rejected';
	verification.rejected_at = Date.now();
	verification.is_verified = false;
	verification.reject_reason = req.body.reject_reason;
	verification.update_by.userId = req.user.id || req.user._id;
	verification.update_by.name = req.user.name;
	await verification.save({ validateBeforeSave: false });

	// update user's is_verified to false
	user.is_identity_verified = false;
	user.is_verify_request = false;
	await user.save({ validateBeforeSave: false });

	company.verify.pending -= 1;
	company.verify.rejected += 1;
	await company.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
		message: 'Verification request rejected',
	});
});

// test
exports.testBody = catchAsyncErrors(async (req, res, next) => {
	console.log('req.body', req.body);
	console.log('req.params', req.params);
	res.status(200).json({
		success: true,
		message: 'test',
	});
});
