import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'SERVICE';

    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = type === 'SERVICE' ? 'ESR' : type === 'SITE_WORK' ? 'DSR' : 'PMR';
    const yearPattern = `${prefix}-${currentYear}/`;

    const existingReports = await prisma.report.findMany({
      where: {
        reportNumber: {
          startsWith: yearPattern,
        },
      },
      select: {
        reportNumber: true,
      },
    });

    let maxSeq = 0;
    for (const r of existingReports) {
      const parts = r.reportNumber.split('/');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }

    const nextNumber = `${prefix}-${currentYear}/${(maxSeq + 1).toString().padStart(3, '0')}`;

    return NextResponse.json({ nextNumber, sequence: maxSeq + 1 });
  } catch (error: any) {
    console.error('Error calculating next report number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
