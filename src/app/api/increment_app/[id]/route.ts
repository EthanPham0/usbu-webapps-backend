import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { validateToken } from '@/middleware/authValidation';
import { MissingJWTSecretError, InvalidTokenError } from '@/types/AuthErrors';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appId = parseInt(id);

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
