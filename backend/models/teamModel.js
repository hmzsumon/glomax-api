const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
		},
		email: {
			type: String,
			required: [true, 'Please enter team email'],
		},
		level_1: [],
		level_2: [],
		level_3: [],
		//mining user
		active_mining_users: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
