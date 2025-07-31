import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const salt = 10;

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (secret === null) return NextResponse.json(
    { error: 'JWT auth not configured' },
    { status: 500 }
  );

  const body = await req.json();
  if (!('email' in body) || !('password' in body)) return NextResponse.json(
    { error: 'Body missing \'email\' or \'password\' fields' }, 
    { status: 400 }
  );

  const user = await prisma.user.findUnique({
    where: { email: body.email }
  });
  if (user !== null) return NextResponse.json(
    { error: 'User with \'email\' field already exists' },
    { status: 400 }
  );

  const hashed = await bcrypt.hash(body.password, salt);
  const record = await prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
    }
  });

  const token = jwt.sign(record, secret!, { expiresIn: '1d' });

  return NextResponse.json(
    { token: token },
    { status: 201 }
  );
}
