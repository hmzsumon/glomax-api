const emailProcessor = async (job, done) => {
	const { name, email } = job.data.user;
	console.log(`Sending email to ${name} at ${email}`);
	done();
};

module.exports = emailProcessor;
