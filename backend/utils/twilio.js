// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = 'ACd8e1f4651d0b18438e32ed43419c5b1a';
const authToken = 'a78f81e71cb299e3716b4be9b0102760';
const verifySid = 'VA0c4f78b9eee35e55fe0fc5ce780919bc';
const client = require('twilio')(accountSid, authToken);

const sendWhatsAppVerificationCode = async (to, verificationCode) => {
	try {
		const message = await client.messages.create({
			from: 'whatsapp:+14155238886', // Twilio sandbox number
			to: `whatsapp:${to}`,
			body: `Your Glomax verification code is: ${verificationCode}`,
		});

		console.log(`Verification code message sent. SID: ${message.sid}`);
	} catch (error) {
		console.error(`Error sending verification code: ${error.message}`);
	}
};

module.exports = sendWhatsAppVerificationCode;
