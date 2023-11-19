const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankRecordSchema = new Schema(
	{
		user_id: { type: Schema.Types.ObjectId, ref: 'User' },
		customer_id: {
			type: String,
		},
		username: {
			type: String,
		},
		email: {
			type: String,
		},
		ranks: [],
		current_rank: {
			type: String,
		},
		current_rank_amount: {
			type: Number,
		},
		rank_achieve_at: {
			type: Date,
		},
		rank_history: [
			{
				rank: {
					type: String,
				},
				updated_at: {
					type: Date,
				},
				amount: {
					type: Number,
				},
			},
		],
		current_salary: {
			type: Number,
			default: 0,
		},
		salary_start_date: {
			type: Date,
		},

		salary_history: [
			{
				amount: {
					type: Number,
				},
				for_rank: {
					type: String,
				},
				paid_at: {
					type: Date,
				},
			},
		],

		salary_count: {
			type: Number,
			default: 0,
		},

		total_salary: {
			type: Number,
			default: 0,
		},

		total_rank_bonus: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('RankRecord', rankRecordSchema);
