const nodemailer = require('nodemailer');

// send email
const sendEmail = async (option) => {
	try {
		const transporter = nodemailer.createTransport({
			host: 'mail.privateemail.com',
			port: 587,
			secure: false,
			auth: {
				user: 'support@glomax.org', // replace with your email address
				pass: 'Asad@1995', // replace with your email password
			},
		});

		const info = await transporter.sendMail({
			from: 'Glomax" <support@glomax.org>',
			to: option.email,
			subject: option.subject,
			html: option.html,
		});
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	} catch (err) {
		console.log(err);
	}
};

module.exports = { sendEmail };
