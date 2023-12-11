module.exports = function templateKycReject(name, reasons) {
	return `
<!DOCTYPE html>
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
				background-color: #ffffff;
				border-radius: 15px;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
				overflow: hidden;
			}

			.header {
				background-color: #ff4444;
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
				<h1>Glomax KYC Rejection</h1>
			</div>
			<div class="content">
				<p>Hello ${name},</p>
				<h3>Your KYC Verification Request has been Rejected</h3>
				<p>
					We regret to inform you that your KYC verification request has been
					rejected due to the following reasons:
				</p>
				<ul>
					${reasons.map((reason) => `<li>${reason}</li>`)}
				</ul>

				<p>
					If you believe there has been an error, please contact
					<a href="https://t.me/glomax2020" class="link">customer support</a>
					for further assistance.
				</p>

				<p>
					This decision is final, and we encourage you to review and resubmit
					your KYC information with accurate and up-to-date details.
				</p>
				<p>This is an automated message; please do not reply.</p>
			</div>
			<div class="footer">
				<p>
					For security reasons, always make sure you're on the official Glomax
					website before entering any sensitive information.
				</p>
				<p class="p2">
					&copy; 2023 <a class="link" href="https://glomax.org/">Glomax</a>. All
					Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>
`;
};
