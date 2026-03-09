const nodemailer = require("nodemailer");

function buildTransport(env) {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

async function sendOtpEmail(env, toEmail, code) {
  const transport = buildTransport(env);
  const subject = "Your ERP-B2B verification code";
  const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`;

  if (!transport) {
    // eslint-disable-next-line no-console
    console.log(`[mfa] OTP for ${toEmail}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: toEmail,
    subject,
    text,
  });
}

module.exports = { sendOtpEmail };
