const Notice = require('../models/notice');
const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create Notice
exports.createNotice = catchAsyncErrors(async (req, res, next) => {
	req.body.user = req.user.id;

	const notice = await Notice.create(req.body);

	res.status(201).json({
		success: true,
		notice,
	});
});

// update Notice
exports.updateNotice = catchAsyncErrors(async (req, res, next) => {
	let notice = await Notice.findById(req.params.id);

	if (!notice) {
		return next(new ErrorHander('No notice found with that ID', 404));
	}

	notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		notice,
	});
});

// delete Notice
exports.deleteNotice = catchAsyncErrors(async (req, res, next) => {
	const notice = await Notice.findById(req.params.id);

	if (!notice) {
		return next(new ErrorHander('No notice found with that ID', 404));
	}

	await notice.remove();

	res.status(200).json({
		success: true,
		message: 'Notice deleted successfully',
	});
});

// get all Notices
exports.getAllNotices = catchAsyncErrors(async (req, res, next) => {
	const notices = await Notice.find();

	res.status(200).json({
		success: true,
		notices,
	});
});

// get single Notice
exports.getSingleNotice = catchAsyncErrors(async (req, res, next) => {
	const notice = await Notice.findById(req.params.id);

	if (!notice) {
		return next(new ErrorHander('No notice found with that ID', 404));
	}

	res.status(200).json({
		success: true,
		notice,
	});
});

// find Notice by active
exports.findNoticeByActive = catchAsyncErrors(async (req, res, next) => {
	const notice = await Notice.findOne({ active: true });

	res.status(200).json({
		success: true,
		notice,
	});
});

// update Notice status
exports.updateNoticeStatus = catchAsyncErrors(async (req, res, next) => {
	const notice = await Notice.updateOne(
		req.params.id,
		{
			active: req.body.status,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	if (!notice) {
		return next(new ErrorHander('No notice found with that ID', 404));
	}

	res.status(200).json({
		success: true,
		notice,
	});
});

// active a new Notice and deactive the old one
exports.activeNewNotice = catchAsyncErrors(async (req, res, next) => {
	const activeNotice = await Notice.findOne({ active: true });
	if (activeNotice) {
		await activeNotice.updateOne({ active: false });
	}
	const notice = await Notice.findById(req.params.id);
	if (!notice) {
		return next(new ErrorHander('No notice found with that ID', 404));
	}
	await notice.updateOne({ active: true });

	res.status(200).json({
		success: true,
		notice,
	});
});
