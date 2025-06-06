const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(to, token) {
  const resetLink = `https://vigyaana-frontend.vercel.app/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'Vigyana <onboarding@resend.dev>',
    to,
    subject: 'Reset Your Vigyana Password',
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p style="color: gray; font-size: 12px;">This link is valid for 1 hour. If you didn’t request a password reset, you can safely ignore this email.</p>
    `,
  });
}

module.exports = sendResetEmail;
