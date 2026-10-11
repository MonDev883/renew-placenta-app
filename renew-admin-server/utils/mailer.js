async function sendOtpEmail(to, code) {
  try {
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
        subject: 'Your Renew Admin login code',
        textContent: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        htmlContent: `<p>Your verification code is:</p><h2 style="letter-spacing: 4px;">${code}</h2><p>This code expires in 10 minutes.</p>`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Brevo ${res.status}: ${await res.text()}`);
    }

    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
}

module.exports = { sendOtpEmail };