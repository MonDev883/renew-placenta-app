async function sendEmail({ to, subject, text, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Renew Admin', email: process.env.GMAIL_USER },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  }
}

async function sendOtpEmail(to, code) {
  await sendEmail({
    to,
    subject: 'Your Renew Admin login code',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `<p>Your verification code is:</p><h2 style="letter-spacing: 4px;">${code}</h2><p>This code expires in 10 minutes.</p>`,
  });
  console.log('Login code email sent to:', to);
}

async function sendResetEmail(to, code) {
  await sendEmail({
    to,
    subject: 'Renew Admin password reset code',
    text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><h2 style="letter-spacing: 4px;">${code}</h2><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });
  console.log('Reset code email sent to:', to);
}

module.exports = { sendOtpEmail, sendResetEmail };