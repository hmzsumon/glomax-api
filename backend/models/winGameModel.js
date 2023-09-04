const mongoose = require('mongoose');

const winGameSchema = new mongoose.Schema(
	{
		game_id: {
			type: String,
			require: true,
		},
		time: {
			type: Number,
			require: true,
		},
		game_type: {
			type: String,
			enum: ['1m', '3m', '5m'],
		},
		game_title: {
			type: String,
		},
		win_number: {
			type: Number,
		},
		win_colors: [],
		participants: {
			type: Number,
			default: 0,
		},
		winners: {
			type: Number,
			default: 0,
		},
		losers: {
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
		total_win_amount: {
			type: Number,
			default: 0,
		},
		total_lose_amount: {
			type: Number,
			default: 0,
		},
		start_time: {
			type: Date,
		},
		end_time: {
			type: Date,
		},
		duration: {
			type: Number,
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		buttons: [
			{
				btn_id: {
					type: String,
				},
				total_amount: {
					type: Number,
				},
			},
		],
		profit: {
			type: Number,
		},
		loss: {
			type: Number,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('WinGame', winGameSchema);
