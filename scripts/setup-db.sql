-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  class_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create face embeddings table to store face data
CREATE TABLE IF NOT EXISTS face_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  embedding TEXT NOT NULL,
  descriptor JSONB,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON attendance_logs(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_class_name ON attendance_logs(class_name);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_student_id ON face_embeddings(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policy for students table
CREATE POLICY "Everyone can view students" ON students
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage students" ON students
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policy for face_embeddings
CREATE POLICY "Everyone can view face embeddings" ON face_embeddings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage face embeddings" ON face_embeddings
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policy for attendance_logs
CREATE POLICY "Everyone can view attendance logs" ON attendance_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage attendance logs" ON attendance_logs
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
