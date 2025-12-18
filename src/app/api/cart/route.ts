import { NextResponse } from 'next/server';

// Cart storage is client-side only (anonymous cart in localStorage).
// Server-side cart API has been disabled to avoid storing end-user carts in the database.
export function GET() {
  return NextResponse.json({ error: 'Cart API disabled. Use client-side anonymous cart.' }, { status: 410 });
}

export function POST() {
  return NextResponse.json({ error: 'Cart API disabled. Use client-side anonymous cart.' }, { status: 410 });
}

export function DELETE() {
  return NextResponse.json({ error: 'Cart API disabled. Use client-side anonymous cart.' }, { status: 410 });
}
