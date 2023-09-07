const nodeMailer = require('nodemailer');
const Sib = require('sib-api-v3-sdk');
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

// send email
const sendEmail = async (option) => {
	try {
		const apiInstance = new Sib.TransactionalEmailsApi();
		const sendSmtpEmail = new Sib.SendSmtpEmail();
		sendSmtpEmail.subject = option.subject;
		sendSmtpEmail.htmlContent = option.html;
		sendSmtpEmail.sender = {
			name: 'Glomax',
			email: 'glomaxservice24@gmail.com',
		};
		sendSmtpEmail.to = [{ email: option.email }];
		await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log('Email sent successfully');
	} catch (err) {
		console.log(err);
	}
};

module.exports = { sendEmail };
