import nodemailer from 'nodemailer';

let transporter;

if (process.env.EMAIL_HOST && !process.env.EMAIL_HOST.includes('example')) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  // Development fallback: JSON transport that doesn't send network emails
  // This prevents registration from failing when SMTP isn't configured.
  // Emails will be output as JSON to the console.
  // eslint-disable-next-line no-console
  console.warn('EMAIL_HOST not configured or using example host — using dev JSON transport');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    // In dev JSON transport, `info` contains the message object — log for debugging.
    // eslint-disable-next-line no-console
    console.log('Email sent (info):', info && info.messageId ? info.messageId : info);
  } catch (err) {
    // Log and swallow email errors in dev to avoid failing user-facing flows
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', err.message || err);
  }
}

export default transporter;
