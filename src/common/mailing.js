const nodemailer = require('nodemailer');
const orderService = require("../services/order.service.js");


let mailTransporter =
	nodemailer.createTransport(
		{
			service: 'gmail',
			auth: {
				user: process.env.FROM_EMAIL,
				pass: process.env.MAIL_PASSWORD
			}
		}
	);

let mailDetails = {
	from: process.env.FROM_EMAIL,
	to: process.env.TO_EMAIL,
	subject: 'Order details'
};

async function send() {
	let d = new Date();
	d.setDate(d.getDate() - 1);
	const formattedDate = d.toISOString().split('T')[0];
	const orderDetails = await orderService.sendOrderDetails(formattedDate);

	mailDetails.html = "<p>Order details for " + formattedDate + ":</p>" + orderDetails;
	mailTransporter
	.sendMail(mailDetails,
		function (err, data) {
			if (err) {
                console.log(err);
				console.log('Error Occurs');
			} else {
				console.log('Email sent successfully');
			}
		});
}

module.exports = { send };
