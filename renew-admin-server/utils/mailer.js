const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(to, code){
  try {
    await transporter.sendMail({
      from: `"Renew Admin" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Your Renew Admin login code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `<p>Your verification code is:</p><h2 style="letter-spacing: 4px;">${code}</h2><p>This code expires in 10 minutes.</p>`,
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Nodemailer failed to send email:", error);
    throw error;
  }
}

module.exports = { sendOtpEmail };