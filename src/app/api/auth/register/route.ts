
import { NextResponse } from 'next/server';

// End-user registration has been removed. Return 410 Gone for all methods.
export function GET() {
  return NextResponse.json(
    { error: 'Registration disabled. End-user registration is no longer supported.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Registration disabled. End-user registration is no longer supported.' },
    { status: 410 }
  );
}

export function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
