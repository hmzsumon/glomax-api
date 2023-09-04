// condition 1
const condition1 = () => {
	const r = [2, 4, 6, 8];
	const g = [1, 3, 7, 9];

	// Generate a random number between 0 and 1
	const randomProbability = Math.random();

	// Determine the set of colors to choose from based on probability
	const colors = randomProbability < 0.88 ? ['r', 'g'] : ['rv', 'gv'];

	// Select a random color from the chosen set
	let randomColor = colors[Math.floor(Math.random() * colors.length)];

	// Select a random number based on the chosen color
	let randomNumber = null;
	if (randomColor === 'r') {
		randomNumber = r[Math.floor(Math.random() * r.length)];
	} else if (randomColor === 'g') {
		randomNumber = g[Math.floor(Math.random() * g.length)];
	} else if (randomColor === 'rv') {
		randomNumber = 0;
	} else if (randomColor === 'gv') {
		randomNumber = 5;
	}

	let betIds = [];
	if (randomColor === 'r' && randomNumber === 2) {
		betIds = ['red', '2'];
	} else if (randomColor === 'r' && randomNumber === 4) {
		betIds = ['red', '4'];
	} else if (randomColor === 'r' && randomNumber === 6) {
		betIds = ['red', '6'];
	} else if (randomColor === 'r' && randomNumber === 8) {
		betIds = ['red', '8'];
	} else if (randomColor === 'g' && randomNumber === 1) {
		betIds = ['green', '1'];
	} else if (randomColor === 'g' && randomNumber === 3) {
		betIds = ['green', '3'];
	} else if (randomColor === 'g' && randomNumber === 7) {
		betIds = ['green', '7'];
	} else if (randomColor === 'g' && randomNumber === 9) {
		betIds = ['green', '9'];
	} else if (randomColor === 'rv' && randomNumber === 0) {
		betIds = ['violet', 'red', '0'];
	} else if (randomColor === 'gv' && randomNumber === 5) {
		betIds = ['violet', '5', 'green'];
	}

	let colorCodes = [];
	// generate color codes from bet_ids
	betIds.forEach((item) => {
		if (item === 'red') {
			colorCodes.push('#D32F2F');
		} else if (item === 'green') {
			colorCodes.push('#388E3C');
		} else if (item === 'violet') {
			colorCodes.push('#6739B6');
		}
	});

	const winner = {
		number: randomNumber,
		color: randomColor,
		bet_ids: betIds,
		length: betIds.length,
		color_codes: colorCodes,
	};

	return winner;
};

// condition 2
const condition2 = (gameIdes) => {
	// console.log('Buttons', gameIdes);
	const r = ['2', '4', ' 6', '8'];
	const g = ['1', '3', '7', '9'];

	// Find "red" and "green" objects from gameIdes
	const redObj = gameIdes.find((item) => item.btn_id === 'red');
	const greenObj = gameIdes.find((item) => item.btn_id === 'green');

	// Select a random color from the chosen set
	// Find the winning color based on the minimum total_amount
	const randomColor = redObj.total_amount < greenObj.total_amount ? 'r' : 'g';

	// Select a random number based on the chosen color
	let randomNumber = null;

	if (randomColor === 'r') {
		// Find the smallest object (based on total_amount) from the 'r' bet_ids
		const smallestObject = gameIdes
			.filter((item) => r.includes(item.btn_id))
			.reduce((prev, curr) =>
				prev.total_amount < curr.total_amount ? prev : curr
			);
		randomNumber = smallestObject.btn_id;
	} else if (randomColor === 'g') {
		// Find the smallest object (based on total_amount) from the 'g' bet_ids
		const smallestObject = gameIdes
			.filter((item) => g.includes(item.btn_id))
			.reduce((prev, curr) =>
				prev.total_amount < curr.total_amount ? prev : curr
			);
		randomNumber = smallestObject.btn_id;
	}

	// console.log('randomNumber', randomNumber);
	// console.log('randomColor', randomColor);

	let betIds2 = [];
	if (randomColor === 'r' && randomNumber === '2') {
		betIds2 = ['red', '2'];
	} else if (randomColor === 'r' && randomNumber === '4') {
		betIds2 = ['red', '4'];
	} else if (randomColor === 'r' && randomNumber === '6') {
		betIds2 = ['red', '6'];
	} else if (randomColor === 'r' && randomNumber === '8') {
		betIds2 = ['red', '8'];
	} else if (randomColor === 'g' && randomNumber === '1') {
		betIds2 = ['green', '1'];
	} else if (randomColor === 'g' && randomNumber === '3') {
		betIds2 = ['green', '3'];
	} else if (randomColor === 'g' && randomNumber === '7') {
		betIds2 = ['green', '7'];
	} else if (randomColor === 'g' && randomNumber === '9') {
		betIds2 = ['green', '9'];
	}
	// console.log('betIds2', betIds2);
	let colorCodes = [];
	// generate color codes from bet_ids
	betIds2.forEach((item) => {
		if (item === 'red') {
			colorCodes.push('#D32F2F');
		} else if (item === 'green') {
			colorCodes.push('#388E3C');
		}
	});

	const winner = {
		number: randomNumber,
		color: randomColor,
		bet_ids: betIds2,
		length: betIds2.length,
		color_codes: colorCodes,
	};

	return winner;
};

// condition 3
const condition3 = (gameIdes) => {
	// Find "red" and "green" objects from gameIdes
	const redObj = gameIdes.find((item) => item.btn_id === 'red');
	const greenObj = gameIdes.find((item) => item.btn_id === 'green');

	// Find the winning color based on the maximum total_amount
	const randomColor = redObj.total_amount > greenObj.total_amount ? 'rv' : 'gv';

	// Select a random number based on the chosen color
	const randomNumber = randomColor === 'rv' ? 0 : 5;

	// Generate bet_ids and color_codes arrays
	const betIds2 = [
		'violet',
		randomColor === 'rv' ? 'red' : 'green',
		randomNumber.toString(),
	];
	const colorCodes =
		randomColor === 'rv' ? ['#6739B6', '#D32F2F'] : ['#6739B6', '#388E3C'];

	const winner = {
		number: randomNumber,
		color: randomColor,
		bet_ids: betIds2,
		length: betIds2.length,
		color_codes: colorCodes,
	};

	return winner;
};

module.exports = {
	condition1,
	condition2,
	condition3,
};
