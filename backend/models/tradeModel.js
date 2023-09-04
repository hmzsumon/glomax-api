const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
		},
		amount: {
			type: Number,
			default: 0,
		},
		trade_charge: {
			type: Number,
			default: 0,
		},
		trade_amount: {
			type: Number,
			default: 0,
		},
		trade_type: {
			type: String,
			required: true,
		},
		open_price: {
			type: Number,
			default: 0,
		},
		close_price: {
			type: Number,
			default: 0,
		},
		profit: {
			type: Number,
			default: 0,
		},
		loss: {
			type: Number,
			default: 0,
		},

		status: {
			type: String,
			default: 'pending',
		},
		open_time: {
			type: Date,
		},
		close_time: {
			type: Date,
		},
		duration: {
			type: Number,
			default: 0,
		},
		time: {
			type: Number,
			default: 0,
		},
		symbol: {
			type: String,
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		result: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Trade', tradeSchema);
