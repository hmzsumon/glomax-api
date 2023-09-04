const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sendDetailsSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		total_send_amount: {
			type: Number,
			default: 0,
		},

		total_send_count: {
			type: Number,
			default: 0,
		},
		last_send_amount: {
			type: Number,
			default: 0,
		},
		last_receiver: {
			name: {
				type: String,
			},
			phone: {
				type: String,
			},
		},
		last_send_date: {
			type: Date,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SendDetails', sendDetailsSchema);
