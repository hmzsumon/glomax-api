const express = require('express');
const {
	createTrade,
	updateTrade,
	myTrades,
	testBull,
} = require('../controllers/tradeController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// create trade
router.route('/trade').post(isAuthenticatedUser, createTrade);

// update trade
router.route('/update/trade').put(isAuthenticatedUser, updateTrade);

// get my trades
router.route('/my/trades').get(isAuthenticatedUser, myTrades);

// test bull
router.route('/test/bull').get(testBull);

module.exports = router;
