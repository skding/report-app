import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          id: 'default',
          companyName: 'Clover Digital Sdn Bhd',
          companyReg: '201501034912',
          companyAddr: '7A Jalan PP2/1, Taman Putra Prima, 47100 Puchong, Selangor',
          companyEmail: 'admin@cloverdigital.com.my',
          companyWeb: 'www.cloverdigital.com.my',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpSecure: false,
          smtpUser: '',
          smtpPass: '',
          smtpFromEmail: 'reports@cloverdigital.com.my',
          smtpFromName: 'Clover Digital Service Dispatch',
        },
      });
    }

    return NextResponse.json({
      setting: {
        ...setting,
        // Mask password for safety on GET
        smtpPass: setting.smtpPass ? '••••••••' : '',
      },
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      companyName,
      companyReg,
      companyAddr,
      companyEmail,
      companyWeb,
      companyPhone,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFromEmail,
      smtpFromName,
    } = body;

    const updateData: any = {
      companyName,
      companyReg,
      companyAddr,
      companyEmail,
      companyWeb,
      companyPhone,
      smtpHost,
      smtpPort: smtpPort ? parseInt(smtpPort) : 587,
      smtpSecure: !!smtpSecure,
      smtpUser,
      smtpFromEmail,
      smtpFromName,
    };

    // Only update pass if not masked
    if (smtpPass && smtpPass !== '••••••••') {
      updateData.smtpPass = smtpPass;
    }

    const setting = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...updateData,
        smtpPass: smtpPass || '',
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      setting: {
        ...setting,
        smtpPass: setting.smtpPass ? '••••••••' : '',
      },
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
