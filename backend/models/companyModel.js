const { toolresults_v1beta3 } = require('googleapis');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		short_name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		website: {
			type: String,
			trim: true,
		},
		currency: {
			type: String,
			default: 'USDT',
		},
		address: {
			type: String,
			trim: true,
		},

		city: {
			type: String,
			trim: true,
		},

		state: {
			type: String,
			trim: true,
		},

		zip: {
			type: String,
			trim: true,
		},

		country: {
			type: String,
			default: 'Canada',
		},

		// coin options

		// about
		about: {
			type: String,
			trim: true,
		},
		// company logo
		logo: {
			logo_white_1: {
				type: String,
				default: '',
			},
			logo_white_2: {
				type: String,
				default: '',
			},
			logo_black_1: {
				type: String,
				default: '',
			},
			logo_black_2: {
				type: String,
				default: '',
			},
			logo_icon: {
				type: String,
			},
		},

		//users
		users: {
			total_users: {
				type: Number,
				default: 0,
			},
			new_users: {
				type: Number,
				default: 0,
			},
			email_verified_users: {
				type: Number,
				default: 0,
			},
			total_active_users: {
				type: Number,
				default: 0,
			},
			logged_in_users: {
				type: Number,
				default: 0,
			},
			kyc_verified_users: {
				type: Number,
				default: 0,
			},
		},

		// lottery options
		lottery: {
			isLottery: {
				type: Boolean,
				default: true,
			},
			totalSellCount: {
				type: Number,
				default: 0,
			},
			totalSellAmount: {
				type: Number,
				default: 0,
			},

			lotteryProfit: {
				type: Number,
				default: 0,
			},
			todayProfit: {
				type: Number,
				default: 0,
			},
		},

		//draw options

		isDraw: {
			type: Boolean,
			default: true,
		},
		totalDrawCount: {
			type: Number,
			default: 0,
		},
		active_draw_id: {
			type: String,
			default: '',
		},
		active_draw_title: {
			type: String,
			default: '',
		},

		active_draw_profit: {
			type: Number,
			default: 0,
		},

		// ticket options
		total_tickets: {
			type: Number,
			default: 0,
		},

		// withdraw options
		withdraw: {
			is_withdraw: {
				type: Boolean,
				default: true,
			},

			total_withdraw_amount: {
				type: Number,
				default: 0,
			},

			total_withdraw_count: {
				type: Number,
				default: 0,
			},

			total_w_charge: {
				type: Number,
				default: 0,
			},

			// total withdraw balance is user total active balance
			total_withdraw_balance: {
				type: Number,
				default: 0,
			},

			pending_withdraw_amount: {
				type: Number,
				default: 0,
			},
			pending_withdraw_count: {
				type: Number,
				default: 0,
			},

			total_c_w_amount: {
				type: Number,
				default: 0,
			},
		},

		// total cost
		cost: {
			total_cost: {
				type: Number,
				default: 0,
			},
			lottery_cost: {
				type: Number,
				default: 0,
			},
			lucky_box_cost: {
				type: Number,
				default: 0,
			},
			signup_bonus_cost: {
				type: Number,
				default: 0,
			},
			referral_bonus_cost: {
				type: Number,
				default: 0,
			},
			mining_cost: {
				type: Number,
				default: 0,
			},
			ai_robot_cost: {
				type: Number,
				default: 0,
			},
			game_cost: {
				type: Number,
				default: 0,
			},
		},
		// total income
		income: {
			total_income: {
				type: Number,
				default: 0,
			},
			lottery_income: {
				type: Number,
				default: 0,
			},
			withdraw_charge: {
				type: Number,
				default: 0,
			},
			game_income: {
				type: Number,
				default: 0,
			},
			trading_income: {
				type: Number,
				default: 0,
			},
			kyc_charge: {
				type: Number,
				default: 0,
			},
			ai_robot_income: {
				type: Number,
				default: 0,
			},
		},

		// deposit options
		deposit: {
			total_deposit_count: {
				type: Number,
				default: 0,
			},
			total_deposit_amount: {
				type: Number,
				default: 0,
			},

			total_d_bonus: {
				type: Number,
				default: 0,
			},
			new_deposit_amount: {
				type: Number,
				default: 0,
			},
			new_deposit_count: {
				type: Number,
				default: 0,
			},
			rejected_deposit_amount: {
				type: Number,
				default: 0,
			},
			rejected_deposit_count: {
				type: Number,
				default: 0,
			},
		},

		//verify options
		kyc_verify: {
			pending: {
				type: Number,
				default: 0,
			},
			verified: {
				type: Number,
				default: 0,
			},
			rejected: {
				type: Number,
				default: 0,
			},
			new_verify: {
				type: Number,
				default: 0,
			},
		},

		// bonus percentage (signup, referral, deposit, mining)
		bonus: {
			// signup bonus 100 wfc
			signup_bonus: {
				type: Number,
				default: 2,
			},
			referral_bonus: {
				type: Number,
				default: 0,
			},

			deposit_bonus: {
				type: Number,
				default: 0,
			},
			// mining bonus 0.01wfc/hour add to user mining balance
			mining_bonus: {
				type: Number,
				default: 0.01,
			},

			// mining rafflers bonus 50 wfc
			mining_rb: {
				type: Number,
				default: 50,
			},
		},

		// charge percentage (withdraw, trading)
		charge: {
			// withdraw charge 3%
			withdraw_charge: {
				type: Number,
				default: 0.03,
			},
			// trading charge 0.1%
			trading_charge: {
				type: Number,
				default: 0.001,
			},

			// kyc charge fixed 2 usdt
			kyc_charge: {
				type: Number,
				default: 2,
			},
		},

		// game options
		game: {
			game_count: {
				type: Number,
				default: 0,
			},
			trading_charge: {
				type: Number,
				default: 0,
			},
			game_profit: {
				type: Number,
				default: 0,
			},
			trading_profit: {
				type: Number,
				default: 0,
			},
			game_cost: {
				type: Number,
				default: 0,
			},
			game_bonus: {
				type: Number,
				default: 0,
			},
		},

		// trade options
		total_trade_amount: {
			type: Number,
			default: 0,
		},

		// total active balance
		total_active_balance: {
			type: Number,
			default: 0,
		},

		// total user main balance
		total_main_balance: {
			type: Number,
			default: 0,
		},

		// total user ai balance
		total_ai_balance: {
			type: Number,
			default: 0,
		},

		total_ai_robot_balance: {
			type: Number,
			default: 0,
		},

		// total profit
		total_profit: {
			type: Number,
			default: 0,
		},

		// target value
		target: {
			// target value 10000000 usdt
			deposit: {
				type: Number,
				default: 10000000,
			},
			// target value 0 usdt
			withdraw: {
				type: Number,
				default: 0,
			},
		},

		notifications: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Notification',
			},
		],
	},
	{ timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
