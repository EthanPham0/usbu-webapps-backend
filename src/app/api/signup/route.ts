import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const salt = 10;

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!('email' in body) || !('password' in body))
    return NextResponse.json(
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

  return NextResponse.json(record, { status: 201 });
}
