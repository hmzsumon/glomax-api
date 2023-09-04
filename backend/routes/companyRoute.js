const express = require('express');
const {
	createCompany,
	getCompanyAdmin,
	clearDailyWorkTodayWorkUsers,
	restCompany,
} = require('../controllers/companyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/company').post(createCompany);

router
	.route('/admin/company')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getCompanyAdmin);

router
	.route('/admin/company/clear-daily-work-today-work-users')
	.put(
		isAuthenticatedUser,
		authorizeRoles('admin'),
		clearDailyWorkTodayWorkUsers
	);

// rest company
router
	.route('/admin/company/reset')
	.put(isAuthenticatedUser, authorizeRoles('admin'), restCompany);

module.exports = router;
