const express = require('express');
const router = express.Router();
const { sendMe, sendEmail } = require('../utils/sendEmail');
const User = require('../models/userModel');

// send email
router.post('/send-email', async (req, res) => {
	// all user email
	// const allUserEmail = await User.find({}, { email: 1, _id: 0 });
	// const { email, subject, message } = req.body;
	// const result = await sendEmail({
	// 	email: 'zsumonn@gmail.com',
	// 	subject: 'Updates Notice ',
	// 	message:
	// 		'Site updates in progress, no one will be able to access at this time. Please wait. The update will be completed in a few hours',
	// });
	res.status(200).json({
		message: 'Email sent successfully',
		// result,
		// allUserEmail,
	});
});
module.exports = router;
