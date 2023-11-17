const mongoose = require('mongoose');

const txIdSchema = new mongoose.Schema(
	{
		tx_id: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		is_pending: {
			type: Boolean,
			default: true,
		},

		is_approved: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('TxId', txIdSchema);
