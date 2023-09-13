module.exports = function withdrawTemplate2(name, amount, tnx_id, e_address) {
	return `
<html>
	<head>
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f6f6f6;
				margin: 0;
				padding: 0;
			}
			.container {
				max-width: 600px;
				margin: 20px auto;
				background-color: #f8fafc;
				border-radius: 15px;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
				overflow: hidden;
			}
			.header {
				background-color: #16202d;
				color: white;
				padding: 15px;
				text-align: center;
			}
			.content {
				padding: 20px;
			}
			.footer {
				background-color: #e6e6e6;
				padding: 10px 20px;
				font-size: small;
			}
			.code {
				font-size: 36px;
				color: #fbc02d;
				text-align: center;
				margin: 15px 0;
			}
			.link {
				color: #1e90ff;
				text-decoration: none;
			}
			.p2 {
				text-align: center;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>Glomax Transaction</h1>
			</div>
			<div class="content">
				<p>Hello ${name},</p>
				<h3>USDT Withdraw Successful</h3>
				<p>
					Your withdrawal request has been successfully processed. You have
					received amount
					<span style="color: #166534"> ${amount}</span>USDT. Please check your
					crypto wallet.<br />
					<br />
					<span style="font-weight: bold; font-size: 17px"
						>Withdrawal Address:</span
					>
					<br />
					<span style="color: #166534">${e_address} </span>
					<br /><br />
					<span style="font-weight: bold; font-size: 17px"
						>Your Transaction ID:</span
					><br />
					<span style="color: #166534"> ${tnx_id} </span>
				</p>
				<br />

				<p>
					Don't recognize this activity?
					<a href="https://glomax.vercel.app/" class="link">Reset</a> your
					password and contact
					<a href="https://t.me/glomax2020" class="link">customer support</a>
					immediately.
				</p>
				<p>This is an automated message, please don't reply.</p>
			</div>
			<div class="footer">
				<p>
					For security reasons, always make sure you're on the official Glomax
					website before entering any sensitive information.
				</p>
				<p class="p2">
					&copy; 2023 <a class="link" href="https://glomax.com/">Glomax</a>. All
					Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>
`;
};
