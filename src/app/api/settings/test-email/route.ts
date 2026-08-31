import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { testSmtpConnection, sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { testEmail, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = await req.json();

    let customConfig: any = undefined;
    if (smtpHost && smtpUser) {
      let finalPass = smtpPass;
      if (smtpPass === '••••••••') {
        const existing = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
        finalPass = existing?.smtpPass || '';
      }
      customConfig = {
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: !!smtpSecure,
        user: smtpUser,
        pass: finalPass,
      };
    }

    // 1. Verify SMTP connection
    await testSmtpConnection(customConfig);

    // 2. If testEmail provided, send an actual test email
    if (testEmail) {
      await sendEmail({
        to: testEmail,
        subject: 'Clover Digital - SMTP Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #16a34a;">SMTP Configuration Successful!</h2>
            <p>This is a test email sent from your <strong>Clover Digital Service Report System</strong>.</p>
            <p>Your SMTP mail transport is operational and ready to dispatch service reports to clients.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: testEmail
        ? `SMTP verified & test email sent to ${testEmail}`
        : 'SMTP connection verified successfully!',
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error.message || 'SMTP connection failed' },
      { status: 400 }
    );
  }
}
