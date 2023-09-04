const ErrorHander = require('../utils/errorhander');
const Draw = require('../models/drawModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const LotteryDetails = require('../models/lotteryDetails');
const LuckyBox = require('../models/luckyBoxModel');
const Ticket = require('../models/ticketModel');

const sendToken = require('../utils/jwtToken');
const {
	sendEmail,
	sendMe,
	sendVerificationEmail,
} = require('../utils/sendEmail');
const crypto = require('crypto');

const createTransaction = require('../utils/tnx');
const { v4: uuidv4 } = require('uuid');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;

// crete new draw => /api/v1/draw/new
exports.newDraw = catchAsyncErrors(async (req, res, next) => {
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}

	// admin role
	if (admin.role !== 'admin') {
		return next(new ErrorHander('Only admin can create draw', 403));
	}

	// find active draw and make it inactive
	const activeDraw = await Draw.findOne({ is_active: true });
	if (activeDraw) {
		activeDraw.is_active = false;
		await activeDraw.save();
	}

	// find user is_winner true and make it false
	const winners = await User.find({ is_winner: true });
	if (winners) {
		winners.forEach(async (winner) => {
			winner.is_winner = false;
			await winner.save();
		});
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}
	const { title, draw_time, prizes, ticket_price, ticket_qty } = req.body;

	// draw no
	const draw_no = (await Draw.countDocuments()) + 1;

	let today = new Date();
	let tomorrow = new Date();
	const draw_date = tomorrow.setDate(today.getDate() + 3);

	// get prize cost
	let prize_cost = 0;
	prizes.forEach((prize) => {
		prize_cost += prize.prize_amount * prize.qty;
	});

	// prize qty
	const prize_qty = prizes.reduce((acc, prize) => acc + prize.qty, 0);

	// get profit
	const potential_profit = ticket_price * ticket_qty - prize_cost;

	// create draw
	const draw = await Draw.create({
		title,
		draw_no,
		draw_date,
		draw_time,
		prizes,
		ticket_price,
		ticket_qty,
		create_by: admin._id,
		creator_name: admin.name,
		prize_cost,
		total_cost: prize_cost,
		potential_profit,
		remaining_tickets: ticket_qty,
		prize_qty,
	});

	// create tickets bu ticket_qty
	for (let i = 0; i < ticket_qty; i++) {
		// generate ticket uniq number
		const ticketNumber = Math.floor(1000000 + Math.random() * 9000000);

		// serial number
		const serialNumber = i + 1;

		// check if ticket number already exists
		const ticket = await Ticket.findOne({ ticketNumber });
		if (ticket) {
			// if ticket number already exists, generate new one
			i--;
			continue;
		}

		// create ticket
		await Ticket.create({
			ticketNumber,
			serialNumber,
			price: ticket_price,
			firstPrize: prizes[0].prize_amount,
			next_draw_time: draw.draw_time,
			next_draw_date: draw.draw_date,
			draw_no: draw.draw_no,
			draw_title: draw.title,
			draw_id: draw._id,
		});
	}

	// update company
	company.total_tickets += ticket_qty;
	await company.save();

	res.status(200).json({
		success: true,
		message: 'New Draw',
		draw,
	});
});

// get active draw => /api/v1/draw/active
exports.getActiveDraw = catchAsyncErrors(async (req, res, next) => {
	// find is_active draw
	const draw = await Draw.findOne({ is_active: true }).select(
		'-profit -potential -ticket_sold_amount'
	);
	if (!draw) {
		return next(new ErrorHander('No active draw', 404));
	}
	res.status(200).json({
		success: true,
		draw,
	});
});

// get draw for admin
exports.getDrawForAdmin = catchAsyncErrors(async (req, res, next) => {
	// find is_active draw
	const draw = await Draw.findOne({ is_active: true });
	if (!draw) {
		return next(new ErrorHander('No active draw', 404));
	}
	const tickets = await Ticket.find({ draw_id: draw._id });
	res.status(200).json({
		success: true,
		draw,
		tickets,
	});
});

//==============================================================
//===================== Winners Publish ========================

// publish winners
exports.publishWinners = catchAsyncErrors(async (req, res, next) => {
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}
	const winners = req.body;
	if (!winners) {
		return next(new ErrorHander('No winners', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// find is_active draw
	const draw = await Draw.findOne({ is_active: true });
	if (!draw) {
		return next(new ErrorHander('No active draw', 404));
	}

	//find sold tickets of draw
	const soldTickets = await Ticket.find({ draw_id: draw._id, is_sold: true });
	if (soldTickets < 1) {
		return next(new ErrorHander('No tickets found', 404));
	}
	// console.log(soldTickets.length);
	// update draw
	draw.is_active = false;
	draw.is_published = true;
	draw.draw_date = new Date();
	draw.draw_time = new Date().toLocaleString().split(',')[1].trim();
	draw.is_draw = true;
	draw.winners = winners;
	draw.published_date = new Date();
	draw.published_by = admin._id;
	await draw.save();

	// update tickets
	soldTickets.forEach(async (ticket) => {
		const winner = winners.find((winner) => {
			return winner.ticket_no === ticket.ticketNumber;
		});
		if (winner) {
			ticket.status = 'win';
			ticket.is_winner = true;
			ticket.is_draw = true;
			ticket.position = winner.position;
			ticket.prize_amount = winner.prize_amount;
			ticket.prize_title = winner.prize_title;
			ticket.drawDate = new Date();
			await ticket.save();

			// find user
			const user = await User.findById(winner.user_id);
			if (!user) {
				return next(new ErrorHander('User not found', 404));
			}
			// update user
			user.w_balance += winner.prize_amount;
			user.winning_balance += winner.prize_amount;
			user.is_winner = true;
			createTransaction(
				user._id,
				'cashIn',
				winner.prize_amount,
				'Win',
				` You Win ${winner.prize_name} of ${winner.prize_amount}BDT in ${draw.title} draw. `
			);
			await user.save();
			sendEmail({
				email: user.email,
				subject: 'You have won',
				message: `Congratulations, you have won ${winner.prize_name} of ${winner.prize_amount}BDT in ${draw.title} draw. Please contact with us for more details.`,
			});
		} else {
			ticket.is_draw = true;
			ticket.is_loser = true;
			ticket.status = 'loser';
			ticket.drawDate = new Date();
			ticket.drawTime = new Date().toLocaleString().split(',')[1].trim();
			await ticket.save();
		}
	});

	// find remaining tickets and remove
	const remainingTickets = await Ticket.find({
		draw_id: draw._id,
		is_sold: false,
	});
	console.log(remainingTickets.length);
	if (remainingTickets.length > 0) {
		remainingTickets.forEach(async (ticket) => {
			await ticket.remove();
		});
	}

	// update company
	company.cost.lottery_cost += draw.prize_cost;
	company.cost.total_cost += draw.total_cost;
	company.income.lottery_income += draw.profit;
	company.income.today_income += draw.profit;
	company.income.total_income += draw.profit;
	company.lottery.totalDraw += 1;
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Winners published',
	});
});

// find last draw
exports.getLastDraw = catchAsyncErrors(async (req, res, next) => {
	const draw = await Draw.findOne({ is_active: false }).sort({
		createdAt: -1,
	});
	if (!draw) {
		return next(new ErrorHander('No draw found', 404));
	}
	res.status(200).json({
		success: true,
		draw,
	});
});

// update draw
exports.updateDraw = catchAsyncErrors(async (req, res, next) => {
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHander('Admin not found', 404));
	}
	const draw = await Draw.findById(req.params.id);
	if (!draw) {
		return next(new ErrorHander('Draw not found', 404));
	}
	if (!draw) {
		return next(new ErrorHander('Draw is not active', 404));
	}

	const { prizes, ticket_price, ticket_qty } = req.body;

	let today = new Date();
	let tomorrow = new Date();
	const draw_date = tomorrow.setDate(today.getDate() + 1);

	// get prize cost
	let prize_cost = 0;
	prizes.forEach((prize) => {
		prize_cost += prize.prize_amount * prize.qty;
	});

	// prize qty
	const prize_qty = prizes.reduce((acc, prize) => acc + prize.qty, 0);

	// get profit
	const potential_profit = ticket_price * ticket_qty - prize_cost;

	// update draw
	draw.draw_date = draw_date;
	draw.prizes = prizes;
	draw.ticket_price = ticket_price;
	draw.ticket_qty = ticket_qty;
	draw.prize_cost = prize_cost;
	draw.total_cost = prize_cost;
	draw.potential_profit = potential_profit;
	draw.prize_qty = prize_qty;
	draw.remaining_tickets = ticket_qty;
	await draw.save();
	res.status(200).json({
		success: true,
		message: 'Draw updated',
	});
});
