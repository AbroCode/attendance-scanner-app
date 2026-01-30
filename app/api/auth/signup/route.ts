import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, role } = await request.json();

    // Validate input
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // TODO: Connect to your Supabase or database
    // For now, return success mock response
    // In production, you would:
    // 1. Check if email already exists
    // 2. Insert user into database
    // 3. Return user ID and session token

    console.log('[v0] User signup attempted:', { email, fullName, role });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: 'temp-id',
          email,
          fullName,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
