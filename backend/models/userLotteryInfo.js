const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userLotteryInfoSchema = new Schema(
	{
		// user
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		total_tickets_by: {
			type: Number,
			default: 0,
		},
		total_tickets_count: {
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
		lucky_box_wine_amount: {
			type: Number,
			default: 0,
		},
		wining_tickets: [],
		losing_tickets: [],
	},
	{
		timestamps: true,
	}
);

const UserLotteryInfo = mongoose.model(
	'UserLotteryInfo',
	userLotteryInfoSchema
);

module.exports = UserLotteryInfo;
