const express = require('express');
const router = express.Router();
const { createWinner } = require('../controllers/adminWinnerController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router
	.route('/admin/winner')
	.post(isAuthenticatedUser, authorizeRoles('admin'), createWinner);

module.exports = router;
