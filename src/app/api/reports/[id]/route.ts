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

    const mappedReport = {
      ...report,
      photos: (report.photos || []).map((p) => ({
        ...p,
        date: (p as any).date || p.sectionKey || undefined,
      })),
    };

    return NextResponse.json({ report: mappedReport });
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
      engineerSignedAt,
      customerName,
      customerDesignation,
      customerSignature,
      customerSignedAt,
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
      reportDate: reportDate ? new Date(reportDate) : (attendanceDate ? new Date(attendanceDate) : existingReport.reportDate),
      attendanceDate: attendanceDate ? new Date(attendanceDate) : (reportDate ? new Date(reportDate) : existingReport.attendanceDate),
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

    if (engineerSignature !== undefined) {
      updateData.engineerSignature = engineerSignature || null;
    }

    if (engineerSignedAt !== undefined) {
      updateData.engineerSignedAt = engineerSignedAt ? new Date(engineerSignedAt) : null;
    } else if (engineerSignature && engineerSignature !== existingReport.engineerSignature) {
      const defaultDate = attendanceDate || existingReport.attendanceDate || reportDate || existingReport.reportDate;
      updateData.engineerSignedAt = defaultDate ? new Date(defaultDate) : new Date();
    }

    if (customerSignature !== undefined) {
      updateData.customerSignature = customerSignature || null;
      if (customerSignature && !status && existingReport.status === 'DRAFT') {
        updateData.status = 'COMPLETED';
      }
    }

    if (customerSignedAt !== undefined) {
      updateData.customerSignedAt = customerSignedAt ? new Date(customerSignedAt) : null;
    } else if (customerSignature && customerSignature !== existingReport.customerSignature) {
      const defaultDate = attendanceDate || existingReport.attendanceDate || reportDate || existingReport.reportDate;
      updateData.customerSignedAt = defaultDate ? new Date(defaultDate) : new Date();
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
            sectionKey: p.date || p.sectionKey || null,
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

    const mappedUpdatedReport = {
      ...updatedReport,
      photos: (updatedReport.photos || []).map((p) => ({
        ...p,
        date: (p as any).date || p.sectionKey || undefined,
      })),
    };

    return NextResponse.json({ success: true, report: mappedUpdatedReport });
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
