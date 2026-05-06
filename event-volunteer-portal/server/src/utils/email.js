const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

exports.sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`📧 [Email disabled] Would send "${subject}" to ${to}`);
    return { skipped: true };
  }
  try {
    const info = await t.sendMail({
      from: process.env.MAIL_FROM || 'EVP Portal <no-reply@evp.local>',
      to,
      subject,
      text,
      html,
    });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (e) {
    console.error('📧 Email failed:', e.message);
    return { error: e.message };
  }
};
