module.exports = function templateKycApprove(name) {
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
				color: #4caf50;
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
				<h1>Glomax KYC Approval</h1>
			</div>
			<div class="content">
				<p>Hello ${name},</p>
				<h3>Your KYC Verification is Approved</h3>
				<p>
					Congratulations! Your KYC verification has been successfully approved.
					You are now a verified member of Glomax.
				</p>

				<p>
					If you have any further questions or concerns, please feel free to
					contact
					<a href="https://t.me/glomax2020" class="link">customer support</a>.
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
