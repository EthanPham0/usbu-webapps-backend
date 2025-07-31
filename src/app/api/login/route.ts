import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (secret === null) return NextResponse.json(
    { error: 'JWT auth not configured' },
    { status: 500 }
  );

  const body = await req.json();

  const authHeader = req.headers.get('Authorization');
  if (authHeader !== null && authHeader.startsWith('Bearer '))
  {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, secret!);
      return NextResponse.json(
        { token: token },
        { status: 200 }
      );
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  if (!('email' in body) || !('password' in body)) return NextResponse.json(
    { error: 'Body missing \'email\' or \'password\' fields' },
    { status: 400 }
  );

  const user = await prisma.user.findUnique({
    where: { email: body.email }
  });
  if (user === null) return NextResponse.json(
    { error: 'User not found' },
    { status: 400 }
  );

  const match = await bcrypt.compare(body.password, user.password);
  if (!match) return NextResponse.json(
    { error: 'Incorrect password' },
    { status: 400 }
  );

  const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
  return NextResponse.json(
    { token: token },
    { status: 200 }
  );
}
