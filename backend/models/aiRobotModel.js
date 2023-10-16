const mongoose = require('mongoose');

const aiRobotSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
		},
		total_investment: {
			type: Number,
			default: 0,
		},
		current_investment: {
			type: Number,
			default: 0,
		},
		profit: {
			type: Number,
			default: 0,
		},
		total_profit: {
			type: Number,
			default: 0,
		},
		last_price: {
			type: Number,
			default: 0,
		},
		price_range: {
			type: String,
		},
		open_time: {
			type: Date,
		},
		close_time: {
			type: Date,
		},
		time: {
			type: Number,
			default: 8900,
		},

		grid_no: {
			type: Number,
		},
		pair: {
			type: String,
		},
		mode: {
			type: String,
			default: 'Arithmetic',
		},
		status: {
			type: String,
			default: 'pending',
		},
		profit_percent: {
			type: String,
		},
		stop_loss: {
			type: Number,
			default: 0,
		},
		take_profit: {
			type: Number,
			default: 0,
		},
		trade_charge: {
			type: Number,
			default: 0,
		},
		cancel_charge: {
			type: Number,
			default: 0,
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		refund_amount: {
			type: Number,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('AiRobot', aiRobotSchema);
