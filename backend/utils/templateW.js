module.exports = function withdrawTemplate1(name, amount, tnx_id) {
	return `
<html>

	<head>
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
				color: #f36346;
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
				background-color: #0c1119;
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
				<h3>Withdraw Request Successfully</h3>
				<p>
					You have successfully requested to withdraw
					<span style="color: #f9c405"> ${amount}</span> from your account.<br />
					Your Transaction ID is
					<span style="color: #f9c405">
                        ${tnx_id}
                    </span><br />
					Your withdrawal request will be processed please wait while we
					process.
				</p>

				<div
					style="
						background-color: #0ea5e9;
						color: #000;
						text-align: center;
						padding: 10px;
						width: 40%;
						height: 30px;
						border-radius: 5px;
						display: flex;
						align-items: center;
						justify-content: center;
						text-underline-position: none;
					"
				>
					<a
						href="https://www.glomax.vercel.app/view-transaction?transaction_id=[TRANSACTION_ID]"
						style="color: white"
						>View Transaction History</a
					>
				</div>
				<p>
					Don't recognize this activity? Please
					<a href="https://www.glomax.vercel.app/"
						><span style="color: #f9c405">reset</span></a
					>
					your password and contact your
					<a href="https://www.glomax.vercel.app/"
						><span style="color: #f9c405">customer support</span></a
					>
					immediately.
				</p>
				<p>This is an automated message, please don't reply.</p>
			</div>
			<div class="footer">
				<p>
					Risk warning: Cryptocurrency trading is subject to high market risk.
					Glomax will make the best efforts to choose high-quality coins. Please trade with
					caution.
				</p>
				<p>
					Kindly note: Please be aware of phishing sites and always make sure
					you are visiting the official  glomax.vercel.app website when entering
					sensitive data.
				</p>
				<p style="text-align: center">
					&copy; 2023
					<a href="https://www.glomax.vercel.app/"
						><span style="color: #f9c405">glomax.vercel.app</span></a
					>
					All Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>`;
};
