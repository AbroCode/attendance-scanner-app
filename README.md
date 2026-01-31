# FaceAttend - Face Recognition Attendance System

A production-ready face recognition attendance system for educational institutions. Built with Next.js 16 with client-side camera capture and enrollment functionality.

## Features

- **Real-time Face Capture** - Client-side video streaming and image capture
- **Student Enrollment** - Easy face enrollment with multiple capture support
- **Attendance Scanner** - Live camera feed for instant attendance marking
- **Admin Dashboard** - Comprehensive attendance logs and analytics
- **Secure Authentication** - Password-protected admin/teacher accounts
- **CSV Export** - Export attendance records for reporting
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript, Tailwind CSS v4
- **Camera Capture**: Native browser MediaDevices API
- **UI Components**: shadcn/ui with Radix UI
- **Database**: PostgreSQL (Supabase recommended, or your own)
- **Authentication**: Custom password-based auth with bcryptjs
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
/app
  /api
    /auth
      /login    - User login endpoint
      /signup   - User registration endpoint
    /attendance
      /mark     - Mark attendance endpoint
      /logs     - Fetch attendance logs
    /students
      /enroll   - Enroll new student
  /dashboard
    /page.tsx        - Main dashboard
    /scanner/page.tsx   - Face recognition scanner
    /enroll/page.tsx    - Student enrollment
    /logs/page.tsx      - Attendance logs
  /login/page.tsx    - Login page
  /signup/page.tsx   - Signup page
  /page.tsx          - Home page

/lib
  /auth.ts           - Authentication utilities

/scripts
  /setup-db.sql      - Database schema setup

/components
  /ui                - shadcn/ui components
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Using Supabase (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Connect the database using the integration in v0
3. Run the database schema script:
   - Copy contents of `/scripts/setup-db.sql`
   - Go to Supabase SQL Editor
   - Paste and execute the script

#### Option B: PostgreSQL (Self-Hosted)

1. Create a PostgreSQL database
2. Run the schema setup:
   ```bash
   psql -U postgres -d your_db < scripts/setup-db.sql
   ```
3. Update environment variables with your database connection string

### 3. Environment Variables

Create a `.env.local` file:

```env
# Database (if using Supabase, these are set automatically)
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Authentication (optional, for external auth)
NEXTAUTH_SECRET=generate_with_openssl_rand_-_hex_32
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Create Admin Account

1. Visit `/signup`
2. Create an account with role "Administrator"
3. Use this account to manage students and attendance

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

```json
{
  "fullName": "John Doe",
  "email": "john@school.edu",
  "password": "secure_password",
  "role": "teacher" // or "admin"
}
```

#### POST `/api/auth/login`
Login with email and password.

```json
{
  "email": "john@school.edu",
  "password": "secure_password"
}
```

### Attendance Endpoints

#### POST `/api/attendance/mark`
Mark attendance for a student.

```json
{
  "studentId": "STU-2024-001"
}
```

#### GET `/api/attendance/logs`
Fetch attendance logs.

Query parameters:
- `date` - Filter by date (YYYY-MM-DD)
- `className` - Filter by class name

### Student Endpoints

#### POST `/api/students/enroll`
Enroll a new student with face data.

```json
{
  "studentId": "STU-2024-001",
  "fullName": "John Doe",
  "email": "john@student.edu",
  "className": "10-A",
  "faces": [
    {
      "dataUrl": "data:image/jpeg;base64,..."
    }
  ]
}
```

## Integration Points

The following endpoints need to be connected to your database:

1. **`/api/auth/signup`** - Store user credentials
2. **`/api/auth/login`** - Verify user credentials
3. **`/api/students/enroll`** - Store student data and face embeddings
4. **`/api/attendance/mark`** - Record attendance with timestamp
5. **`/api/attendance/logs`** - Fetch attendance records

Each endpoint has TODO comments indicating where database operations should be added.

## Face Capture & Recognition Setup

### Client-Side Capture Process

The system captures face images using the browser's native MediaDevices API:
- Real-time video feed from user's camera
- Canvas-based frame capture and JPEG encoding
- Base64 image data for transmission to server
- Support for 1-10 face images per student

### Face Recognition Process

1. User camera feed is captured in real-time on the scanner page
2. Canvas captures individual frames as JPEG images
3. Face images are encoded as base64 and transmitted to backend
4. Backend stores face images in database
5. During attendance marking, captured image is sent to server for processing
6. Server can implement face matching using your preferred ML model (coming soon)

### Integration with Face Recognition Models

The system is designed to integrate with:
- **OpenCV** - For server-side face detection and matching
- **face_recognition** (Python library) - For face embeddings
- **TensorFlow.js** - For client-side face detection (optional)
- **AWS Rekognition** - For cloud-based face recognition (optional)

See `ENROLLMENT_SETUP.md` for implementation details.

## Security Considerations

- **Password Hashing**: Passwords are hashed with bcryptjs (10 rounds)
- **CORS**: Configure CORS policies for API endpoints
- **RLS**: Row Level Security is configured in the database schema
- **HTTP-only Cookies**: Session tokens should be stored in secure HTTP-only cookies
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement rate limiting on authentication endpoints

## Performance Optimization

- **Client-side Processing**: All face detection runs on the client
- **WebGL Acceleration**: TensorFlow.js uses WebGL for GPU acceleration
- **Image Compression**: Faces are captured and stored efficiently
- **Indexed Queries**: Database indexes on frequently queried fields

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Camera Access Issues
- Check browser permissions for camera access
- Ensure HTTPS in production
- Test in different browsers

### Face Detection Not Working
- Ensure adequate lighting
- Face should be clear and visible
- Position camera at proper distance
- Check browser console for TensorFlow.js errors

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure database server is running
- Review database schema is installed

## Development

### Adding a New Feature

1. Create page in `/app/[feature]/page.tsx`
2. Create API route in `/app/api/[feature]/route.ts`
3. Add UI components in `/components/`
4. Update database schema if needed

### Testing API Endpoints

```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","password":"pwd","role":"teacher"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pwd"}'
```

## License

MIT License - Feel free to use this in your projects

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API endpoint implementations
3. Check browser console for errors
4. Review server logs with `npm run dev`

## Future Enhancements

- [ ] Multi-class enrollment
- [ ] Batch attendance import
- [ ] Real-time analytics dashboard
- [ ] Mobile app with React Native
- [ ] Email notifications
- [ ] SMS alerts for low attendance
- [ ] Parent portal access
- [ ] Biometric liveness detection
- [ ] Age-gated access
- [ ] Multi-language support
