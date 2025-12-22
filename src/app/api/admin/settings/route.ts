import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

type RawSettings = Record<string, string | undefined>;

type AdminSettings = {
  shipping_fee: number;
  free_shipping_threshold: number;
  gst_percentage: number;
  gst_enabled: boolean;
} & Record<string, string | number | boolean>;

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM store_settings');
    const raw: Record<string, string> = {};
    rows.forEach(row => {
      raw[row.setting_key] = row.setting_value;
    });

    // Provide typed settings for admin UI convenience
    const settingsBase: RawSettings = { ...raw };
    const settings: AdminSettings = {
      ...settingsBase,
      shipping_fee: settingsBase.shipping_fee ? Number(settingsBase.shipping_fee) : 99,
      free_shipping_threshold: settingsBase.free_shipping_threshold ? Number(settingsBase.free_shipping_threshold) : 999,
      gst_percentage: settingsBase.gst_percentage ? Number(settingsBase.gst_percentage) : 18,
      gst_enabled: (typeof settingsBase.gst_enabled !== 'undefined') ? (settingsBase.gst_enabled === '1' || settingsBase.gst_enabled === 'true') : true,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json(); // Expected: { gst_percentage: '18', ... }

    const entries = Object.entries(body);
    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(value)]
      );
    }

    // Return updated typed settings so client can refresh confidently
    const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM store_settings');
    const raw: Record<string, string> = {};
    rows.forEach(row => { raw[row.setting_key] = row.setting_value; });
    const settingsBase: RawSettings = { ...raw };
    const settings: AdminSettings = {
      ...settingsBase,
      shipping_fee: settingsBase.shipping_fee ? Number(settingsBase.shipping_fee) : 99,
      free_shipping_threshold: settingsBase.free_shipping_threshold ? Number(settingsBase.free_shipping_threshold) : 999,
      gst_percentage: settingsBase.gst_percentage ? Number(settingsBase.gst_percentage) : 18,
      gst_enabled: (typeof settingsBase.gst_enabled !== 'undefined') ? (settingsBase.gst_enabled === '1' || settingsBase.gst_enabled === 'true') : true,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}