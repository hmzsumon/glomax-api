const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		test_id: {
			type: Number,
		},
		time: {
			type: Number,
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
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Test', testSchema);
