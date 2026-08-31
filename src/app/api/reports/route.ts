import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Helper to generate sequential report number
async function generateReportNumber(type: string): Promise<string> {
  const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"
  const prefix = type === 'SERVICE' ? 'ESR' : type === 'SITE_WORK' ? 'DSR' : 'PMR';
  
  // Count existing reports for this year and type
  const count = await prisma.report.count({
    where: {
      type: type as any,
      reportNumber: {
        startsWith: `${prefix}-${currentYear}/`,
      },
    },
  });

  const nextSeq = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${currentYear}/${nextSeq}`;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { reportNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { projectCode: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { site: { name: { contains: search, mode: 'insensitive' } } },
        { engineerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        site: { select: { id: true, name: true, address: true } },
        author: { select: { id: true, name: true, username: true } },
        photos: { select: { id: true, url: true, caption: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      customerId,
      siteId,
      title,
      projectCode,
      reportDate,
      attendanceDate,
      startTime,
      endTime,
      normalHours,
      otHours,
      data,
      photos,
      engineerName,
      engineerSignature,
      customerName,
      customerDesignation,
      customerSignature,
      status,
    } = body;

    if (!type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    const reportNumber = await generateReportNumber(type);

    const report = await prisma.report.create({
      data: {
        reportNumber,
        type,
        status: status || 'DRAFT',
        customerId: customerId || null,
        siteId: siteId || null,
        authorId: user.id,
        title: title || `${type === 'SERVICE' ? 'Service' : type === 'SITE_WORK' ? 'Site Work' : 'Maintenance'} Report`,
        projectCode,
        reportDate: reportDate ? new Date(reportDate) : new Date(),
        attendanceDate: attendanceDate ? new Date(attendanceDate) : new Date(),
        startTime,
        endTime,
        normalHours: normalHours ? parseFloat(normalHours) : null,
        otHours: otHours ? parseFloat(otHours) : null,
        data: data || {},
        engineerName: engineerName || user.name,
        engineerSignature: engineerSignature || user.signatureData || null,
        engineerSignedAt: engineerSignature ? new Date() : null,
        customerName,
        customerDesignation,
        customerSignature,
        customerSignedAt: customerSignature ? new Date() : null,
        photos: photos && photos.length > 0 ? {
          create: photos.map((p: any) => ({
            url: p.url,
            caption: p.caption || '',
            sectionKey: p.sectionKey || null,
          })),
        } : undefined,
      },
      include: {
        customer: true,
        site: true,
        author: true,
        photos: true,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
