const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
	getAllPendingKyc,
	getSinglePendingKyc,
	approveKyc,
} = require('../controllers/kycController');

// get pending kyc
router
	.route('/admin/kyc/pending')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getAllPendingKyc);

// get single pending kyc
router
	.route('/admin/kyc/pending/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getSinglePendingKyc);

// approve kyc
router
	.route('/admin/kyc/approve/:id')
	.put(isAuthenticatedUser, authorizeRoles('admin'), approveKyc);

module.exports = router;
