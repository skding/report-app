import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { signatureData } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { signatureData: signatureData || null },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        signatureData: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Save signature error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
