const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');

const Ticket = require('../models/ticketModel');
const LuckyBox = require('../models/luckyBoxModel');
const Draw = require('../models/drawModel');
const createTransaction = require('../utils/tnx');

const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;

const UserLotteryInfo = require('../models/userLotteryInfo');

// create some tickets function
exports.createTickets = catchAsyncErrors(async (req, res, next) => {
	const { price, prize, qty } = req.body;

	// find tickets length
	const allTickets = await Ticket.find();
	const ticketsLength = allTickets.length;

	const tickets = [];

	// create tickets
	for (let i = 0; i < qty; i++) {
		// generate ticket uniq number
		const ticketNumber = Math.floor(1000000 + Math.random() * 9000000);

		// serial number
		const serialNumber = ticketsLength + i + 1;

		// check if ticket number already exists
		const ticket = await Ticket.findOne({ ticketNumber });
		if (ticket) {
			// if ticket number already exists, generate new one
			i--;
			continue;
		}

		const newTicket = {
			serialNumber,
			ticketNumber: ticketNumber,
			price: price,
			firstPrize: prize,
			nextDrawDate: new Date(),
			nextDrawTime: '12:00 AM',
		};
		tickets.push(newTicket);
	}

	if (tickets.length > 0) {
		await Ticket.create(tickets);
		res.status(201).json({
			status: 'success',
			message: 'Tickets created successfully',
		});
	}
});

// raffle draw with all tickets
exports.raffleDraw = catchAsyncErrors(async (req, res, next) => {
	const { position, prize } = req.body;
	if (!position || !prize) {
	}

	const tickets = await Ticket.find();
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	let winnerNumber = tickets[Math.floor(Math.random() * tickets.length)];
	winnerNumber = winnerNumber.ticketNumber;

	const winner = await Ticket.findOne({ ticketNumber: winnerNumber });
	if (!winner) {
		return next(new ErrorHander('No winner found', 404));
	}
	winner.status = 'winner';
	winner.isWinner = true;
	winner.position = position;
	winner.prize = prize;
	winner.drawDate = new Date();
	await winner.save();
	res.status(200).json({
		success: true,
		message: 'Winner number generated',
		winnerNumber: winnerNumber,
	});
});

// generate winners 1st to 20th
exports.generateWinners = catchAsyncErrors(async (req, res, next) => {
	const tickets = await Ticket.find();
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	const winners = [];
	for (let i = 0; i < 20; i++) {
		let winnerNumber = tickets[Math.floor(Math.random() * tickets.length)];
		winnerNumber = winnerNumber.ticketNumber;
		const winner = await Ticket.findOne({ ticketNumber: winnerNumber });
		if (!winner) {
			i--;
			continue;
		}
		winner.status = 'winner';
		winner.isWinner = true;
		winner.drawDate = new Date();
		await winner.save();
		// find 1st winner
		if (i === 0) {
			winner.isFirstWinner = true;
			await winner.save();
		}
		// 2nd winner
		if (i === 1) {
			winner.isSecondWinner = true;
			await winner.save();
		}
		winners.push(winner);
	}
});

// generate 10 winners with position 1st to 5th
exports.generate10Winners = catchAsyncErrors(async (req, res, next) => {
	const tickets = await Ticket.find();
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	const winners = [];
	for (let i = 0; i < 10; i++) {
		let winnerNumber = tickets[Math.floor(Math.random() * tickets.length)];
		winnerNumber = winnerNumber.ticketNumber;
		const winner = await Ticket.findOne({ ticketNumber: winnerNumber });
		if (!winner) {
			i--;
			continue;
		}
		winner.status = 'winner';
		winner.isWinner = true;
		winner.drawDate = new Date();
		await winner.save();
		// find 1st winner
		if (i === 0) {
			winner.winnerPosition = 1;
			await winner.save();
		}
		// 2nd winner
		if (i === 1) {
			winner.winnerPosition = 2;
			await winner.save();
		}
		// 3rd winner
		if (i === 2) {
			winner.winnerPosition = 3;
			await winner.save();
		}
		// 4th winner
		if (i === 3) {
			winner.winnerPosition = 4;
			await winner.save();
		}
		// 5th winner
		if (i === 4) {
			winner.winnerPosition = 5;
			await winner.save();
		}
		winners.push(winner);
	}
	res.status(200).json({
		success: true,
		message: '10 winners generated',
		winners: winners,
	});
});

// get tickets with limit and skip
exports.getTickets = catchAsyncErrors(async (req, res, next) => {
	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('No company found', 404));
	}

	// check if company lottery isLottery is true
	if (!company.lottery.isLottery) {
		return next(new ErrorHander('Lottery is not active', 404));
	}

	//find active draw
	const activeDraw = await Draw.findOne({ is_active: true });
	if (!activeDraw) {
		return next(new ErrorHander('No active draw found', 404));
	}
	const { limit, skip } = req.query;
	let numLimit = parseInt(limit);
	const tickets = await Ticket.find({
		draw_id: activeDraw._id,
		is_sold: false,
	})
		.skip(skip)
		.limit(numLimit);
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	const length = tickets.length;

	res.status(200).json({
		success: true,
		message: 'Tickets fetched',
		length: length,
		tickets: tickets,
	});
});

//=====================================================
//===================== BUY TICKETS ========================
exports.buyTicket = catchAsyncErrors(async (req, res, next) => {
	const ticketId = req.params.id;

	const ticket = await Ticket.findById(ticketId);
	if (!ticket) {
		return next(new ErrorHander('No ticket found', 404));
	}

	// get active draw
	const draw = await Draw.findOne({ is_active: true });
	if (!draw) {
		return next(new ErrorHander('No active draw found', 404));
	}

	// check if ticket is already sold
	if (ticket.status === 'sold') {
		return next(new ErrorHander('Ticket already sold', 400));
	}

	// find Company by CompanyId
	const admin = await Company.findById(companyId);
	if (!admin) {
		return next(new ErrorHander('No company found', 404));
	}

	const user = await User.findOne({ _id: req.user._id });
	if (!user) {
		return next(new ErrorHander('No user found', 404));
	}

	// check if user has UserLotteryInfo or not
	const existLotteryInfo = await UserLotteryInfo.findOne({
		user_id: user._id,
	});
	if (!existLotteryInfo) {
		// create new UserLotteryInfo
		await UserLotteryInfo.create({
			user_id: user._id,
			name: user.name,
			phone: user.phone,
		});
	}

	// find user lottery info
	const userLotteryInfo = await UserLotteryInfo.findOne({
		user_id: user._id,
	});

	if (!userLotteryInfo) {
		return next(new ErrorHander('No user lottery info found', 404));
	}

	// update user balance
	if (user.m_balance < ticket.price) {
		return next(new ErrorHander('Insufficient balance', 400));
	}

	user.m_balance -= ticket.price;
	user.lucky_box_count += 1;
	createTransaction(
		user._id,
		'cashOut',
		ticket.price,
		' Ticket purchase',
		`Ticket purchase for ticket number ${ticket.ticketNumber}`
	);
	await user.save();

	// check if user has push in draw.participants
	if (!draw.participants.includes(user._id)) {
		draw.participants.push(user._id);
		draw.participants_count += 1;
		// await draw.save();
	}
	// update draw info
	draw.remaining_tickets -= 1;
	draw.ticket_sold_qty += 1;
	draw.ticket_sold_amount += ticket.price;
	draw.profit += ticket.price;
	draw.sold_tickets.push(ticket._id);

	await draw.save();

	// update user lottery info
	userLotteryInfo.total_tickets_by += ticket.price;
	userLotteryInfo.total_tickets_count += 1;
	await userLotteryInfo.save();

	ticket.status = 'sold';
	ticket.is_sold = true;
	ticket.buyDate = new Date();
	ticket.owner = user._id;
	ticket.ownerName = user.name;
	ticket.phone = user.phone;
	ticket.email = user.email;
	await ticket.save();

	const luckyAmount = Math.floor(Math.random() * 5) + 1;
	// create a lucky Box
	await LuckyBox.create({
		user_id: user._id,
		name: user.name,
		phone: user.phone,
		ticket_no: ticket.ticketNumber,
		lucky_amount: luckyAmount,
		box_type: 'ticket',
	});

	// update admin lottery details
	admin.lottery.totalSellCount += 1;
	admin.lottery.totalSellAmount += ticket.price;
	admin.lottery.toDaySellCount += 1;
	admin.lottery.toDaySellAmount += ticket.price;
	await admin.save();

	res.status(200).json({
		success: true,
		message: 'Buy a ticket successfully',
		ticket: ticket,
	});
});

// get logged in user tickets
exports.getUserTickets = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ _id: req.user._id });
	if (!user) {
		return next(new ErrorHander('No user found', 404));
	}
	const tickets = await Ticket.find({ owner: user._id });
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	res.status(200).json({
		success: true,
		message: 'User tickets fetched',
		tickets: tickets,
	});
});

// get logged in user lucky boxes
exports.getUserLuckyBoxes = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ _id: req.user._id });
	if (!user) {
		return next(new ErrorHander('No user found', 404));
	}
	// get all lucky boxes of user which are not opened
	const luckyBoxesNotOpen = await LuckyBox.find({
		user_id: user._id,
		isOpen: false,
	});
	if (!luckyBoxesNotOpen) {
		return next(new ErrorHander('No lucky boxes found', 404));
	}
	res.status(200).json({
		success: true,
		message: 'User lucky boxes fetched',
		luckyBoxes: luckyBoxesNotOpen,
		luckyBoxesCount: luckyBoxesNotOpen.length,
	});
});

// open lucky box
exports.openLuckyBox = catchAsyncErrors(async (req, res, next) => {
	const luckyBoxId = req.params.id;
	const luckyBox = await LuckyBox.findById(luckyBoxId);
	if (!luckyBox) {
		return next(new ErrorHander('No lucky box found', 404));
	}

	// check if lucky box is already opened
	if (luckyBox.isOpen === true) {
		return next(new ErrorHander('Lucky box already opened', 400));
	}

	const luckyUser = await User.findById(luckyBox.user_id);
	if (!luckyUser) {
		return next(new ErrorHander('No user found', 404));
	}

	// get active draw
	const draw = await Draw.findOne({ is_active: true });
	if (!draw) {
		return next(new ErrorHander('No active draw found', 404));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('No company found', 404));
	}

	luckyUser.b_balance += luckyBox.lucky_amount;
	luckyUser.winning_balance += luckyBox.lucky_amount;
	if (luckyBox.box_type === 'register') {
		luckyUser.signup_bonus += luckyBox.lucky_amount;
	}
	createTransaction(
		luckyUser._id,
		'cashIn',
		luckyBox.lucky_amount,
		'Win Lucky Box',
		`Win Lucky Box ${luckyBox.lucky_amount}`
	);
	await luckyUser.save();

	luckyBox.isOpen = true;
	luckyBox.status = 'open';
	await luckyBox.save();

	// check lucky box type
	if (luckyBox.box_type === 'ticket') {
		// find ticket
		const ticket = await Ticket.findOne({ ticketNumber: luckyBox.ticket_no });
		if (!ticket) {
			return next(new ErrorHander('No ticket found', 404));
		}
		//update ticket
		ticket.lucky_box_amount = luckyBox.lucky_amount;
		await ticket.save();
	}

	// update draw info
	draw.total_cost += luckyBox.lucky_amount;
	draw.lucky_box_cost += luckyBox.lucky_amount;
	draw.potential_profit -= luckyBox.lucky_amount;
	draw.profit -= luckyBox.lucky_amount;
	await draw.save();

	// update company
	company.cost.total_cost += luckyBox.lucky_amount;
	company.cost.today_cost += luckyBox.lucky_amount;
	company.cost.lucky_box_cost += luckyBox.lucky_amount;
	if (luckyBox.box_type === 'register') {
		company.cost.signup_bonus_cost += luckyBox.lucky_amount;
		company.cost.total_cost += luckyBox.lucky_amount;
	}
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Lucky box opened',
		luckyBox,
	});
});

// find tickets by draw date
exports.findTicketsByDrawDate = catchAsyncErrors(async (req, res, next) => {
	const { drawDate } = req.query;
	const tickets = await Ticket.find({ drawDate: { $gte: drawDate } });
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}

	// draw date
	const drawDateTime = new Date(drawDate);

	// previous draw date
	const previousDrawDate = new Date(
		drawDateTime.setDate(drawDateTime.getDate() - 1)
	);
	// length
	const length = tickets.length;

	// find winning tickets
	const winningTickets = tickets.filter((ticket) => {
		return ticket.status === 'winner';
	});

	res.status(200).json({
		success: true,
		message: 'Tickets fetched',
		length: length,
		winningTickets: winningTickets,
		tickets: tickets,
		drawDateTime,
		previousDrawDate,
	});
});

// =================================================================
// =================== get draw by date ============================
exports.getDrawByDate = catchAsyncErrors(async (req, res, next) => {
	const { date } = req.query;

	// convert date to date object
	const drawDate = new Date().toLocaleDateString();

	const draw = await Draw.findOne({ drawDate: { $gte: drawDate } });
	if (!draw) {
		return next(new ErrorHander('No draw found', 404));
	}
	// find tickets by draw date
	// const tickets = await Ticket.find({ drawDate: { $gte: date } });
	res.status(200).json({
		success: true,
		message: 'Draw fetched',
		draw: draw,
		// tickets: tickets,
	});
});

// get all draws
exports.getAllDraws = catchAsyncErrors(async (req, res, next) => {
	console.log('get all draws');
	res.status(200).json({
		success: true,
		message: 'Draws fetched',
	});
});

//==============================================================
//===================== get all isSold tickets =================

exports.getAllSoldTickets = catchAsyncErrors(async (req, res, next) => {
	// find active draw
	const draw = await Draw.findOne({ is_active: true });
	if (!draw) {
		return next(new ErrorHander('No active draw found', 404));
	}
	// find all sold tickets by active draw id
	const tickets = await Ticket.find({ draw_id: draw._id, status: 'sold' });
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}

	res.status(200).json({
		success: true,
		message: 'Tickets fetched',
		tickets: tickets,
		draw: draw,
	});
});

// get all winners
exports.getAllWinners = catchAsyncErrors(async (req, res, next) => {
	const winners = await Ticket.find({ status: 'draw', isWinner: true });
	if (!winners) {
		return next(new ErrorHander('No winners found', 404));
	}
	res.status(200).json({
		success: true,
		message: 'Winners fetched',
		winners: winners,
	});
});

// get remaining tickets
exports.getRemainingTickets = catchAsyncErrors(async (req, res, next) => {
	const tickets = await Ticket.find({ is_sold: false });
	if (!tickets) {
		return next(new ErrorHander('No tickets found', 404));
	}
	res.status(200).json({
		success: true,
		message: 'Tickets fetched',
		ticketsLength: tickets.length,
	});
});
