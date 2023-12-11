const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please Enter Your Name'],
			maxLength: [150, 'Name cannot exceed 150 characters'],
			minLength: [3, 'Name should have more than 4 characters'],
			trim: true,
		},
		username: {
			type: String,
			trim: true,
			maxLength: [30, 'Name cannot exceed 30 characters'],
			minLength: [3, 'Name should have more than 4 characters'],
			required: [true, 'Please Enter Your Nick Name'],
		},
		email: {
			type: String,
			required: [true, 'Please Enter Your Email'],
			validate: [validator.isEmail, 'Please Enter a valid Email'],
		},
		phone: {
			type: String,
			minLength: [10, 'Phone number should have 10 characters'],
			maxLength: [14, 'Phone number should have 10 characters'],
			trim: true,
		},
		customer_id: {
			type: String,
			trim: true,
		},

		password: {
			type: String,
			minLength: [6, 'Password should be greater than 6 characters'],
			select: false,
		},
		text_password: {
			type: String,
		},
		avatar: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
				default:
					'https://res.cloudinary.com/duza4meju/image/upload/v1689803248/profil_pic_sowggl.png',
			},
		},
		role: {
			type: String,
			enum: ['user', 'admin', 'support', 'super', 'manager'],
			default: 'user',
		},

		// balance option
		// main balance (over view balance)
		m_balance: {
			type: Number,
			default: 0,
		},

		e_balance: {
			type: Number,
			default: 0,
		},

		// ai balance (ai balance is used for ai trading)
		ai_balance: {
			type: Number,
			default: 0,
		},

		p_ai_balance: {
			type: Number,
			default: 0,
		},

		// trading volume (trading volume is used for trading)
		trading_volume: {
			type: Number,
			default: 0,
		},

		// bonus balance (usdt balance is used for usdt trading)
		b_balance: {
			type: Number,
			default: 0,
		},

		// active  balance (active balance is used for  coin trading)
		active_balance: {
			type: Number,
			default: 0,
		},

		// total loss balance (total loss balance is used for loss trading)
		total_loss: {
			type: Number,
			default: 0,
		},

		// total win balance (total win balance is used for win trading)
		total_win: {
			type: Number,
			default: 0,
		},

		// total deposit
		total_deposit: {
			type: Number,
			default: 0,
		},

		// total withdraw
		total_withdraw: {
			type: Number,
			default: 0,
		},

		// rebate
		trade_com: {
			level_1: {
				type: Number,
				default: 0,
			},
			level_2: {
				type: Number,
				default: 0,
			},
			level_3: {
				type: Number,
				default: 0,
			},
			level_4: {
				type: Number,
				default: 0,
			},
			level_5: {
				type: Number,
				default: 0,
			},
		},

		total_commission: {
			type: Number,
			default: 0,
		},

		// trade option
		active_trade: {
			type: Number,
			default: 0,
		},

		// referral bonus
		referral_bonus: {
			type: Number,
			default: 0,
		},

		//signup bonus
		signup_bonus: {
			type: Number,
			default: 0,
		},

		total_receive_amount: {
			type: Number,
			default: 0,
		},

		total_send: {
			type: Number,
			default: 0,
		},
		is_send: {
			type: Boolean,
			default: false,
		},
		referral_code: {
			type: String,
		},

		// email verification
		verify_code: {
			type: String,
		},
		email_verified: {
			type: Boolean,
			default: false,
		},
		// kyc verification
		kyc_verified: {
			type: Boolean,
			default: false,
		},
		is_verify_request: {
			type: Boolean,
			default: false,
		},

		// status
		is_active: {
			type: Boolean,
			default: false,
		},

		parent_1: {
			customer_id: {
				type: String,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},
		parent_2: {
			customer_id: {
				type: String,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},
		parent_3: {
			customer_id: {
				type: String,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},

		parent_4: {
			customer_id: {
				type: String,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},

		parent_5: {
			customer_id: {
				type: String,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},

		level_1_count: {
			type: Number,
			default: 0,
		},
		level_2_count: {
			type: Number,
			default: 0,
		},
		level_3_count: {
			type: Number,
			default: 0,
		},

		level_4_count: {
			type: Number,
			default: 0,
		},

		level_5_count: {
			type: Number,
			default: 0,
		},

		notifications: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Notification',
			},
		],
		QRCode: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},

		is_newUser: {
			type: Boolean,
			default: true,
		},

		is_winner: {
			type: Boolean,
			default: false,
		},

		login_info: {
			date: {
				type: Date,
			},
			ip_address: {
				type: String,
			},
		},

		last_login_info: {
			date: {
				type: Date,
			},
			ip_address: {
				type: String,
			},
		},

		//2fa
		two_factor_enabled: {
			type: Boolean,
			default: false,
		},

		// ai robot
		ai_robot: {
			type: Boolean,
			default: false,
		},

		// rank details
		rank: {
			type: String,
			enum: [
				'rm',
				'member',
				'premier',
				'elite',
				'majestic',
				'royal',
				'glorious',
				'marvelous',
				'supreme',
			],
			default: 'member',
		},
		rank_is_processing: {
			type: Boolean,
			default: false,
		},

		// processing for
		processing_for: {
			type: String,
		},

		rank_claimed: {
			type: Boolean,
			default: true,
		},

		// rank details
		rank_details: {
			rank: {
				type: String,
			},
			achieved_date: {
				type: Date,
			},
			amount: {
				type: Number,
			},
		},

		is_salary: {
			type: Boolean,
			default: false,
		},

		is_withdraw_requested: {
			type: Boolean,
			default: false,
		},

		is_deposit_requested: {
			type: Boolean,
			default: false,
		},

		is_can_withdraw: {
			type: Boolean,
			default: false,
		},

		is_block: {
			type: Boolean,
			default: false,
		},

		promo_code: {
			type: String,
		},

		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
	// Generating Token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hashing and adding resetPasswordToken to userSchema
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
