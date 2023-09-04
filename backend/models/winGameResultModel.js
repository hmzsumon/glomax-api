const mongoose = require('mongoose');

const winGameResultSchema = new mongoose.Schema(
	{
		game_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'WinGame',
		},
		game_type: {
			type: String,
		},
		period_no: {
			type: Number,
		},
		win_colors: [],
		win_number: {
			type: String,
		},
		total_win_amount: {
			type: Number,
			default: 0,
		},
		total_lose_amount: {
			type: Number,
			default: 0,
		},
		total_trade_amount: {
			type: Number,
			default: 0,
		},
		total_trade_charge: {
			type: Number,
			default: 0,
		},
		participated_users_id: [],
		participants_count: {
			type: Number,
			default: 0,
		},
		profit: {
			type: Number,
		},
		loss: {
			type: Number,
		},
		winners_count: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

const WinGameResult = mongoose.model('WinGameResult', winGameResultSchema);
module.exports = WinGameResult;
