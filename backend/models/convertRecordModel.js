const mongoose = require('mongoose');

const convertRecordSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
			required: true,
		},
		username: {
			type: String,
		},
		total_convert: {
			type: Number,
			default: 0,
		},
		main_to_ai_total: {
			type: Number,
			default: 0,
		},
		ai_to_main_total: {
			type: Number,
			default: 0,
		},
		last_convert: {
			date: {
				type: Date,
			},
			amount: {
				type: Number,
				default: 0,
			},
			from: {
				type: String,
			},
		},
	},
	{
		timestamps: true,
	}
);

const ConvertRecord = mongoose.model('ConvertRecord', convertRecordSchema);

module.exports = ConvertRecord;
