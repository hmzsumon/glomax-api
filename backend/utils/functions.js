// unique id generator
const generateUniqueId = () => {
	const date = new Date();
	const uniqueId = `${date.getFullYear()}${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
	return uniqueId;
};

module.exports = {
	generateUniqueId,
};
