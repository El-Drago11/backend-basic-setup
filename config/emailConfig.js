import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { email_from, email_host, email_pass, email_port, email_user } from "../utils/envImporter";

let transporter = nodemailer.createTransport({
  host: email_host,
  port: email_port,
  secure: false,
  auth: {
    user: email_user,
    pass: email_pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ to, subject, html }) => {

  await transporter.sendMail({
    from: email_from,
    to,
    subject,
    html
  });
};


export default transporter;
