const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
	newVerify,
	test,
	getVerifications,
	getVerification,
	approveVerification,
	rejectVerification,
	testBody,
} = require('../controllers/verifyController');
const router = express.Router();

const storage = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			return cb(res.status(400).end('only jpg, png, jpeg is allowed'), false);
		}
		cb(null, true);
	},
});

// create new verification request => /api/v1/verify
router
	.route('/new/verify')
	.post(storage.array('images'), isAuthenticatedUser, newVerify);

// test file upload with cloudinary
router.route('/test/upload').post(storage.array('images'), test);

// Get all verification requests => /api/v1/verify
router
	.route('/admin/verifications')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getVerifications);

// Get single verification request => /api/v1/verify/:id
router
	.route('/admin/verification/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getVerification);

router
	.route('/verification/approve/:id')
	.put(isAuthenticatedUser, authorizeRoles('admin'), approveVerification);

router
	.route('/reject/verification')
	.put(
		storage.none(),
		isAuthenticatedUser,
		authorizeRoles('admin'),
		rejectVerification
	);

router.route('/test-body').post(storage.none(), testBody);

module.exports = router;
