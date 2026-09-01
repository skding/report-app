import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        customer: true,
        equipment: true,
        defaultTemplate: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error: any) {
    console.error('Error fetching site:', error);
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
    const { name, address, contactPerson, contactPhone, contactEmail, defaultTemplateId } = body;

    const site = await prisma.site.update({
      where: { id },
      data: {
        name,
        address,
        contactPerson,
        contactPhone,
        contactEmail,
        defaultTemplateId: defaultTemplateId || null,
      },
      include: {
        equipment: true,
        defaultTemplate: true,
      },
    });

    return NextResponse.json({ success: true, site });
  } catch (error: any) {
    console.error('Error updating site:', error);
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

    // Disconnect reports or delete site
    await prisma.report.updateMany({
      where: { siteId: id },
      data: { siteId: null },
    });

    await prisma.site.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
