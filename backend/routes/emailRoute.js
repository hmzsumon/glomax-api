const express = require('express');
const router = express.Router();
const { sendMe, sendEmail } = require('../utils/sendEmail');
const User = require('../models/userModel');
const { testEmail } = require('../utils/testEmail');

// send email
router.post('/test-email', async (req, res) => {
	const { email } = req.body;
	// send email
	testEmail(email);
	console.log(email);

	res.status(200).json({
		message: 'Email sent successfully',
		// result,
		// allUserEmail,
	});
});
module.exports = router;
