const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const miningSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		mining_balance: {
			type: Number,
			default: 0,
		},
		// today mining balance
		daily_mining_balance: {
			type: Number,
			default: 0,
		},
		total_members: {
			type: Number,
			default: 0,
		},

		mining_bonus: {
			type: Number,
			default: 0,
		},
		// speed amount 0.2/hour
		start_speed: {
			type: Number,
			default: 0.2,
		},
		total_sped_amount: {
			type: Number,
			default: 0.2,
		},

		// speed up level
		speed_up: {
			level_1: {
				type: Number,
				default: 0,
			},
			level_2: {
				type: Number,
				default: 0,
			},
			level_3: {
				type: Number,
				default: 0,
			},
		},
		start_at: {
			type: Date,
		},
		end_at: {
			type: Date,
		},
		// per day
		mining_time: {
			type: Number,
			default: 1440,
		},
		// total mining time
		total_mining_time: {
			type: Number,
			default: 0,
		},
		member_count: {
			level_1: {
				type: Number,
				default: 0,
			},
			level_2: {
				type: Number,
				default: 0,
			},
			level_3: {
				type: Number,
				default: 0,
			},
		},
		
		is_start: {
			type: Boolean,
			default: false,
		},
		is_active: {
			type: Boolean,
			default: false,
		},
		parents: [],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Mining', miningSchema);
