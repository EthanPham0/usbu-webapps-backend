import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { Payload } from '@/types/payload';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const appId = parseInt(id);

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

  try {
    const record = await prisma.frequency.upsert({
      where: {
        userEmail_appId: {
          userEmail: decoded.email,
          appId: appId,
        },
      },
      update: {
        frequency: { increment: 1 }
      },
      create: {
        userEmail: decoded.email,
        appId: appId,
      },
    });

    return NextResponse.json(
      record,
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Record not found for (${decoded.email}, ${appId})` },
      { status: 404 }
    );
  }
}
