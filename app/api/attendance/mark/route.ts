import { NextRequest, NextResponse } from 'next/server';

interface AttendanceRequest {
  faceImage?: string;
  studentId?: string;
  className?: string;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AttendanceRequest;
    const { faceImage, studentId, className, timestamp } = body;

    // Validate inputs
    if (!faceImage && !studentId) {
      return NextResponse.json(
        { message: 'Either face image or student ID is required' },
        { status: 400 }
      );
    }

    // Validate face image if provided
    if (faceImage && typeof faceImage !== 'string') {
      return NextResponse.json(
        { message: 'Invalid face image data' },
        { status: 400 }
      );
    }

    if (faceImage && !faceImage.startsWith('data:image/')) {
      return NextResponse.json(
        { message: 'Invalid image format' },
        { status: 400 }
      );
    }

    const attendanceId = `ATT-${Date.now()}`;
    const checkInTime = new Date(timestamp || Date.now()).toISOString();

    console.log('[v0] Attendance marked:', {
      attendanceId,
      studentId,
      className,
      checkInTime,
      hasImage: !!faceImage,
    });

    // TODO: DATABASE INTEGRATION
    // Uncomment when you have database set up:
    //
    // import { Pool } from 'pg';
    // const pool = new Pool({
    //   connectionString: process.env.DATABASE_URL,
    // });
    //
    // try {
    //   if (faceImage) {
    //     // Face-based attendance: Match face against students table
    //     // This requires face recognition model integration
    //     const result = await pool.query(
    //       `INSERT INTO attendance_logs (student_id, class_name, check_in_time, confidence_score)
    //        SELECT id, $1, $2, $3 FROM students WHERE student_id = ANY($4)
    //        RETURNING *`,
    //       [className, checkInTime, 0.95, [studentId]]
    //     );
    //   } else if (studentId) {
    //     // Direct ID-based attendance
    //     const result = await pool.query(
    //       `INSERT INTO attendance_logs (student_id, class_name, check_in_time, confidence_score)
    //        SELECT id, $1, $2, $3 FROM students WHERE student_id = $4
    //        RETURNING *`,
    //       [className, checkInTime, 0.95, studentId]
    //     );
    //   }
    // } finally {
    //   pool.end();
    // }

    return NextResponse.json(
      {
        message: 'Attendance marked successfully',
        attendanceId,
        checkInTime,
        studentId: studentId || 'face-recognition',
        className: className || 'unknown',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Mark attendance error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
