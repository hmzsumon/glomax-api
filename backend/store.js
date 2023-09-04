const array1 = [
	'r',
	'g',
	'rv',
	'g',
	'r',
	'g',
	'g',
	'r',
	'gv',
	'r',
	'g',
	'g',
	'r',
	'r',
	'g',
	'g',
	'r',
];
const arrayOfr = [2, 4, 6, 8];
const arrayOfg = [1, 3, 7, 9];
randomColor = array1[Math.floor(Math.random() * array1.length)];
console.log(randomColor);
// select random number
if (randomColor === 'r') {
	randomNumber = arrayOfr[Math.floor(Math.random() * arrayOfr.length)];
} else if (randomColor === 'g') {
	randomNumber = arrayOfg[Math.floor(Math.random() * arrayOfg.length)];
} else if (randomColor === 'rv') {
	randomNumber = 0;
} else if (randomColor === 'gv') {
	randomNumber = 5;
}

// coundown timer
async function countdown1(game, cb) {
	let seconds = game.time;
	const interval = 1000; // 1 second in milliseconds

	async function tick() {
		// if (game.game_type === '1m') {
		// 	console.log(
		// 		colors.green(
		// 			`Countdown: for ${game.game_title} ${seconds} seconds remaining`
		// 		)
		// 	);
		// } else if (game.game_type === '3m') {
		// 	console.log(
		// 		colors.blue(
		// 			`Countdown: for ${game.game_title} ${seconds} seconds remaining`
		// 		)
		// 	);
		// } else if (game.game_type === '5m') {
		// 	console.log(
		// 		colors.red.underline(
		// 			`Countdown: for ${game.game_title} ${seconds} seconds remaining`
		// 		)
		// 	);
		// }

		seconds--;
		if (game.game_type == '1m') {
			const ioData = {
				id: game._id,
				game_id: game.game_id,
				time: seconds,
			};
			global.io.to('test-room').emit('game-1m', ioData);
		} else if (game.game_type == '3m') {
			const ioData = {
				id: game._id,
				game_id: game.game_id,
				time: seconds,
			};
			global.io.to('test-room').emit('game-3m', ioData);
		} else if (game.game_type == '5m') {
			const ioData = {
				id: game._id,
				game_id: game.game_id,
				time: seconds,
			};
			global.io.to('test-room').emit('game-5m', ioData);
		}

		if (seconds < 0) {
			// console.log('Countdown finished! and update', game.game_title);
			await updateGame(game._id);
			await sleep(2000); // Wait for 5 seconds before starting a new test (adjust as needed)
			await cb();
		}
	}

	// Start the countdown
	while (seconds >= 0) {
		await tick();
		await sleep(interval);
	}
}
