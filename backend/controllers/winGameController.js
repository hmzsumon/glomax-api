const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const WinGame = require('../models/winGameModel');
const WinGameParticipant = require('../models/winGameParticipantModel');
const cron = require('node-cron');
const Test = require('../models/testModel');
const { generateUniqueId } = require('../utils/functions');
const colors = require('@colors/colors');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const createTransaction = require('../utils/tnx');
const { condition1, condition2, condition3 } = require('../conditions.js');
const WinGameResult = require('../models/winGameResultModel');
const AdminWinner = require('../models/adminWinner');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buttons = [
	{
		btn_id: '0',
		total_amount: 0,
	},
	{
		btn_id: '1',
		total_amount: 0,
	},
	{
		btn_id: '2',
		total_amount: 0,
	},
	{
		btn_id: '3',
		total_amount: 0,
	},
	{
		btn_id: '4',
		total_amount: 0,
	},
	{
		btn_id: '5',
		total_amount: 0,
	},
	{
		btn_id: '6',
		total_amount: 0,
	},
	{
		btn_id: '7',
		total_amount: 0,
	},
	{
		btn_id: '8',
		total_amount: 0,
	},
	{
		btn_id: '9',
		total_amount: 0,
	},
	{
		btn_id: 'red',
		total_amount: 0,
	},
	{
		btn_id: 'green',
		total_amount: 0,
	},
	{
		btn_id: 'violet',
		total_amount: 0,
	},
];

const createGameData = async (durationInMinutes) => {
	const today = new Date();
	const seconds = durationInMinutes * 60;
	const allGames = await WinGame.find({
		createdAt: {
			$gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
			$lte: new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() + 1
			),
		},
		time: seconds,
	});

	const gameId =
		generateUniqueId() + allGames.length.toString().padStart(2, '0');
	const gameTitle = `Game${durationInMinutes}m-${gameId.slice(6)}`;

	return await WinGame.create({
		game_id: gameId,
		time: seconds,
		game_type: `${durationInMinutes}m`,
		game_title: gameTitle,
		start_time: Date.now(),
		buttons: buttons, // Assuming 'buttons' is globally defined or you might need to pass it as an argument.
	});
};

const emitGameData = (game, seconds) => {
	const ioData = {
		id: game._id,
		game_id: game.game_id,
		time: seconds,
		game_type: game.game_type,
	};
	// console.log('game.game_type', `game-${game.game_type}`);
	global.io.emit(`game-${game.game_type}`, ioData);
};

async function countdown(game) {
	let seconds = game.time;

	const interval = setInterval(async () => {
		seconds--;
		emitGameData(game, seconds);
		if (seconds === 0) {
			clearInterval(interval);
			await updateGame(game._id);
			console.log(colors.green('Game finished', game.game_title));
		}
	}, 1000);
}

const createAndStartGame = async (durationInMinutes) => {
	const game = await createGameData(durationInMinutes);
	console.log(
		colors.green(`Created Game ${durationInMinutes}m`, game.game_title)
	);
	emitGameData(game);
	await countdown(game);
};

// if (process.env.GAME_ON === 'True') {
// 	setInterval(() => createAndStartGame(1), 65000);
// 	setInterval(() => createAndStartGame(3), 185000);
// 	setInterval(() => createAndStartGame(5), 305000);
// }

// ... [Keep the updateGame function and other supporting functions unchanged]

const updateGame = async (id) => {
	// find admin winner by game_id
	const adminWinner = await AdminWinner.findOne({ game_id: id });
	// console.log('adminWinner', adminWinner);

	const game = await WinGame.findById(id);
	if (game.is_active) {
		const duration = Date.now() - game.start_time;
		game.duration = duration;
		game.end_time = Date.now();
		game.is_active = false;

		// find all participants of the game
		const participants = await WinGameParticipant.find({ game_id: game._id });
		if (participants.length === 0) {
			console.log('No participants');
		}

		let winner = {};
		// console.log('game.total_trade_amount', game);

		if (adminWinner) {
			winner = adminWinner.winner;
			// console.log('adminWinner', adminWinner.winner);
		} else {
			if (game.total_trade_amount >= 5 && game.total_trade_amount <= 10) {
				// console.log('condition2');
				winner = condition2(game.buttons);
			} else if (
				game.total_trade_amount >= 10.1 &&
				game.total_trade_amount <= 40
			) {
				const threeBtnTotal =
					game.buttons[0].total_amount +
					game.buttons[5].total_amount +
					game.buttons[12].total_amount;

				// console.log('3T', threeBtnTotal);

				if (threeBtnTotal < 3) {
					// console.log('condition3');
					winner = condition3(game.buttons);
				} else {
					// console.log('condition2');
					winner = condition2(game.buttons);
				}
			} else if (game.total_trade_amount > 40) {
				// console.log('condition4');
				const redBtn = game.buttons[10].total_amount;
				const greenBtn = game.buttons[11].total_amount;
				const diff = Math.abs(redBtn - greenBtn);
				if (diff < 25) {
					// console.log('condition2');
					winner = condition2(game.buttons);
				} else {
					const threeBtnTotal =
						game.buttons[0].total_amount +
						game.buttons[5].total_amount +
						game.buttons[12].total_amount;

					// console.log('3T', threeBtnTotal);

					if (threeBtnTotal < 3) {
						// console.log('condition3');
						winner = condition3(game.buttons);
					} else {
						// console.log('condition2');
						winner = condition2(game.buttons);
					}
				}
			} else {
				if (process.env.NODE_ENV === 'development') {
					// console.log('condition1');
				}
				winner = condition1();
			}
		}

		let winners = [];
		// select winners by winner
		for (let i = 0; i < participants.length; i++) {
			if (winner.bet_ids.includes(participants[i].bet_id)) {
				// console.log('winner', participants[i].name);
				winners.push(participants[i]);
			}
			if (winner.bet_ids.includes(participants[i].bet_id)) {
				participants[i].status = 'win';
				// define win_amount
				let win_amount = 0;
				if (winner.bet_ids.length === 2) {
					win_amount =
						participants[i].trade_amount * participants[i].multiplier;
				} else if (winner.bet_ids.length === 3) {
					if (
						participants[i].trade_number === 'red' ||
						participants[i].trade_number === 'green'
					) {
						win_amount = participants[i].trade_amount * 1.5;
					} else {
						win_amount =
							participants[i].trade_amount * participants[i].multiplier;
					}
				}

				// update participant win_amount
				participants[i].win_amount = win_amount;

				// update user
				const user = await User.findById(participants[i].user_id).select(
					'm_balance active_balance trading_volume name username'
				);
				user.m_balance += win_amount;
				createTransaction(
					user._id,
					'cashIn',
					win_amount,
					'win_game',
					`Winning Amount from ${game.game_type} Game Period no: #${game.game_id}`
				);
				await user.save();
			} else {
				participants[i].status = 'lose';
			}
			participants[i].result = winner.bet_ids;
			await participants[i].save();
		}

		// get total win amount of the game
		let total_win_amount = 0;
		let profit = 0;
		let loss = 0;

		if (winners.length > 0) {
			// find company byId
			const company = await Company.findById(companyId).select(
				'cost income game total_profit'
			);
			for (let i = 0; i < winners.length; i++) {
				total_win_amount += winners[i].win_amount;
			}

			// find profit or loss
			if (total_win_amount > game.total_trade_amount) {
				loss = total_win_amount - game.total_trade_amount;
			} else if (total_win_amount < game.total_trade_amount) {
				profit = game.total_trade_amount - total_win_amount;
			}

			// update company
			company.game.game_count += 1;
			company.game.game_cost += total_win_amount;
			company.game.game_profit += profit;
			company.cost.game_cost += total_win_amount;
			company.cost.total_cost += total_win_amount;
			company.income.game_income += profit;
			company.income.total_income += profit;
			company.total_profit += profit;
			await company.save();
		}

		// create WinGameResult
		await WinGameResult.create({
			game_id: game._id,
			game_type: game.game_type,
			period_no: game.game_id,
			win_colors: winner.color_codes,
			win_number: winner.number,
			total_trade_amount: game.total_trade_amount,
			total_trade_charge: game.total_trade_charge,
			total_win_amount: total_win_amount,
			participants_count: game.participants,
			winners_count: winners.length,
			profit: profit,
			loss: loss,
		});

		// update game
		game.win_number = winner.number;
		game.win_colors = winner.color_codes;
		game.winners = winners.length;
		game.losers = game.participants - winners.length;
		game.total_win_amount = total_win_amount;
		game.total_lose_amount = game.total_trade_amount - total_win_amount;
		game.profit = profit;
		game.loss = loss;
		await game.save();

		// filter all user_id and status from participants
		let user_ids = [];

		for (let i = 0; i < participants.length; i++) {
			user_ids.push({
				user_id: participants[i].user_id,
				status: participants[i].status,
			});
		}

		// console.log('user_ids', user_ids);

		const ioData = {
			game_id: game._id,
			game_type: game.game_type,
			usersIds: user_ids,
		};

		// socket io for participants
		global.io.emit('win-result', ioData);

		// console.log(' ');
		// console.log('Updated Game', game.game_title);
		// console.log('winners', winners.length);
		// // console.log('winners', winners);
		// console.log('');
	}
};

// get all win games
exports.getAllWinGames = catchAsyncErrors(async (req, res, next) => {
	const winGames = await WinGame.find();

	res.status(200).json({
		success: true,
		winGames,
	});
});

// get active test
exports.getActiveTest = catchAsyncErrors(async (req, res, next) => {
	const test = await Test.findOne({ is_active: true });
	// setInterval(() => {
	// 	global.io.to('test-room').emit('test-time', new Date().toTimeString());
	// 	console.log('test-time', new Date().toTimeString());
	// }, 1000);
	function countdown(seconds) {
		const interval = 1000; // 1 second in milliseconds

		function tick() {
			console.log(`Countdown: ${seconds} seconds remaining`);
			global.io.to('test-room').emit('test-time', seconds);
			seconds--;
			if (seconds >= 0) {
				setTimeout(tick, interval);
			} else {
				console.log('Countdown finished!');
			}
		}

		tick();
	}

	// Usage
	countdown(test.time);
	res.status(200).json({
		success: true,
		test,
	});
});

// get 1m active win game
exports.getActive1mWinGame = catchAsyncErrors(async (req, res, next) => {
	const game = await WinGame.findOne({ game_type: '1m', is_active: true })
		.sort({
			createdAt: -1,
		})
		.limit(1);
	if (!game) {
		return next(new ErrorHandler('Game not found', 404));
	}
	res.status(200).json({
		success: true,
		game,
	});
});

// get 3m active win game
exports.getActive3mWinGame = catchAsyncErrors(async (req, res, next) => {
	const game = await WinGame.findOne({ game_type: '3m', is_active: true })
		.sort({
			createdAt: -1,
		})
		.limit(1);
	if (!game) {
		return next(new ErrorHandler('Game not found', 404));
	}
	// console.log('game', game);
	res.status(200).json({
		success: true,
		game,
	});
});

// get 5m active win game
exports.getActive5mWinGame = catchAsyncErrors(async (req, res, next) => {
	const game = await WinGame.findOne({ game_type: '5m', is_active: true })
		.sort({
			createdAt: -1,
		})
		.limit(1);
	if (!game) {
		return next(new ErrorHandler('Game not found', 404));
	}
	res.status(200).json({
		success: true,
		game,
	});
});

// win game create trade
exports.winGameCreateTrade = catchAsyncErrors(async (req, res, next) => {
	const {
		user_id,
		name,
		customer_id,
		colors,
		amount,
		bet_id,
		game_id,
		game_type,
		multiplier,
		value,
		username,
	} = req.body;

	if (!user_id) {
		return next(new ErrorHandler('Please provide user id', 400));
	} else if (!name) {
		return next(new ErrorHandler('Please provide name', 400));
	} else if (!customer_id) {
		return next(new ErrorHandler('Please provide customer id', 400));
	} else if (!colors) {
		return next(new ErrorHandler('Please provide colors', 400));
	} else if (!amount) {
		return next(new ErrorHandler('Please provide amount', 400));
	} else if (!game_id) {
		return next(new ErrorHandler('Please provide game id', 400));
	} else if (!game_type) {
		return next(new ErrorHandler('Please provide game type', 400));
	} else if (!multiplier) {
		return next(new ErrorHandler('Please provide multiplier', 400));
	} else if (!value) {
		return next(new ErrorHandler('Please provide value', 400));
	}
	const numAmount = Number(amount);

	// find game
	const game = await WinGame.findById(game_id);
	if (!game) {
		return next(new ErrorHandler('Game not found', 404));
	}

	// find company byId
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// find user
	const user = await User.findById(user_id).select(
		'm_balance parent_1 parent_2 parent_3 trading_volume active_balance name username'
	);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	//check if user has enough balance
	if (user.m_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// find parent_1
	const parent_1 = await User.findOne({
		customer_id: user.parent_1.customer_id,
	}).select('m_balance trade_com');

	if (!parent_1) {
		return next(new ErrorHandler('Parent 1 not found', 404));
	}

	// find parent_2
	const parent_2 = await User.findOne({
		customer_id: user.parent_2.customer_id,
	}).select('m_balance trade_com');

	if (!parent_2) {
		return next(new ErrorHandler('Parent 2 not found', 404));
	}

	// find parent_3
	const parent_3 = await User.findOne({
		customer_id: user.parent_3.customer_id,
	}).select('m_balance trade_com');

	if (!parent_3) {
		return next(new ErrorHandler('Parent 3 not found', 404));
	}

	const trade_charge = amount * 0.02;
	const trade_amount = amount - trade_charge;

	// update user balance
	user.m_balance -= amount;
	createTransaction(
		user_id,
		'cashOut',
		Number(amount),
		'wine_game',
		`Win Game ${game_type} Period ${game.game_id}` // description
	);

	// create WinGameParticipant
	const winGameParticipant = await WinGameParticipant.create({
		game_id,
		user_id,
		user_balance: user.m_balance,
		name: user.name,
		period: game.game_id,
		customer_id,
		amount,
		trade_charge,
		trade_amount,
		trade_colors: colors,
		trade_number: value,
		game_type,
		bet_id: value,
		multiplier,
	});

	// update user
	// createTransaction(
	// 	user_id,
	// 	'cashOut',
	// 	amount,
	// 	'trading',
	// 	`Win Game ${game_type} Period ${game.game_id}` // description
	// );
	if (user.trading_volume > 0) {
		if (amount > user.trading_volume) {
			company.total_trade_volume -= user.trading_volume;
			user.trading_volume = 0;
		} else {
			user.trading_volume -= amount;
			company.total_trade_volume -= Number(amount);
		}
	}

	if (user.trading_volume === 0) {
		user.active_balance = user.m_balance;
	}
	await user.save();

	// update game
	game.total_trade_amount += trade_amount;
	game.total_trade_charge += trade_charge;
	game.participants += 1;
	// Check if bet_id is included in game.bet_ids array or not
	const existingBetIndex = game.buttons.findIndex(
		(bet) => bet.btn_id === value
	);

	if (existingBetIndex === -1) {
		// If the bet_id is not in the array, add it with the initial trade_amount
		game.buttons.push({
			btn_id: value,
			total_amount: trade_amount,
		});
	} else {
		// If the bet_id is already in the array, update its total_amount
		game.buttons[existingBetIndex].total_amount += trade_amount;
	}

	await game.save();

	// update parent_1
	parent_1.m_balance += trade_charge * 0.4;
	parent_1.trade_com.level_1 += trade_charge * 0.4;
	createTransaction(
		parent_1._id,
		'cashIn',
		trade_charge * 0.4,
		'trade_commission',
		`1st level Trade Commission from ${username}`
	);
	await parent_1.save();

	// update parent_2
	parent_2.m_balance += trade_charge * 0.3;
	parent_2.trade_com.level_2 += trade_charge * 0.3;
	createTransaction(
		parent_2._id,
		'cashIn',
		trade_charge * 0.3,
		'trade_commission',
		`2nd level Trade Commission from ${username}`
	);

	await parent_2.save();

	// update parent_3
	parent_3.m_balance += trade_charge * 0.2;
	parent_3.trade_com.level_3 += trade_charge * 0.2;
	createTransaction(
		parent_3._id,
		'cashIn',
		trade_charge * 0.2,
		'trade_commission',
		`3rd level Trade Commission from ${username}`
	);
	await parent_3.save();

	const total_trade_charge = trade_charge * 0.9;
	//update company
	company.game.trading_charge += trade_charge; // win game trading charge
	company.game.trading_profit += trade_charge * 0.1;
	company.game.game_profit += trade_charge * 0.1;
	company.total_profit += trade_charge * 0.1;
	company.game.game_cost += total_trade_charge;
	company.cost.game_cost += total_trade_charge;
	company.cost.total_cost += total_trade_charge;
	company.income.game_income += trade_charge * 0.1; // win game trading charge
	company.income.total_income += trade_charge * 0.1;
	await company.save();

	// find all participants of the game
	const participants = await WinGameParticipant.find({ game_id: game._id });
	if (participants.length === 0) {
		console.log('No participants');
	}

	const ioData = {
		game: game,
		participants: participants,
	};
	// socket io
	global.io.emit('get-game', ioData);

	res.status(200).json({
		success: true,
		message: 'Trade created successfully',
		trade: winGameParticipant,
	});
});

// get all win game result by game_type
exports.getWinGamesResults = catchAsyncErrors(async (req, res, next) => {
	const { game_type } = req.params;

	// get all results by game_type and current date
	const today = new Date();
	const results = await WinGameResult.find({
		game_type,
		createdAt: {
			$gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		},
	}).sort({ createdAt: -1 });

	res.status(200).json({
		success: true,
		results,
	});
});

// logged in user records
exports.loggedInUserRecords = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.params;
	// console.log(id);
	const records = await WinGameParticipant.find({ user_id: id }).sort({
		createdAt: -1,
	});
	res.status(200).json({
		success: true,
		records,
	});
});

//update win game and select winner for the game participants
exports.updateWinGame = catchAsyncErrors(async (req, res, next) => {
	const { game_id } = req.body;

	// find game findById and is_active = true
	const game = await WinGame.findById(game_id);
	if (!game) {
		return next(new ErrorHandler('Game not found', 404));
	}

	// find all participants of the game
	const participants = await WinGameParticipant.find({ game_id });
	if (participants.length === 0) {
		return next(new ErrorHandler('No participants found', 404));
	}

	const winner = condition1();

	let winners = [];
	// select winners by winner
	for (let i = 0; i < participants.length; i++) {
		if (winner.bet_ids.includes(participants[i].bet_id)) {
			// console.log('winner', participants[i].name);
			winners.push(participants[i]);
		}
		if (winner.bet_ids.includes(participants[i].bet_id)) {
			participants[i].status = 'win';
			// define win_amount
			let win_amount = 0;
			if (winner.bet_ids.length === 2) {
				win_amount = participants[i].trade_amount * participants[i].multiplier;
			} else if (winner.bet_ids.length === 3) {
				if (
					participants[i].trade_number === 'red' ||
					participants[i].trade_number === 'green'
				) {
					win_amount = participants[i].trade_amount * 1.5;
				} else {
					win_amount =
						participants[i].trade_amount * participants[i].multiplier;
				}
			}

			// update user
			const user = await User.findById(participants[i].user_id).select(
				'm_balance active_balance trading_volume name username'
			);
			user.m_balance += win_amount;
			createTransaction(
				user._id,
				'cashIn',
				win_amount,
				'winning_amount',
				`Winning Amount from ${game.game_type} Game Period no: #${game.game_id}`
			);
			await user.save();
		} else {
			participants[i].status = 'lose';
		}
		participants[i].result = winner.bet_ids;
		await participants[i].save();
	}

	// create WinGameResult
	const winGameResult = await WinGameResult.create({
		game_id: game._id,
		game_type: game.game_type,
		period_no: game.game_id,
		win_colors: winner.color_codes,
		win_number: winner.number,
		total_trade_amount: game.total_trade_amount,
		total_trade_charge: game.total_trade_charge,
		participants_count: game.participants,
	});
	// console.log('winners', winners.length);
	// console.log('winners', winners);

	// // find all participants and update their status
	// for (let i = 0; i < participants.length; i++) {
	// 	if (winner.bet_ids.includes(participants[i].bet_id)) {
	// 		participants[i].status = 'win';
	// 	} else {
	// 		participants[i].status = 'lose';
	// 	}
	// 	await participants[i].save();
	// }

	res.status(200).json({
		success: true,
		message: 'Game updated successfully',
		result: winGameResult,
		winner,
		winners,
	});
});

// test socket.io
exports.testSocket = catchAsyncErrors(async (req, res, next) => {
	global.io.emit('result-pop', 'pop-datahghghgth');

	res.status(200).json({
		success: true,
		message: 'test',
	});
});

// call a cron job for every day at 12:00 AM remove all previous day's data wingame, wingameparticipant, wingameresult

cron.schedule('0 0 * * *', async () => {
	console.log('running a task every day at 12:00 AM');
	// remove all previous day's data wingame, wingameparticipant, wingameresult
	const today = new Date();
	const yesterday = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() - 2
	);
	console.log('yesterday', yesterday);

	const wingames = await WinGame.find({
		createdAt: {
			$gte: new Date(
				yesterday.getFullYear(),
				yesterday.getMonth(),
				yesterday.getDate()
			),
			$lte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		},
	});
	console.log('wingames', wingames.length);
	for (let i = 0; i < wingames.length; i++) {
		await WinGame.findByIdAndDelete(wingames[i]._id);
	}

	const wingameparticipants = await WinGameParticipant.find({
		createdAt: {
			$gte: new Date(
				yesterday.getFullYear(),
				yesterday.getMonth(),
				yesterday.getDate()
			),
			$lte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		},
	});
	console.log('wingameparticipants', wingameparticipants.length);
	for (let i = 0; i < wingameparticipants.length; i++) {
		await WinGameParticipant.findByIdAndDelete(wingameparticipants[i]._id);
	}

	const wingameresults = await WinGameResult.find({
		createdAt: {
			$gte: new Date(
				yesterday.getFullYear(),
				yesterday.getMonth(),
				yesterday.getDate()
			),
			$lte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		},
	});
	console.log('wingameresults', wingameresults.length);
	for (let i = 0; i < wingameresults.length; i++) {
		await WinGameResult.findByIdAndDelete(wingameresults[i]._id);
	}

	console.log(
		"removed all previous day's data wingame, wingameparticipant, wingameresult"
	);
});

// update all is_active = false if have any perticipent in the game refund all amount

exports.updateAllWinGame = catchAsyncErrors(async (req, res, next) => {
	// find all active win games
	const games = await WinGame.find({ is_active: true });
	if (games.length === 0) {
		return next(new ErrorHandler('No active games', 404));
	}
	console.log('games', games.length);
	for (let i = 0; i < games.length; i++) {
		// find all participants of the game
		const participants = await WinGameParticipant.find({
			game_id: games[i]._id,
		});
		if (participants.length === 0) {
			console.log('No participants');
		} else {
			// update participants
			for (let j = 0; j < participants.length; j++) {
				participants[j].status = 'refund';
				await participants[j].save();

				// update user
				const user = await User.findById(participants[j].user_id).select(
					'm_balance active_balance trading_volume name username'
				);
				user.m_balance += participants[j].amount;
				createTransaction(
					user._id,
					'cashIn',
					participants[j].amount,
					'winning_amount',
					`Winning Amount from ${games[i].game_type} Game Period no: #${games[i].game_id}`
				);
				await user.save();
			}
		}

		// update game
		games[i].is_active = false;
		await games[i].save();
	}
	res.status(200).json({
		success: true,
		message: 'All active games updated successfully',
	});
});

// get Participants by game_id
exports.getParticipantsByGameId = catchAsyncErrors(async (req, res, next) => {
	const { game_id } = req.params;
	const participants = await WinGameParticipant.find({ game_id });
	if (participants.length === 0) {
		return next(new ErrorHandler('No participants found', 404));
	}
	res.status(200).json({
		success: true,
		participants,
	});
});
