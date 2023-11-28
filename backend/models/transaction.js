const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		amount: { type: Number, required: true },

		transactionType: {
			type: String,
			enum: ['cashIn', 'cashOut'],
			required: true,
		},
		purpose: {
			type: String,
			required: true,
		},
		isCashIn: {
			type: Boolean,
			default: false,
		},
		isCashOut: {
			type: Boolean,
			default: false,
		},
		balance: {
			type: Number,
			default: 0,
		},
		currency: { type: String, default: 'USDT' },
		description: { type: String, default: 'Transaction' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
