const cron = require('node-cron');

// const gameIdes = [
// 	{
// 		btn_id: '0',
// 		total_amount: 0.5,
// 	},
// 	{
// 		btn_id: '1',
// 		total_amount: 0.1,
// 	},
// 	{
// 		btn_id: '2',
// 		total_amount: 0.8,
// 	},
// 	{
// 		btn_id: '3',
// 		total_amount: 0.6,
// 	},
// 	{
// 		btn_id: '4',
// 		total_amount: 1,
// 	},
// 	{
// 		btn_id: '5',
// 		total_amount: 10,
// 	},
// 	{
// 		btn_id: '6',
// 		total_amount: 0.2,
// 	},
// 	{
// 		btn_id: '7',
// 		total_amount: 2,
// 	},
// 	{
// 		btn_id: '8',
// 		total_amount: 0.3,
// 	},
// 	{
// 		btn_id: '9',
// 		total_amount: 0.4,
// 	},
// 	{
// 		btn_id: 'red',
// 		total_amount: 5,
// 	},
// 	{
// 		btn_id: 'violet',
// 		total_amount: 0.1,
// 	},
// 	{
// 		btn_id: 'green',
// 		total_amount: 30,
// 	},
// ];

// // const condition3 = (gameIdes) => {
// // 	// Generate a random number between 0 and 1
// // 	const randomProbability = Math.random();

// // 	// Determine the set of colors to choose from based on probability
// // 	const colors = randomProbability < 0.5 ? ['rv'] : ['gv'];

// // 	// Select a random color from the chosen set
// // 	let randomColor = null;

// // 	// find "red" and "green" from gameIdes
// // 	const redObj = gameIdes.find((item) => item.btn_id === 'red');
// // 	const greenObj = gameIdes.find((item) => item.btn_id === 'green');

// // 	// find max object from redObj and greenObj
// // 	const maxAmount = Math.max(redObj.total_amount, greenObj.total_amount);

// // 	// find max object by maxAmount
// // 	if (maxAmount === redObj.total_amount) {
// // 		randomColor = 'rv';
// // 	} else if (maxAmount === greenObj.total_amount) {
// // 		randomColor = 'gv';
// // 	}

// // 	console.log(redObj, greenObj);
// // 	console.log(maxAmount);

// // 	// Select a random number based on the chosen color
// // 	let randomNumber = null;

// // 	if (randomColor === 'rv') {
// // 		randomNumber = 0;
// // 	} else if (randomColor === 'gv') {
// // 		randomNumber = 5;
// // 	}

// // 	let betIds2 = [];
// // 	if (randomColor === 'rv' && randomNumber === 0) {
// // 		betIds2 = ['violet', 'red', '0'];
// // 	} else if (randomColor === 'gv' && randomNumber === 5) {
// // 		betIds2 = ['violet', 'green', '5'];
// // 	}
// // 	let colorCodes = [];
// // 	// generate color codes from bet_ids
// // 	betIds2.forEach((item) => {
// // 		if (item === 'red') {
// // 			colorCodes.push('#D32F2F');
// // 		} else if (item === 'green') {
// // 			colorCodes.push('#388E3C');
// // 		}
// // 	});

// // 	const winner = {
// // 		number: randomNumber,
// // 		color: randomColor,
// // 		bet_ids: betIds2,
// // 		length: betIds2.length,
// // 		color_codes: colorCodes,
// // 	};

// // 	return winner;
// // };

// const condition4 = (gameIdes) => {
// 	// Find "red" and "green" objects from gameIdes
// 	const redObj = gameIdes.find((item) => item.btn_id === 'red');
// 	const greenObj = gameIdes.find((item) => item.btn_id === 'green');

// 	// find difference between redObj and greenObj
// 	const difference = Math.abs(redObj.total_amount - greenObj.total_amount);

// 	// Find the winning color based on the maximum total_amount
// 	const randomColor = redObj.total_amount > greenObj.total_amount ? 'rv' : 'gv';

// 	// Select a random number based on the chosen color
// 	const randomNumber = randomColor === 'rv' ? 0 : 5;

// 	// Generate bet_ids and color_codes arrays
// 	const betIds2 = [
// 		'violet',
// 		randomColor === 'rv' ? 'red' : 'green',
// 		randomNumber.toString(),
// 	];
// 	const colorCodes = [randomColor === 'rv' ? '#D32F2F' : '#388E3C'];

// 	const winner = {
// 		number: randomNumber,
// 		color: randomColor,
// 		bet_ids: betIds2,
// 		length: betIds2.length,
// 		color_codes: colorCodes,
// 	};

// 	return winner;
// };

// const condition2 = (gameIdes) => {
// 	// console.log('Buttons', gameIdes);
// 	const r = ['2', '4', ' 6', '8'];
// 	const g = ['1', '3', '7', '9'];

// 	// Find "red" and "green" objects from gameIdes
// 	const redObj = gameIdes.find((item) => item.btn_id === 'red');
// 	const greenObj = gameIdes.find((item) => item.btn_id === 'green');

// 	// Select a random color from the chosen set
// 	// Find the winning color based on the minimum total_amount
// 	const randomColor = redObj.total_amount < greenObj.total_amount ? 'r' : 'g';

// 	// Select a random number based on the chosen color
// 	let randomNumber = null;

// 	if (randomColor === 'r') {
// 		// Find the smallest object (based on total_amount) from the 'r' bet_ids
// 		const smallestObject = gameIdes
// 			.filter((item) => r.includes(item.btn_id))
// 			.reduce((prev, curr) =>
// 				prev.total_amount < curr.total_amount ? prev : curr
// 			);
// 		randomNumber = smallestObject.btn_id;
// 	} else if (randomColor === 'g') {
// 		// Find the smallest object (based on total_amount) from the 'g' bet_ids
// 		const smallestObject = gameIdes
// 			.filter((item) => g.includes(item.btn_id))
// 			.reduce((prev, curr) =>
// 				prev.total_amount < curr.total_amount ? prev : curr
// 			);
// 		randomNumber = smallestObject.btn_id;
// 	}

// 	// console.log('randomNumber', randomNumber);
// 	// console.log('randomColor', randomColor);

// 	let betIds2 = [];
// 	if (randomColor === 'r' && randomNumber === '2') {
// 		betIds2 = ['red', '2'];
// 	} else if (randomColor === 'r' && randomNumber === '4') {
// 		betIds2 = ['red', '4'];
// 	} else if (randomColor === 'r' && randomNumber === '6') {
// 		betIds2 = ['red', '6'];
// 	} else if (randomColor === 'r' && randomNumber === '8') {
// 		betIds2 = ['red', '8'];
// 	} else if (randomColor === 'g' && randomNumber === '1') {
// 		betIds2 = ['green', '1'];
// 	} else if (randomColor === 'g' && randomNumber === '3') {
// 		betIds2 = ['green', '3'];
// 	} else if (randomColor === 'g' && randomNumber === '7') {
// 		betIds2 = ['green', '7'];
// 	} else if (randomColor === 'g' && randomNumber === '9') {
// 		betIds2 = ['green', '9'];
// 	}
// 	// console.log('betIds2', betIds2);
// 	let colorCodes = [];
// 	// generate color codes from bet_ids
// 	betIds2.forEach((item) => {
// 		if (item === 'red') {
// 			colorCodes.push('#D32F2F');
// 		} else if (item === 'green') {
// 			colorCodes.push('#388E3C');
// 		}
// 	});

// 	const winner = {
// 		number: randomNumber,
// 		color: randomColor,
// 		bet_ids: betIds2,
// 		length: betIds2.length,
// 		color_codes: colorCodes,
// 	};

// 	return winner;
// };

// console.log(condition2(gameIdes));

// // Refactored countdown function
// async function countdown() {
// 	console.log('countdown function called');
// 	let seconds = 60;

// 	const interval = setInterval(async () => {
// 		seconds--;
// 		console.log(seconds);
// 		if (seconds === 0) {
// 			clearInterval(interval); // Stop the interval when the countdown is finished
// 			console.log('countdown finished');
// 			// await updateGame(game._id);
// 		}
// 	}, 1000); // Interval of 1 second
// }

// // Game creation functions
// const function1Minute = async () => {
// 	console.log('1 minute game created');
// 	// call the countdown function
// 	await countdown();
// };

// const function5Minute = async () => {
// 	console.log('game created using setInterval');
// 	// call the countdown function
// 	// await countdown();
// };

// // Scheduling the game creation functions using setInterval
// setInterval(function1Minute, 60000); // Every 1 minute

// // cron.schedule('*/1 * * * *', async () => {
// // 	function1Minute();
// // 	console.log('Game created using cron job');
// // });

// let profit = {
// 	1: 0.015,
// 	2: 0.016,
// 	3: 0.018,
// };

// for (let i = 4; i <= 170; i++) {
// 	profit[i] = 0.02;
// }

// console.log(profit);

const randomNum = Math.floor(Math.random() * 1000) / 1000;
console.log(number.toFixed(3));
