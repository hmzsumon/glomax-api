// Create a new win game  every 1min and update the status of the game after 1min
// cron.schedule('*/1 * * * *', async () => {
// 	// const winGame = await WinGame.create({
// 	// 	name: 'Win Game',
// 	// 	status: 'Active',
// 	// });

// 	// find all test
// 	const tests = await Test.find();

// 	const test_id = tests.length + 1;
// 	const test_name = `Test-${test_id}`;

// 	const test = await Test.create({
// 		name: test_name,
// 		time: 60,
// 		test_id: test_id,
// 		start_time: Date.now(),
// 		duration: 0,
// 	});

// 	function countdown(seconds) {
// 		const interval = 1000; // 1 second in milliseconds

// 		function tick() {
// 			console.log(`Countdown: ${seconds} seconds remaining`);
// 			global.io.to('test-room').emit('test-time', seconds);
// 			seconds--;
// 			if (seconds >= 0) {
// 				setTimeout(tick, interval);
// 			} else {
// 				console.log('Countdown finished!');
// 			}
// 		}

// 		tick();
// 	}

// 	// Usage
// 	countdown(test.time);

// 	console.log(
// 		'Test created',
// 		test.name,
// 		test.test_id,
// 		test.start_time,
// 		test.duration
// 	);

// 	setTimeout(async () => {
// 		// find test by id
// 		const updatedTest = await Test.findById(test._id);
// 		// update test duration
// 		let duration = Date.now() - test.start_time;
// 		updatedTest.duration = duration;
// 		updatedTest.end_time = Date.now();
// 		updatedTest.is_active = false;
// 		updatedTest.save();
// 		console.log('Updated Test', updatedTest.name, updatedTest.duration);
// 	}, 59500);
// });

let activeTest = null;

async function createTestAndStartCountdown() {
	const tests = await Test.find();
	const test_id = tests.length + 1;
	const test_name = `Test-${test_id}`;

	const test = await Test.create({
		name: test_name,
		time: 60,
		test_id: test_id,
		start_time: Date.now(),
		duration: 0,
		is_active: true,
	});

	console.log(
		'Test created',
		test.name,
		test.test_id,
		test.start_time,
		test.duration
	);

	activeTest = test;
	countdown(test);
}

function countdown(test) {
	const interval = 1000; // 1 second in milliseconds

	function tick() {
		const remainingSeconds = Math.max(
			0,
			test.time - Math.floor((Date.now() - test.start_time) / 1000)
		);

		console.log(`Countdown: ${remainingSeconds} seconds remaining`);
		// emitTestTimeUpdate(test.test_id, remainingSeconds);
		global.io.to('test-room').emit('test-time', remainingSeconds);

		if (remainingSeconds > 0 && test.is_active) {
			setTimeout(tick, interval);
		} else {
			console.log('Countdown finished!');
			updateTestAndCreateNext(test);
		}
	}

	tick();
}

async function updateTestAndCreateNext(test) {
	if (test.is_active) {
		const duration = Date.now() - test.start_time;
		test.duration = duration;
		test.end_time = Date.now();
		test.is_active = false;
		await test.save();
		console.log('Updated Test', test.name, test.duration);
	}

	// Create another test and start the countdown
	createTestAndStartCountdown();
}

// Schedule the first test creation and countdown
// cron.schedule('*/1 * * * *', createTestAndStartCountdown);

// function emitTestTimeUpdate(testId, remainingSeconds) {
// 	global.io.to('test-room').emit('test-time', {
// 		testId,
// 		remainingSeconds,
// 	});
// }

// const function1 = async () => {
// 	const tests = await Test.find();
// 	const test_id = tests.length + 1;
// 	const test_name = `Test-${test_id}`;

// 	const test = await Test.create({
// 		name: test_name,
// 		time: 60,
// 		test_id: test_id,
// 		start_time: Date.now(),
// 		duration: 0,
// 		is_active: true,
// 	});
// 	console.log('Created Test', test.name);
// 	countdown(test);
// };

// function countdown(test) {
// 	let seconds = test.time;
// 	const interval = 1000; // 1 second in milliseconds

// 	function tick() {
// 		console.log(`Countdown: ${seconds} seconds remaining`);
// 		global.io.to('test-room').emit('test-time', seconds);
// 		seconds--;
// 		if (seconds < 0) {
// 			console.log('Countdown finished! and update', test.name);
// 			updateTest(test).then(() => {
// 				// After the update is finished, start a new test
// 				function1(); // Call function1 to create and start a new test
// 			});
// 			clearInterval(countdownInterval); // Clear the countdown interval to stop this test's countdown
// 		}
// 	}

// 	// Start the countdown
// 	const countdownInterval = setInterval(tick, interval);
// }

// const updateTest = async (test) => {
// 	if (test.is_active) {
// 		const duration = Date.now() - test.start_time;
// 		test.duration = duration;
// 		test.end_time = Date.now();
// 		test.is_active = false;
// 		await test.save();
// 		console.log('Updated Test', test.name, test.duration);
// 	}
// };

// // Start the process by calling function1
// function1();
