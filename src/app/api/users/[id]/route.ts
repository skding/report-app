import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, username, email, role, phone, active, password } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check username uniqueness if changed
    if (username && username.toLowerCase().trim() !== existingUser.username) {
      const duplicateUsername = await prisma.user.findUnique({
        where: { username: username.toLowerCase().trim() },
      });
      if (duplicateUsername) {
        return NextResponse.json(
          { error: 'Username is already taken by another user' },
          { status: 400 }
        );
      }
    }

    // Check email uniqueness if changed
    if (email && email.toLowerCase().trim() !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email is already registered by another user' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      name: name !== undefined ? name : existingUser.name,
      username: username ? username.toLowerCase().trim() : existingUser.username,
      email: email ? email.toLowerCase().trim() : existingUser.email,
      role: role !== undefined ? role : existingUser.role,
      phone: phone !== undefined ? phone : existingUser.phone,
      active: active !== undefined ? active : existingUser.active,
    };

    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        signatureData: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if user has authored reports
    const reportCount = await prisma.report.count({
      where: { authorId: id },
    });

    if (reportCount > 0) {
      // Disconnect author from reports or disable user
      await prisma.report.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
