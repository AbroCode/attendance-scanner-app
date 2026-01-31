import { NextRequest, NextResponse } from 'next/server';

interface EnrollmentRequest {
  studentId: string;
  fullName: string;
  email?: string;
  className: string;
  faces: Array<{ dataUrl: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EnrollmentRequest;
    const { studentId, fullName, email, className, faces } = body;

    // Validate required fields
    if (!studentId || !studentId.trim()) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!className || !className.trim()) {
      return NextResponse.json(
        { message: 'Class name is required' },
        { status: 400 }
      );
    }

    if (!faces || !Array.isArray(faces) || faces.length === 0) {
      return NextResponse.json(
        { message: 'At least one face image is required' },
        { status: 400 }
      );
    }

    if (faces.length > 10) {
      return NextResponse.json(
        { message: 'Maximum 10 face images allowed' },
        { status: 400 }
      );
    }

    // Validate face data
    for (let i = 0; i < faces.length; i++) {
      if (!faces[i].dataUrl || typeof faces[i].dataUrl !== 'string') {
        return NextResponse.json(
          { message: `Face ${i + 1}: Invalid image data` },
          { status: 400 }
        );
      }

      if (!faces[i].dataUrl.startsWith('data:image/')) {
        return NextResponse.json(
          { message: `Face ${i + 1}: Invalid image format` },
          { status: 400 }
        );
      }
    }

    console.log('[v0] Enrollment request:', {
      studentId,
      fullName,
      className,
      email,
      faceCount: faces.length,
      timestamp: new Date().toISOString(),
    });

    // TODO: DATABASE INTEGRATION
    // Uncomment and configure when you have a database set up:
    //
    // import { Pool } from 'pg';
    // const pool = new Pool({
    //   connectionString: process.env.DATABASE_URL,
    // });
    //
    // try {
    //   const studentResult = await pool.query(
    //     'INSERT INTO students (student_id, full_name, email, class_name) VALUES ($1, $2, $3, $4) RETURNING id',
    //     [studentId, fullName, email || null, className]
    //   );
    //
    //   const studentDbId = studentResult.rows[0].id;
    //
    //   // Store face images
    //   for (const face of faces) {
    //     await pool.query(
    //       'INSERT INTO face_embeddings (student_id, embedding, descriptor) VALUES ($1, $2, $3)',
    //       [studentDbId, face.dataUrl, JSON.stringify({ timestamp: Date.now() })]
    //     );
    //   }
    // } finally {
    //   pool.end();
    // }

    // Return success response
    const enrollmentId = `ENR-${Date.now()}`;
    console.log('[v0] Enrollment successful:', {
      enrollmentId,
      studentId,
      faceCount: faces.length,
    });

    return NextResponse.json(
      {
        message: 'Student enrolled successfully',
        enrollmentId,
        student: {
          id: enrollmentId,
          studentId,
          fullName,
          email: email || null,
          className,
          faceCount: faces.length,
          enrolledAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Enrollment error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error during enrollment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
