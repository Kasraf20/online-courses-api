const {Resend} = require("resend");
require("dotenv").config();

const instanceResend = new Resend(process.env.KEY_RESEND);

const sendMail = async (from, to, subject, html) => {
    try {
      const data = await instanceResend.emails.send({
        from: from,
        to: to,
        subject: subject,
        html: html,
      });
      console.log("Email data: ", data);
    } catch (error) {
      console.error(error);
      return error;
    }
  };
  
  module.exports = sendMail;