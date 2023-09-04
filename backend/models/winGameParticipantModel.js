const mongoose = require('mongoose');

const winGameParticipantSchema = new mongoose.Schema(
	{
		game_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'WinGame',
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		period: {
			type: Number,
		},
		customer_id: {
			type: String,
			require: true,
		},
		user_balance: {
			type: Number,
			default: 0,
		},
		name: {
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
		profit: {
			type: Number,
			default: 0,
		},
		percentage: {
			type: Number,
			default: 0,
		},
		win_amount: {
			type: Number,
			default: 0,
		},
		loss_amount: {
			type: Number,
			default: 0,
		},
		trade_colors: [],
		trade_number: {
			type: String,
		},
		status: {
			type: String,
			enum: ['pending', 'win', 'lose'],
			default: 'pending',
		},
		game_type: {
			type: String,
		},
		bet_id: {
			type: String,
		},
		multiplier: {
			type: Number,
		},
		result: [],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('WinGameParticipant', winGameParticipantSchema);
