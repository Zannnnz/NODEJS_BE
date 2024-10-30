//emnj ovvk ngxh oukp
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config()
const transporter = nodemailer.createTransport({
   service:'gmail',
   auth:{
      user:process.env.MAIL_USER,
      pass:process.env.MAIL_PASS,
   }
})

export default transporter;