const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function sendEmail({ to, subject, text, html, replyTo }) {
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

  const payload = {
    sender: { name: 'Renew Admin', email: process.env.GMAIL_USER },
    to: recipients,
    subject,
    textContent: text,
    htmlContent: html,
  };
  if (replyTo) payload.replyTo = { email: replyTo };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
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

async function sendNewMessageAlert(msg) {
  const recipients = (process.env.NOTIFY_EMAIL || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.log('NOTIFY_EMAIL is empty, alert skipped');
    return;
  }

  const name = msg.name || 'Someone';
  const replyTo = /^\S+@\S+\.\S+$/.test(msg.email || '') ? msg.email : undefined;

  await sendEmail({
    to: recipients,
    replyTo,
    subject: `New website message from ${name}`,
    text: `From: ${name}\nEmail: ${msg.email || 'not provided'}\n\n${msg.message || ''}\n\nOpen the admin panel to view and reply.`,
    html: `<p><b>From:</b> ${escapeHtml(name)}<br><b>Email:</b> ${escapeHtml(msg.email || 'not provided')}</p><p>${escapeHtml(msg.message || '').replace(/\n/g, '<br>')}</p><p><a href="https://renew-placenta.vercel.app/admin/messages">Open the admin panel to view and reply</a></p>`,
  });
  console.log('New message alert sent');
}

module.exports = { sendOtpEmail, sendResetEmail, sendNewMessageAlert };