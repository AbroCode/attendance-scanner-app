import { NextRequest, NextResponse } from 'next/server';

interface LogsQuery {
  date?: string;
  className?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') as string | null;
    const className = searchParams.get('className') as string | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    console.log('[v0] Fetching attendance logs:', {
      date,
      className,
      limit,
      timestamp: new Date().toISOString(),
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
    //   let query = `
    //     SELECT 
    //       al.id,
    //       s.student_id,
    //       s.full_name as student_name,
    //       s.class_name,
    //       al.check_in_time,
    //       al.confidence_score
    //     FROM attendance_logs al
    //     JOIN students s ON al.student_id = s.id
    //     WHERE 1=1
    //   `;
    //   const params = [];
    //   let paramCount = 1;
    //
    //   if (date) {
    //     const startDate = new Date(date);
    //     const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    //     query += ` AND al.check_in_time >= $${paramCount++} AND al.check_in_time < $${paramCount++}`;
    //     params.push(startDate, endDate);
    //   }
    //
    //   if (className) {
    //     query += ` AND s.class_name = $${paramCount++}`;
    //     params.push(className);
    //   }
    //
    //   query += ` ORDER BY al.check_in_time DESC LIMIT $${paramCount++}`;
    //   params.push(limit);
    //
    //   const result = await pool.query(query, params);
    //   logs = result.rows;
    // } finally {
    //   pool.end();
    // }

    // Mock data for development
    const mockLogs = [
      {
        id: '1',
        studentId: 'STU-2024-001',
        studentName: 'John Doe',
        className: '10-A',
        checkInTime: new Date().toISOString(),
        confidenceScore: 0.95,
      },
      {
        id: '2',
        studentId: 'STU-2024-002',
        studentName: 'Jane Smith',
        className: '10-A',
        checkInTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        confidenceScore: 0.92,
      },
      {
        id: '3',
        studentId: 'STU-2024-003',
        studentName: 'Mike Johnson',
        className: '10-B',
        checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        confidenceScore: 0.88,
      },
    ];

    return NextResponse.json(
      {
        logs: mockLogs.slice(0, limit),
        total: mockLogs.length,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Fetch logs error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
