# FaceAttend Enrollment System - Complete Setup Guide

## Overview
This document explains how the enrollment system works and how to integrate it with your database.

## System Components

### 1. Frontend - Enrollment Page (`/app/dashboard/enroll/page.tsx`)

**Flow:**
1. User fills in student information (Student ID, Full Name, Email, Class Name)
2. User clicks "Start Face Capture" to open the camera
3. User captures 1-10 face images from different angles
4. User clicks "Complete Enrollment" to submit

**Form Fields:**
- `studentId` (Required) - Unique identifier for the student
- `fullName` (Required) - Student's full name
- `email` (Optional) - Student's email address
- `className` (Required) - Class/section name (e.g., "10-A")

**Face Capture:**
- Minimum 1 face required
- Maximum 10 faces allowed
- Faces are captured as JPEG base64 data URLs
- Each capture includes timestamp metadata

### 2. API Endpoint - Student Enrollment (`/app/api/students/enroll/route.ts`)

**Endpoint:** `POST /api/students/enroll`

**Input:**
```json
{
  "studentId": "STU-2024-001",
  "fullName": "John Doe",
  "email": "john@school.edu",
  "className": "10-A",
  "faces": [
    { "dataUrl": "data:image/jpeg;base64,..." },
    { "dataUrl": "data:image/jpeg;base64,..." }
  ]
}
```

**Output (Success):**
```json
{
  "message": "Student enrolled successfully",
  "enrollmentId": "ENR-1234567890",
  "student": {
    "id": "ENR-1234567890",
    "studentId": "STU-2024-001",
    "fullName": "John Doe",
    "email": "john@school.edu",
    "className": "10-A",
    "faceCount": 2,
    "enrolledAt": "2024-01-31T12:00:00.000Z"
  }
}
```

## Database Integration

### Step 1: Set Up PostgreSQL Database

Execute the SQL schema from `/scripts/setup-db.sql`:

```bash
psql -h your-host -U your-user -d your-database -f scripts/setup-db.sql
```

This creates:
- `users` table - Teacher/admin accounts
- `students` table - Student master data
- `face_embeddings` table - Stored face data
- `attendance_logs` table - Attendance records

### Step 2: Configure Environment Variables

Add these to your `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/faceattend
```

### Step 3: Implement Database Connection

Update `/app/api/students/enroll/route.ts` with your database client:

**Example using node-postgres (pg):**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Inside the POST handler:
try {
  // 1. Create student record
  const studentResult = await pool.query(
    `INSERT INTO students (student_id, full_name, email, class_name) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id`,
    [studentId, fullName, email || null, className]
  );

  const studentDbId = studentResult.rows[0].id;

  // 2. Store face images
  for (const face of faces) {
    await pool.query(
      `INSERT INTO face_embeddings (student_id, embedding, descriptor) 
       VALUES ($1, $2, $3)`,
      [studentDbId, face.dataUrl, JSON.stringify({ timestamp: Date.now() })]
    );
  }

  // Return success
  return NextResponse.json({ ... }, { status: 201 });
} finally {
  pool.end();
}
```

## Validation & Error Handling

### Frontend Validation
- ✅ All required fields must be filled
- ✅ At least 1 face image required
- ✅ Maximum 10 face images
- ✅ Valid email format (optional field)

### API Validation
- ✅ All required fields present
- ✅ Student ID uniqueness (enforce in database)
- ✅ Valid base64 image data
- ✅ Image format verification (JPEG)
- ✅ Face count limits (1-10)

### Error Responses

| Error | Status | Message |
|-------|--------|---------|
| Missing Student ID | 400 | "Student ID is required" |
| Missing Full Name | 400 | "Full name is required" |
| Missing Class Name | 400 | "Class name is required" |
| No Face Images | 400 | "At least one face image is required" |
| Too Many Faces | 400 | "Maximum 10 face images allowed" |
| Invalid Image Format | 400 | "Face X: Invalid image format" |
| Server Error | 500 | "Internal server error during enrollment" |

## Complete Flow

```
User fills form
    ↓
User captures 1-10 faces
    ↓
User clicks "Complete Enrollment"
    ↓
Frontend validates all inputs
    ↓
API request to POST /api/students/enroll
    ↓
Backend validates input again
    ↓
Insert student into database
    ↓
Insert each face into face_embeddings table
    ↓
Return success response
    ↓
Redirect to dashboard
```

## Testing the Enrollment

### 1. Manual Testing

1. Navigate to `/dashboard/enroll`
2. Fill in form:
   - Student ID: `STU-TEST-001`
   - Full Name: `Test Student`
   - Class Name: `10-A`
3. Click "Start Face Capture"
4. Capture 3-5 face images
5. Click "Complete Enrollment"
6. Check browser console for logs
7. Should redirect to dashboard

### 2. API Testing with cURL

```bash
curl -X POST http://localhost:3000/api/students/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU-2024-001",
    "fullName": "John Doe",
    "email": "john@school.edu",
    "className": "10-A",
    "faces": [
      { "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." }
    ]
  }'
```

## Attendance Marking Integration

Once students are enrolled, you can mark attendance via:

**Endpoint:** `POST /api/attendance/mark`

```json
{
  "faceImage": "data:image/jpeg;base64,...",
  "className": "10-A",
  "timestamp": 1234567890000
}
```

This will store the attendance record in `attendance_logs` table.

## Viewing Attendance Logs

**Endpoint:** `GET /api/attendance/logs?date=2024-01-31&className=10-A`

Returns all attendance records for specified date and class.

## Next Steps

1. **Database Setup**: Execute SQL schema
2. **Environment Config**: Add DATABASE_URL
3. **API Implementation**: Uncomment database code in API routes
4. **Testing**: Test enrollment flow end-to-end
5. **Face Recognition**: Integrate face matching library
6. **Production**: Deploy to Vercel with database connection

## Troubleshooting

### Camera not working?
- Check browser permissions for camera access
- Ensure HTTPS in production
- Test with different browser

### Database connection errors?
- Verify CONNECTION_STRING format
- Check network access to database
- Ensure database server is running

### Images not storing?
- Check base64 encoding of images
- Verify database permissions
- Check disk space on server

## Support

For issues, check:
- Console logs in browser (F12)
- Server logs with `[v0]` prefix
- API response status codes
- Database connection string
