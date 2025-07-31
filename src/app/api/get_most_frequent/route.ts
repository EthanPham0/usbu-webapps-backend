import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { validateToken } from '@/middleware/authValidation';
import { MissingJWTSecretError, InvalidTokenError } from '@/types/AuthErrors';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  let decoded;
    try {
      decoded = validateToken(req);
    } catch (err) {
      if (err instanceof MissingJWTSecretError) return NextResponse.json(
        { error: 'JWT auth not set up' },
        { status: 500 }
      );
      else if (err instanceof InvalidTokenError) return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
      else return NextResponse.json(
        { error: 'Unexpected error occured' },
        { status: 500 }
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
