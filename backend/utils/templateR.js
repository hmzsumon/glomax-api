module.exports = function registrationTemplate(name, code) {
	console.log(name, code);
	return `<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Your Email Template</title>
		<style>
			body {
				font-family: 'Arial', sans-serif;
				background-color: #f6f6f6;
				margin: 0;
				padding: 0;
			}
			.container {
				max-width: 600px;
				margin: 20px auto;
				background-color: hsl(0, 2%, 24%);
				border-radius: 15px;
				overflow: hidden;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
			}
			.header {
				/* height: 20vh; */
				width: 70vw;
				margin: auto;
				/* width: 20vw; */
				background: url('https://glomax.vercel.app/_next/image?url=%2Frapid-logo1.png&w=256&q=75')
					no-repeat center center;
				background-size: contain;
				/* Make the logo responsive */
				/* background-color: black; */
				color: white;
				padding: 0;
				text-align: center;
				border-radius: 15px 15px 0 0;
			}
			.content {
				padding: 20px;
				color: white;
			}
			/* ... (your existing CSS rules) ... */
			@media (max-width: 600px) {
				.header {
					height: 80px;
					background-size: cover; /* Adjust for smaller screens */
				}
			}
			.footer {
				background-color: black;
				color: #f6f6f6;
				padding: 20px;
				text-align: start;
				border-radius: 0 0 15px 15px;
				font-size: small;
			}
			.welcome {
				color: #f36346;
			}
			.footer a {
				color: yellow;
				text-decoration: none;
			}
			.fasion {
				background-color: black;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="fasion">
				<div class="header">
					<!-- Logo image will be the background of this div -->
					<img src="" alt="" />
				</div>
			</div>
			<div class="content">
				<h2>Glomax Transaction</h2>
				<p>Hello ${name},</p>
				<h3>Payment Received Successfully</h3>
				<p>
					You have received an amount
					<span style="color: #f9c405">567</span> USDT.<br />Please visit
					<a href="https://www.glomax.org/"
						><span style="color: #f9c405">website</span></a
					>
					for more information.
				</p>

				<div
					style="
						background-color: #ae8686;
						color: #000;
						text-align: center;
						padding: 10px;
						width: 40%;
						height: 30px;
						border-radius: 5px;
						display: flex;
						align-items: center;
						justify-content: center;
						text-underline-position: auto;
					"
				>
					<a
						href="https://www.glomax.org/view-transaction?transaction_id=[TRANSACTION_ID]"
						style="color: white"
						>View Transaction History</a
					>
				</div>
				<p>
					Don't recognize this activity? Please
					<a href="https://www.glomax.org/"
						><span style="color: #f9c405">reset</span></a
					>
					your password and contact your
					<a href="https://www.glomax.org/"
						><span style="color: #f9c405">customer support</span></a
					>
					immediately.
				</p>
				<p>This is an automated message, please don't reply.</p>
			</div>
			<div class="footer">
				<p>

					Risk warning: Cryptocurrency trading is subject to high market risk.
					Globax will make the best efforts to choose high-quality coins, but
					will not be responsible for your trading losses. Please trade with
					caution.
				</p>
				<p>
					Kindly note: Please be aware of phishing sites and always make sure
					you are visiting the official Globax.org website when entering
					sensitive data.
				</p>
				<p style="text-align: center">
					&copy; 2023 glomax.org, All Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>`;
};
