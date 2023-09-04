const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const luckyBoxSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		ticket_no: {
			type: String,
		},
		lucky_amount: {
			type: Number,
			required: true,
			default: 0,
		},
		openDate: {
			type: Date,
		},
		status: {
			type: String,
			enum: ['open', 'pending', 'cancelled', 'expired'],
			default: 'pending',
		},
		isOpen: {
			type: Boolean,
			default: false,
		},
		box_type: {
			type: String,
			enum: ['register', 'ticket', 'platinum'],
			default: 'register',
		},
	},
	{
		timestamps: true,
	}
);

const LuckyBox = mongoose.model('LuckyBox', luckyBoxSchema);
module.exports = LuckyBox;
