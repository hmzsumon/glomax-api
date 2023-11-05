const mongoose = require('mongoose');
const User = require('../models/userModel');
const { stringify } = require('uuid');

const withdrawSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		customer_id: {
			type: String,
			require: true,
		},
		email: {
			type: String,
			require: true,
		},
		name: {
			type: String,
			require: true,
		},
		phone: {
			type: String,
			require: true,
		},
		amount: {
			type: Number,
			require: true,
		},
		net_amount: {
			type: Number,
		},
		charge: {
			type: Number,
			require: true,
		},
		method: {
			name: {
				type: String,
			},
			network: {
				type: String,
			},
			address: {
				type: String,
			},
			pay_id: {
				type: String,
			},
		},
		// crypto details
		crypto: {
			crypto_name: {
				type: String,
			},
			wallet_address: {
				type: String,
			},
			tnx_id: {
				type: String,
			},
		},
		// bank details
		bank: {
			bank_name: {
				type: String,
				trim: true,
			},
			branch_name: {
				type: String,
				trim: true,
			},
			swift_code: {
				type: String,
				trim: true,
			},
			account_name: {
				type: String,
				trim: true,
			},
			account_number: {
				type: String,
				trim: true,
			},
		},
		status: {
			type: String,
			enum: ['pending', 'failed', 'cancelled', 'approved'],
			default: 'pending',
		},
		// approved
		approved_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		approved_at: {
			type: Date,
		},
		is_approved: {
			type: Boolean,
			default: false,
		},
		approved_method: {
			name: {
				type: String,
				default: 'binance',
			},
			network: {
				type: String,
			},
			address: {
				type: String,
			},
			pay_id: {
				type: String,
			},
			tnx_id: {
				type: String,
			},
		},
		// cancelled
		cancelled_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		cancelled_at: {
			type: Date,
		},
		is_cancelled: {
			type: Boolean,
		},
		cancelled_reason: {
			type: String,
			default: 'Not specified',
		},
		comment: {
			type: String,
			default: 'No comment',
		},
		approved_crypto: {
			crypto_name: {
				type: String,
			},
			wallet_address: {
				type: String,
			},

			tnx_id: {
				type: String,
			},
		},

		approved_bank: {
			bank_name: {
				type: String,
				trim: true,
			},
			branch_name: {
				type: String,
				trim: true,
			},
			swift_code: {
				type: String,
				trim: true,
			},
			account_name: {
				type: String,
				trim: true,
			},
			account_number: {
				type: String,
				trim: true,
			},
			transaction_id: {
				type: String,
				trim: true,
			},

			transaction_date: {
				type: Date,
			},

			transaction_amount: {
				type: Number,
			},
		},
		is_new: {
			type: Boolean,
			default: true,
		},
		sl_no: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Withdraw', withdrawSchema);
