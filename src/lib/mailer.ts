import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

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
  const resetUrl = `${APP_URL}/reset-password?code=${code}`;

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
  const verifyUrl = `${APP_URL}/register/verify?code=${code}`;

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

// Default templates used as fallback when no custom template exists
const DEFAULT_TEMPLATES: Record<string, { subject: string; bodyHtml: string }> = {
  welcome: {
    subject: 'Selamat Datang, {{name}}!',
    bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Assalamualaikum {{name}},</h2>
      <p>Selamat datang di {{agency}}. Kami senang Anda bergabung untuk perjalanan umrah bersama kami.</p>
      <p>Tim kami akan menghubungi Anda untuk informasi lebih lanjut.</p>
      <p>Jazakallahu khairan,<br/>{{agency}}</p>
    </div>`,
  },
  payment_reminder: {
    subject: 'Pengingat Pembayaran - {{agency}}',
    bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Assalamualaikum {{name}},</h2>
      <p>Ini adalah pengingat bahwa Anda memiliki pembayaran yang belum diselesaikan.</p>
      <p>Mohon segera lakukan pembayaran sebelum tanggal {{date}}.</p>
      <p>Jazakallahu khairan,<br/>{{agency}}</p>
    </div>`,
  },
  departure_reminder: {
    subject: 'Pengingat Keberangkatan - {{date}}',
    bodyHtml: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Assalamualaikum {{name}},</h2>
      <p>Keberangkatan umrah Anda dijadwalkan pada tanggal {{date}}.</p>
      <p>Pastikan semua dokumen Anda sudah lengkap dan siap.</p>
      <p>Jazakallahu khairan,<br/>{{agency}}</p>
    </div>`,
  },
};

function interpolateVars(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

export async function sendTemplatedEmail(
  agencyId: string,
  event: string,
  to: string,
  vars: Record<string, string>
) {
  // Lookup custom template from database
  let subject: string;
  let bodyHtml: string;

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: {
        event_agencyId: {
          event,
          agencyId,
        },
      },
    });

    if (template && template.isActive) {
      subject = template.subject;
      bodyHtml = template.bodyHtml;
    } else {
      // Fallback to default template
      const defaultTemplate = DEFAULT_TEMPLATES[event];
      if (!defaultTemplate) {
        throw new Error(`No default template for event: ${event}`);
      }
      subject = defaultTemplate.subject;
      bodyHtml = defaultTemplate.bodyHtml;
    }
  } catch {
    // If DB lookup fails, use default
    const defaultTemplate = DEFAULT_TEMPLATES[event];
    if (!defaultTemplate) {
      throw new Error(`No template found for event: ${event}`);
    }
    subject = defaultTemplate.subject;
    bodyHtml = defaultTemplate.bodyHtml;
  }

  // Interpolate variables
  const finalSubject = interpolateVars(subject, vars);
  const finalBody = interpolateVars(bodyHtml, vars);

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to,
    subject: finalSubject,
    html: finalBody,
  });
}
