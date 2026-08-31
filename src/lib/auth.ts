import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';
import { UserRole, UserSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'clover_digital_service_reports_secure_key_2026';
const COOKIE_NAME = 'clover_auth_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyJwtToken<{ userId: string }>(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        signatureData: true,
        active: true,
      },
    });

    if (!user || !user.active) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      signatureData: user.signatureData,
    };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export { COOKIE_NAME };
