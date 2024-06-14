const nodemailer = require('nodemailer');
const generateOtp = require('generate-otp');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.OTPEMAIL,
    pass: process.env.OTPPASS,
  },
});

function otp(email) {
  console.log(email);
  const otp = generateOtp.generate(6, { digits: true, alphabets: false, specialChars: false });

  const mailOptions = {
    from: process.env.OTPEMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  console.log(otp);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ' + error);
    } else {
      console.log('Email sent to: ' + email);
    }
  });

  return otp;
}

module.exports = { otp };
