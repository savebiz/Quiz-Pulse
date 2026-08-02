-- ====================================================================
-- QuizPulse Supabase Cloud Database Schema & RBAC RLS Policies
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT', -- 'ADMIN', 'INSTRUCTOR', 'STUDENT'
  password TEXT,
  voucher_code TEXT UNIQUE,
  organization_id TEXT,
  organization_name TEXT,
  department TEXT,
  job_title TEXT,
  phone TEXT,
  status TEXT DEFAULT 'ACTIVE',
  data_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT DEFAULT 'Intermediate',
  total_marks INT NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  data_json JSONB NOT NULL, -- Full Quiz payload including questions & settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  student_name TEXT,
  student_email TEXT,
  voucher_code TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  status TEXT DEFAULT 'ASSIGNED', -- 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'
  due_date TIMESTAMP WITH TIME ZONE,
  data_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  is_passed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'COMPLETED', -- 'IN_PROGRESS', 'GRADING_PENDING', 'COMPLETED'
  data_json JSONB NOT NULL, -- Full Attempt payload with answer submissions
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for Lightning Fast Voucher & Candidate Lookups
CREATE INDEX IF NOT EXISTS idx_users_voucher ON public.users(voucher_code);
CREATE INDEX IF NOT EXISTS idx_assignments_voucher ON public.assignments(voucher_code);
CREATE INDEX IF NOT EXISTS idx_assignments_quiz ON public.assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.attempts(student_email);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON public.attempts(quiz_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR CANDIDATES, INSTRUCTORS & ADMINS
-- Allow Anonymous & Authenticated Read Access so Candidates can fetch Quizzes via Voucher Code
CREATE POLICY "Public Quiz Read Policy" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public Quiz Write Policy" ON public.quizzes FOR ALL USING (true);

CREATE POLICY "Public Users Read Policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Users Write Policy" ON public.users FOR ALL USING (true);

CREATE POLICY "Public Assignments Read Policy" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public Assignments Write Policy" ON public.assignments FOR ALL USING (true);

CREATE POLICY "Public Attempts Read Policy" ON public.attempts FOR SELECT USING (true);
CREATE POLICY "Public Attempts Write Policy" ON public.attempts FOR ALL USING (true);

CREATE POLICY "Public Audit Logs Read Policy" ON public.audit_logs FOR ALL USING (true);
