import nodemailer from 'nodemailer';
import prisma from './prisma';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    encoding?: string;
  }>;
}

export async function getSmtpConfig() {
  const setting = await prisma.systemSetting.findUnique({
    where: { id: 'default' },
  });

  return {
    host: setting?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: setting?.smtpPort || Number(process.env.SMTP_PORT) || 587,
    secure: setting?.smtpSecure || false,
    auth: {
      user: setting?.smtpUser || process.env.SMTP_USER || '',
      pass: setting?.smtpPass || process.env.SMTP_PASS || '',
    },
    fromEmail: setting?.smtpFromEmail || process.env.SMTP_FROM_EMAIL || 'reports@cloverdigital.com.my',
    fromName: setting?.smtpFromName || process.env.SMTP_FROM_NAME || 'Clover Digital Service Dispatch',
  };
}

export async function sendEmail(options: SendEmailOptions) {
  const config = await getSmtpConfig();

  if (!config.auth.user || !config.auth.pass) {
    throw new Error('SMTP credentials are not configured. Please configure SMTP in System Settings.');
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export async function testSmtpConnection(customConfig?: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}) {
  const config = customConfig || (await getSmtpConfig());
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: (config as any).auth?.user || (config as any).user,
      pass: (config as any).auth?.pass || (config as any).pass,
    },
  });

  await transporter.verify();
  return { success: true, message: 'SMTP connection verified successfully!' };
}
