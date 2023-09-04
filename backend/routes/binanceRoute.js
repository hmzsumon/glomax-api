const express = require('express');
const { getBinance } = require('../controllers/binanceController');

const router = express.Router();

router.route('/').get(getBinance);

module.exports = router;
