import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gezma.com';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'GEZMA Agent';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendResetPasswordEmail(to: string, code: string) {
  const resetUrl = `${APP_URL}/verify/${code}?type=reset`;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to,
    subject: `Reset Password - ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Reset Password</h2>
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <p>Klik tombol di bawah untuk reset password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">Link ini berlaku selama 1 jam.</p>
        <p style="color: #666; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${APP_NAME}</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, code: string) {
  const verifyUrl = `${APP_URL}/verify/${code}`;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to,
    subject: `Verifikasi Email - ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Verifikasi Email</h2>
        <p>Terima kasih telah mendaftar di ${APP_NAME}.</p>
        <p>Klik tombol di bawah untuk verifikasi email Anda:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verifikasi Email
        </a>
        <p style="color: #666; font-size: 14px;">Link ini berlaku selama 24 jam.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${APP_NAME}</p>
      </div>
    `,
  });
}
