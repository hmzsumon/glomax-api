const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kycSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		// document_1 (nid front) and document_2 (nid back)
		document_1: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		document_2: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		selfie: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		is_verified: {
			type: Boolean,
			default: false,
		},
		is_rejected: {
			type: Boolean,
			default: false,
		},

		method: {
			type: String,
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		approved_at: {
			type: Date,
		},
		rejected_at: {
			type: Date,
		},
		reject_reason: {
			type: String,
		},
		update_by: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Verify', verifySchema);
