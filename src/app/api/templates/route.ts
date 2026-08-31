import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.checklistTemplate.findMany({
      include: {
        _count: {
          select: { sites: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
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
    const { title, category, description, isDefault, sections } = body;

    if (!title || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Title and sections array are required' },
        { status: 400 }
      );
    }

    if (isDefault) {
      // Unset previous defaults if this is marked default
      await prisma.checklistTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        title,
        category: category || 'General Maintenance',
        description,
        isDefault: !!isDefault,
        sections: sections,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
