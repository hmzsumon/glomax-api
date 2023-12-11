const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kycSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		customer_id: {
			type: String,
		},
		name: {
			type: String,
			required: true,
		},

		address: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},

		zip_code: {
			type: String,
			required: true,
		},

		country: {
			type: String,
			required: true,
		},
		nid_no: {
			type: String,
			required: true,
		},

		// document_1 (nid front) and document_2 (nid back)
		nid_1_url: {
			type: String,
		},
		nid_2_url: {
			type: String,
		},
		photo_url: {
			type: String,
		},
		is_verified: {
			type: Boolean,
			default: false,
		},
		is_rejected: {
			type: Boolean,
			default: false,
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
		reject_reasons: [],
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

module.exports = mongoose.model('KycVerify', kycSchema);
