import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    interface TokenPayload { userId: number; email: string; name?: string; role?: string }
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ valid: false, error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ 
      valid: true, 
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name, // Assuming name is in token, if not it might be undefined
        role: decoded.role
      } 
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 });
  }
}
