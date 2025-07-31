import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { Payload } from '@/types/payload';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (secret === null) return NextResponse.json(
    { error: 'JWT auth not configured' },
    { status: 500 }
  );

  const authHeader = req.headers.get('Authorization');
  console.log(authHeader);
  if (authHeader === null || !authHeader.startsWith('Bearer ')) return NextResponse.json(
    { error: 'Invalid token' },
    { status: 401 }
  );

  const token = authHeader.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, secret!) as Payload;
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  const mostFrequent = await prisma.frequency.findMany({
    where: { userEmail: decoded.email },
    select: {
      frequency: true,
      app: true,
    },
    orderBy: { frequency: 'desc' },
    take: 5,
  });

  return mostFrequent.length > 0
    ? NextResponse.json(
      mostFrequent,
      { status: 200 }
    )
    : NextResponse.json(
      { error: 'No data found' },
      { status: 404 }
    );
}
