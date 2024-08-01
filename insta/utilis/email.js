const nodemailer = require('nodemailer');

async function sendEmail(dest, sub, msg, attachment) {
  let attach = [];
  if (attachment) {
    attach = attachment;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: dest, // list of receivers
    subject: sub, // Subject line
    attachments: attach,
    text: 'NO REPLY EMAIL', // plain text body
    html: msg // html body
  });
}

module.exports = { sendEmail };
