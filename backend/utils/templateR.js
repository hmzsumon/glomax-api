module.exports = function registrationTemplate(name, code) {
	console.log(name, code);
	return `

<body
	style="
		font-family: 'Arial', sans-serif;
		background-color: #f6f6f6;
		margin: 0;
		padding: 0;
	"
>
	<div
		style="
			max-width: 600px;
			margin: 20px auto;
			background-color: #16202d;
			border-radius: 15px;
			overflow: hidden;
			box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		"
	>
		<div
			style="
				height: 100px; /* Adjust the height as needed */
				background-color: #0c1119;
				color: white;
				padding: 0;
				text-align: center;
				border-radius: 15px 15px 0 0;
				display: flex;
				align-items: center;
				justify-content: center;
			"
		>
			<h1
				style="
					font-size: 72px;
					background: -webkit-linear-gradient(
						rgb(12, 104, 241),
						rgb(230, 7, 48)
					);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				"
			>
				Glomax
			</h1>
		</div>
		<h1 style="text-align: center; color: white">Welcome to glomax</h1>
		<div style="padding: 20px; color: white">
			<h3 style="color: white">Hello ${name},</h3>
			<p>You're almost there!</p>
			<p>Please use the following verification code to proceed:</p>
			<p class="verification-code" style="font-size: 36px; color: #fbc02d">
				${code}
			</p>
			<p style="color: white">
				The verification code will be valid for 30 minutes. Please do not share
				this code with anyone.
			</p>
			<p style="color: white">
				Once you’ve entered the code, you can reset your password and access
				your account.
			</p>
		</div>
		<div
			style="
				background-color: #0c1119;
				color: #f6f6f6;
				padding: 20px;
				text-align: start;
				border-radius: 0 0 15px 15px;
				font-size: small;
			"
		>
			<p>
				Risk warning: Cryptocurrency trading is subject to high market risk.
				Glomax will make the best efforts to choose high-quality coins. Please
				trade with caution.
			</p>
			<p>
				Kindly note: Please be aware of phishing sites and always make sure you
				are visiting the official glomax.vercel.app website when entering
				sensitive data.
			</p>
			<p style="text-align: center">
				&copy; 2023
				<a
					style="color: white; text-decoration: none"
					href="https://www.glomax.vercel.app/"
					><span style="color: #f9c405">glomax.vercel.app</span></a
				>, All Rights Reserved.
			</p>
		</div>
	</div>
</body>

`;
};
