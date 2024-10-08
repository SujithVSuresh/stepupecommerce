const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
      // Create a Transporter to send emails
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'sujithforcoding@gmail.com',
          pass: process.env.GOOGLE_PASS_KEY,
        }
      });
      // Send emails to users
      let info = await transporter.sendMail({
        from: 'Sujith V S - sujithforcoding@gmail.com',
        to: email,
        subject: title,
        text: body
      });
      
      console.log("Email info: ", info);
      return info;
    } catch (error) {
      console.log(error.message);
    }
  };

  module.exports = mailSender;