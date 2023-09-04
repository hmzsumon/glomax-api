const mongoose = require('mongoose');

const aiRobotRecordSchema = new mongoose.Schema(
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
		total_robot_count: {
			type: Number,
			default: 0,
		},
		total_profit: {
			type: Number,
			default: 0,
		},
		t_close_robot: {
			type: Number,
			default: 0,
		},
		t_cancel_robot: {
			type: Number,
			default: 0,
		},
		t_trade_charge: {
			type: Number,
			default: 0,
		},
		t_cancel_charge: {
			type: Number,
			default: 0,
		},
		active_robot_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'AiRobot',
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('AiRobotRecord', aiRobotRecordSchema);
