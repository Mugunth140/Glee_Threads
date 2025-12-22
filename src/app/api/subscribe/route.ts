import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { whatsappNumber } = await request.json();

    // Basic validation for 10-digit number
    if (!whatsappNumber || !/^\d{10}$/.test(whatsappNumber)) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number. Please enter a 10-digit number.' },
        { status: 400 }
      );
    }

    // Check if number already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM subscribes WHERE whatsapp_number = ?',
      [whatsappNumber]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Number already subscribed' },
        { status: 200 }
      );
    }

    await pool.execute(
      'INSERT INTO subscribes (whatsapp_number) VALUES (?)',
      [whatsappNumber]
    );

    return NextResponse.json(
      { message: 'Successfully subscribed to WhatsApp updates!' },
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
