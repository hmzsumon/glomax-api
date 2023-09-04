const mongoose = require('mongoose');

const adminWinnerSchema = mongoose.Schema(
	{
		game_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'WinGame',
		},
		period_no: {
			type: Number,
		},
		game_type: {
			type: String,
		},
		winner: {
			number: {
				type: String,
			},
			bet_ids: [],
			length: {
				type: Number,
			},
			color_codes: [],
		},
		trade_amount: {
			type: Number,
		},
		trade_charge: {
			type: Number,
		},
		loss: {
			type: Number,
		},
		profit: {
			type: Number,
		},
		participants: {
			type: Number,
		},
	},
	{ timestamps: true }
);

const AdminWinner = mongoose.model('AdminWinner', adminWinnerSchema);

module.exports = AdminWinner;
