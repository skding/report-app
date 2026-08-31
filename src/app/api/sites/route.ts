import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    const sites = await prisma.site.findMany({
      where: customerId ? { customerId } : undefined,
      include: {
        customer: { select: { id: true, name: true } },
        equipment: true,
        defaultTemplate: { select: { id: true, title: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ sites });
  } catch (error: any) {
    console.error('Error fetching sites:', error);
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
    const { customerId, name, address, contactPerson, contactPhone, contactEmail, defaultTemplateId, equipment } = body;

    if (!customerId || !name) {
      return NextResponse.json(
        { error: 'Customer ID and Site Name are required' },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        customerId,
        name,
        address,
        contactPerson,
        contactPhone,
        contactEmail,
        defaultTemplateId: defaultTemplateId || null,
        equipment: equipment && equipment.length > 0 ? {
          create: equipment.map((eq: any) => ({
            name: eq.name,
            tagNo: eq.tagNo,
            model: eq.model,
            serialNo: eq.serialNo,
            description: eq.description,
          })),
        } : undefined,
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json({ success: true, site });
  } catch (error: any) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
