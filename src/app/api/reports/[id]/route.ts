import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        customer: true,
        site: {
          include: {
            equipment: true,
          },
        },
        author: {
          select: { id: true, name: true, username: true, email: true },
        },
        photos: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const {
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

    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      customerId: customerId !== undefined ? customerId : existingReport.customerId,
      siteId: siteId !== undefined ? siteId : existingReport.siteId,
      title: title !== undefined ? title : existingReport.title,
      projectCode: projectCode !== undefined ? projectCode : existingReport.projectCode,
      reportDate: reportDate ? new Date(reportDate) : existingReport.reportDate,
      attendanceDate: attendanceDate ? new Date(attendanceDate) : existingReport.attendanceDate,
      startTime: startTime !== undefined ? startTime : existingReport.startTime,
      endTime: endTime !== undefined ? endTime : existingReport.endTime,
      normalHours: normalHours !== undefined ? (normalHours ? parseFloat(normalHours) : null) : existingReport.normalHours,
      otHours: otHours !== undefined ? (otHours ? parseFloat(otHours) : null) : existingReport.otHours,
      data: data !== undefined ? data : existingReport.data,
      status: status || existingReport.status,
      engineerName: engineerName !== undefined ? engineerName : existingReport.engineerName,
      customerName: customerName !== undefined ? customerName : existingReport.customerName,
      customerDesignation: customerDesignation !== undefined ? customerDesignation : existingReport.customerDesignation,
    };

    if (engineerSignature && engineerSignature !== existingReport.engineerSignature) {
      updateData.engineerSignature = engineerSignature;
      updateData.engineerSignedAt = new Date();
    }

    if (customerSignature && customerSignature !== existingReport.customerSignature) {
      updateData.customerSignature = customerSignature;
      updateData.customerSignedAt = new Date();
      if (!status) {
        updateData.status = 'COMPLETED';
      }
    }

    // Update photos if provided
    if (photos && Array.isArray(photos)) {
      await prisma.reportPhoto.deleteMany({ where: { reportId: id } });
      if (photos.length > 0) {
        await prisma.reportPhoto.createMany({
          data: photos.map((p: any) => ({
            reportId: id,
            url: p.url,
            caption: p.caption || '',
            sectionKey: p.sectionKey || null,
          })),
        });
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        site: true,
        author: true,
        photos: true,
      },
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
