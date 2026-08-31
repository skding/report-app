import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { recipientEmail, subject, customMessage, pdfBase64 } = await req.json();

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        customer: true,
        site: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    const companyName = setting?.companyName || 'Clover Digital Sdn Bhd';
    const emailSubject = subject || `[${report.reportNumber}] ${companyName} - ${report.title || 'Service Report'}`;

    const reportTypeLabel =
      report.type === 'SERVICE'
        ? "Engineer's Service Report"
        : report.type === 'SITE_WORK'
        ? 'Daily Site / Remote Technical Support Report'
        : 'Preventive Maintenance Report';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${companyName}</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">${reportTypeLabel}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dear ${report.customerName || report.customer?.contactPerson || 'Customer'},</p>
          
          <p>${customMessage || `Please find attached the official <strong>${reportTypeLabel} (${report.reportNumber})</strong> for site work performed on ${new Date(report.reportDate).toLocaleDateString('en-GB')}.`}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Report No:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${report.reportNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Customer:</strong></td>
              <td style="padding: 8px 0; color: #0f172a;">${report.customer?.name || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Site Location:</strong></td>
              <td style="padding: 8px 0; color: #0f172a;">${report.site?.name || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Attended By:</strong></td>
              <td style="padding: 8px 0; color: #0f172a;">${report.engineerName || user.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">${report.status}</td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you have any questions or require further assistance, please contact us at <a href="mailto:${setting?.companyEmail || 'admin@cloverdigital.com.my'}" style="color: #0284c7;">${setting?.companyEmail || 'admin@cloverdigital.com.my'}</a>.
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            ${setting?.companyAddr || '7A Jalan PP2/1, Taman Putra Prima, 47100 Puchong, Selangor'} | ${setting?.companyWeb || 'www.cloverdigital.com.my'}
          </p>
        </div>
      </div>
    `;

    const attachments: any[] = [];
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      attachments.push({
        filename: `${report.reportNumber.replace(/[\/\\]/g, '_')}_${report.type}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf',
      });
    }

    await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: htmlBody,
      attachments,
    });

    // Update report status to EMAILED
    await prisma.report.update({
      where: { id },
      data: {
        status: 'EMAILED',
        emailedTo: recipientEmail,
        emailedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Report successfully dispatched to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error('Error sending report email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
