import { createTransport } from "nodemailer";
import { MAIL_USER, MAIL_PASS } from "../../config/config.service.js";
import type { Attachment } from "nodemailer/lib/mailer/index.js";

const transporter = createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,


  },

});

async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}) {
  try {
    console.log(MAIL_USER);
    console.log(MAIL_PASS);
    const info = await transporter.sendMail({
      from: `amir aboshama send for u <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log("Email sent:", info.messageId);
    console.log(MAIL_USER);
    console.log(MAIL_PASS);
  } catch (err) {
    console.error("Email send failed:", err);
    throw err; // عشان يظهر في sendOtp
  }
}
export default sendEmail