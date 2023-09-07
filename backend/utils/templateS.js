module.exports = function securityTemplate(name, code) {
	return `
<html>
	<head>
		<meta charset="utf-8" />
		<title>Your Email Template</title>
		<style>
			/* Add your CSS styles here */
			body {
				font-family: 'Arial', sans-serif;
				background-color: #f6f6f6;
				margin: 0;
				padding: 0;
			}
			.container {
				max-width: 600px;
				margin: 20px auto;
				background-color: #16202d;
				border-radius: 15px;
				overflow: hidden;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
			}
			.header {
				height: 100px; /* Adjust the height as needed */
				background: url('https://glomax.vercel.app/_next/image?url=%2Frapid-logo1.png&w=256&q=75')
					no-repeat center center;
				background-size: auto 100px; /* Adjust the background size */
				background-color: #0c1119;
				color: white;
				padding: 0;
				text-align: center;
				border-radius: 15px 15px 0 0;
			}
			.content {
				padding: 10px;
				color: white;
			}
			.verification-code {
				font-size: 25px;
				color: #fbc02d;
			}
			.footer {
				background-color: #0c1119;
				color: #f6f6f6;
				padding: 20px;
				text-align: start;
				border-radius: 0 0 15px 15px;
				font-size: small;
			}
			.welcome {
				text-align: center;
				color: white;
			}
			.footer a {
				color: white;
				text-decoration: none;
			}
			.copy-button {
				background-color: #fbc02d;
				border: none;
				padding: 5px 10px;
				cursor: pointer;
				margin-left: 10px;
				border-radius: 4px;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<!-- Logo image will be the background of this div -->
			</div>
			<h1 class="welcome">Glomax Security Verification</h1>
			<div class="content">
				<h3 style="color: white">Hello ${name},</h3>
				<p style="color: white">You're almost there!</p>
				<p style="color: white">Please use the following verification code to proceed:</p>
				<div style="display: flex; align-items: center">
					<p class="verification-code" id="verificationCode">${code}</p>
				</div>
				<p style="color: white">
					The verification code will be valid for 30 minutes. Please do not
					share this code with anyone.
				</p>
				<p style="color: white">
					Once you’ve entered the code, you can reset your password and access
					your account.
				</p>
			</div>
			<div class="footer">
				<p>
					Risk warning: Cryptocurrency trading is subject to high market risk.
					Glomax will make the best efforts to choose high-quality coins, but
					will not be responsible for your trading losses. Please trade with
					caution.
				</p>
				<p>
					Kindly note: Please be aware of phishing sites and always make sure
					you are visiting the official Glomax.org website when entering
					sensitive data.
				</p>
				<p style="text-align: center">
					&copy; 2023
					<a href="https://glomax.vercel.app/"
						><span style="color: #f9c405">glomax.vercel.app</span></a
					>, All Rights Reserved.
				</p>
			</div>
		</div>

	</body>
</html>`;
};
