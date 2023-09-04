const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lotteryDetailsSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		name: {
			type: String,
			trim: true,
			required: true,
		},
		total_lottery_amount: {
			type: Number,
			default: 0,
		},
		total_lottery_count: {
			type: Number,
			default: 0,
		},
		total_lost__amount: {
			type: Number,
			default: 0,
		},
		total_win_amount: {
			type: Number,
			default: 0,
		},
		total_lucky_box_count: {
			type: Number,
			default: 0,
		},
		total_lucky_b_amount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('LotteryDetails', lotteryDetailsSchema);
