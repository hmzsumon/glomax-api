const mongoose = require('mongoose');

const shareCardDetailsSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		name: {
			type: String,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
		},
		total_card_qty: {
			type: Number,
			default: 0,
		},
		total_card_amount: {
			type: Number,
			default: 0,
		},
		expire_card_qty: {
			type: Number,
			default: 0,
		},
		total_profit: {
			type: Number,
			default: 0,
		},

		total_sold_card_qty: {
			type: Number,
			default: 0,
		},
		total_sold_card_amount: {
			type: Number,
			default: 0,
		},
		total_sold_bonus: {
			type: Number,
			default: 0,
		},
		draw_profit: [
			{
				draw_name: {
					type: String,
				},
				draw_date: {
					type: Date,
				},
				draw_profit: {
					type: Number,
					default: 0,
				},
				net_profit: {
					type: Number,
					default: 0,
				},
			},
		],
		share_cards: [
			{
				card_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'ShareCard',
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ShareCardDetails', shareCardDetailsSchema);
