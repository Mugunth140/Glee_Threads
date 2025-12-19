import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM subscribes WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      );
    }

    await pool.execute(
      'INSERT INTO subscribes (email) VALUES (?)',
      [email]
    );

    return NextResponse.json(
      { message: 'Successfully subscribed' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
