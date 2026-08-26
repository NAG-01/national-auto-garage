import nodemailer from 'nodemailer';

/**
 * Creates SMTP transporter if env credentials exist, else uses ethereal/mock fallback
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback logger transporter for development/testing
  return {
    sendMail: async (options) => {
      console.log(`====================================================`);
      console.log(`  [GMAIL SMTP ENGINE] MOCK EMAIL SENT`);
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  (Configure SMTP_USER & SMTP_PASS in .env to send real Gmail emails)`);
      console.log(`====================================================`);
      return { messageId: 'mock-mail-id-' + Date.now() };
    },
  };
}

export async function sendEmailConfirmationLink({ toEmail, magicLink, token }) {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 16px;">
      <div style="background-color: #0284C7; padding: 24px; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">NATIONAL AUTO GARAGE</h1>
        <p style="color: #e0f2fe; margin: 4px 0 0 0; font-size: 12px; font-weight: 600;">Admin Account Email Verification</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #0f172a; font-size: 16px; font-weight: 800; margin-top: 0;">Confirm Your New Email Address</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          You requested to change your National Auto Garage admin username & email to <strong>${toEmail}</strong>.
        </p>

        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Please click the button below to confirm and activate your new email address. This link is valid for <strong>1 hour</strong>.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLink}" target="_blank" style="background-color: #0284C7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
            Confirm & Activate New Email
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Or copy and paste this verification link into your browser:<br/>
          <a href="${magicLink}" style="color: #0284C7; word-break: break-all;">${magicLink}</a>
        </p>

        <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center;">
          If you did not request this change, please ignore this email.
        </div>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"National Auto Garage Security" <${process.env.SMTP_USER || 'no-reply@nationalautogarage.com'}>`,
    to: toEmail,
    subject: 'Confirm your National Auto Garage Admin Email Change',
    html: htmlContent,
  });

  return info;
}
