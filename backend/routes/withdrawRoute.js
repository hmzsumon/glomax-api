const express = require('express');
const multer = require('multer');
const {
	newWithdrawRequest,
	myWithdraws,
	getWithdraw,
	allWithdraws,
	getWithdrawForAdmin,
	approveWithdraw,
	cancelWithdraw,
} = require('../controllers/withdrawController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const upload = multer({});

// Create new withdraw request => /api/v1/withdraw/new
router
	.route('/new/withdraw')
	.post(upload.none(), isAuthenticatedUser, newWithdrawRequest);

// Get my withdraws => /api/v1/withdraw/mywithdraws
router.route('/my-withdraws').get(isAuthenticatedUser, myWithdraws);

// Get a single withdraw => /api/v1/withdraw/:id
router.route('/withdraw/:id').get(isAuthenticatedUser, getWithdraw);

// Get all withdraws admin and manager
router
	.route('/admin/withdraws')
	.get(isAuthenticatedUser, authorizeRoles('admin', 'manager'), allWithdraws);

// Get single withdraw for admin and manager => /api/v1/admin/withdraw/:id
router
	.route('/admin/withdraw/:id')
	.get(
		isAuthenticatedUser,
		authorizeRoles('admin', 'manager'),
		getWithdrawForAdmin
	);

// Approve withdraw request => /api/v1/admin/withdraw/:id/approve
router
	.route('/withdraw/approve')
	.put(
		upload.none(),
		isAuthenticatedUser,
		authorizeRoles('admin', 'manager'),
		approveWithdraw
	);

// Cancel withdraw request => /api/v1/admin/withdraw/:id/cancel
router
	.route('/withdraw/cancel')
	.put(
		upload.none(),
		isAuthenticatedUser,
		authorizeRoles('admin', 'manager'),
		cancelWithdraw
	);

module.exports = router;
