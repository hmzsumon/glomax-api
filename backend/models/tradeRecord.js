const mongoose = require('mongoose');

const tradeRecordSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
		},
		name: {
			type: String,
		},
		total_trade_amount: {
			type: Number,
			default: 0,
		},
		total_loss: {
			type: Number,
			default: 0,
		},
		total_profit: {
			type: Number,
			default: 0,
		},
		last_trade_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Trade',
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('TradeRecord', tradeRecordSchema);
