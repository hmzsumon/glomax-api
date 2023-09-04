const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
	{
		serialNumber: {
			type: Number,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		phone: {
			type: String,
		},
		email: {
			type: String,
		},
		ownerName: {
			type: String,
		},
		status: {
			type: String,
			enum: [
				'pending',
				'cancelled',
				'expired',
				'win',
				'loser',
				'cart',
				'refunded',
				'sold',
			],
			default: 'pending',
		},

		ticketNumber: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		firstPrize: {
			type: Number,
			required: true,
		},
		is_sold: {
			type: Boolean,
			default: false,
		},
		is_winner: {
			type: Boolean,
			default: false,
		},
		is_loser: {
			type: Boolean,
			default: false,
		},
		is_refunded: {
			type: Boolean,
			default: false,
		},
		is_draw: {
			type: Boolean,
			default: false,
		},
		buyDate: {
			type: Date,
		},
		drawDate: {
			type: Date,
		},
		drawTime: {
			type: String,
		},
		next_draw_date: {
			type: Date,
		},
		next_draw_time: {
			type: String,
		},
		draw_no: {
			type: Number,
			default: 0,
		},
		draw_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Draw',
			required: [true, 'Draw id is required'],
		},
		draw_title: {
			type: String,
		},
		position: {
			type: Number,
			default: 0,
		},
		prize_amount: {
			type: Number,
			default: 0,
		},
		prize_title: {
			type: String,
		},
		lucky_box_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'LuckyBox',
		},
		lucky_box_amount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
