const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const drawSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			unique: [true, 'Draw title already exists'],
			trim: true,
		},
		draw_no: {
			type: Number,
			required: true,
			unique: [true, 'Draw number already exists'],
		},
		draw_date: {
			type: Date,
			required: true,
		},
		draw_time: {
			type: String,
			default: '12:00 AM',
		},
		prizes: [
			{
				prize_title: {
					type: String,
					required: true,
				},
				prize_amount: {
					type: Number,
					required: true,
				},
				position: {
					type: Number,
					required: true,
				},
				qty: {
					type: Number,
					required: true,
				},
			},
		],
		prize_qty: {
			type: Number,
			default: 0,
		},
		ticket_price: {
			type: Number,
			default: 0,
		},
		ticket_qty: {
			type: Number,
			default: 0,
		},

		ticket_sold_amount: {
			type: Number,
			default: 0,
		},
		ticket_sold_qty: {
			type: Number,
			default: 0,
		},
		remaining_tickets: {
			type: Number,
			default: 0,
		},
		sold_tickets: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Ticket',
			},
		],
		total_cost: {
			type: Number,
			default: 0,
		},
		prize_cost: {
			type: Number,
			default: 0,
		},
		lucky_box_cost: {
			type: Number,
			default: 0,
		},
		other_cost: {
			type: Number,
			default: 0,
		},
		profit: {
			type: Number,
			default: 0,
		},
		potential_profit: {
			type: Number,
			default: 0,
		},
		winners: [
			{
				name: {
					type: String,
				},
				phone: {
					type: String,
				},
				email: {
					type: String,
				},
				ticket_no: {
					type: String,
				},
				prize_name: {
					type: String,
				},
				prize_amount: {
					type: Number,
				},
				position: {
					type: Number,
				},
			},
		],
		is_draw: {
			type: Boolean,
			default: false,
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		published_date: {
			type: Date,
		},
		published_by: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		create_by: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		creator_name: {
			type: String,
		},
		//user participants
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		participants_count: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Draw = mongoose.model('Draw', drawSchema);
module.exports = Draw;
