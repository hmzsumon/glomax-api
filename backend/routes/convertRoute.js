const express = require('express');
const {
	getAllConvert,
	convert,
	createConvertRecord,
	getAllConvertRecord,
} = require('../controllers/convertController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/convert').get(getAllConvert).post(isAuthenticatedUser, convert);

router.route('/convert-record').post(createConvertRecord);

router.route('/convert-records').get(isAuthenticatedUser, getAllConvertRecord);

module.exports = router;
