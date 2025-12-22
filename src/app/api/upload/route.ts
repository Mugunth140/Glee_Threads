import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || `upload-${Date.now()}.png`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Blob Token' },
      { status: 500 }
    );
  }

  if (!request.body) {
    return NextResponse.json({ error: 'File body missing' }, { status: 400 });
  }

  try {
    const blob = await put(`images/${filename}`, request.body, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading to Blob:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
