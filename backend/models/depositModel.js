const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		customer_id: {
			type: String,
		},
		name: {
			type: String,
		},
		phone: {
			type: String,
		},
		amount: {
			type: Number,
			required: [true, 'Amount is required'],
		},

		transactionId: {
			type: String,
			required: [true, 'Transaction ID is required'],
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		approvedAt: {
			type: Date,
		},
		approved_by: {
			type: String,
		},
		// rejected
		rejectedAt: {
			type: Date,
		},
		reason: {
			type: String,
		},
		rejected_by: {
			type: String,
		},
		update_by: {
			type: String,
		},
		is_rejected: {
			type: Boolean,
			default: false,
		},
		is_approved: {
			type: Boolean,
			default: false,
		},
		comment: {
			type: String,
		},
		is_bonus: {
			type: Boolean,
			default: false,
		},
		is_demo: {
			type: Boolean,
			default: false,
		},
		sl_no: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Deposit', depositSchema);
