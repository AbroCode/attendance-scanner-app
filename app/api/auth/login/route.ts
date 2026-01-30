import { NextRequest, NextResponse } from 'next/server';
import { comparePasswords } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Connect to your Supabase or database
    // For now, return success mock response
    // In production, you would:
    // 1. Find user by email
    // 2. Compare passwords using comparePasswords()
    // 3. Create session/JWT token
    // 4. Return user and token

    console.log('[v0] User login attempted:', { email });

    // Mock successful login
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: 'temp-id',
          email,
          role: 'teacher',
        },
      },
      { status: 200 }
    );

    // In production, set secure HTTP-only cookie with session token
    // response.cookies.set('session', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 30, // 30 days
    // });

    return response;
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
