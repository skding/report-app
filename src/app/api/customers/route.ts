import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        sites: {
          include: {
            equipment: true,
            defaultTemplate: {
              select: { id: true, title: true },
            },
          },
        },
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
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
    const { name, regNo, email, phone, address, contactPerson, sites } = body;

    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        regNo,
        email,
        phone,
        address,
        contactPerson,
        sites: sites && sites.length > 0 ? {
          create: sites.map((s: any) => ({
            name: s.name,
            address: s.address,
            contactPerson: s.contactPerson,
            contactPhone: s.contactPhone,
            contactEmail: s.contactEmail,
            defaultTemplateId: s.defaultTemplateId || null,
          })),
        } : undefined,
      },
      include: {
        sites: true,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
