import { User, Organization, Quiz, QuestionBank, QuizAttempt, AuditLog, Certificate } from "../types";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-super-admin",
    name: "Platform Administrator",
    email: "admin@quizpulse.com",
    role: "SUPER_ADMIN",
    password: "Admin2026!",
    jobTitle: "Principal Systems Administrator",
    department: "Platform Engineering",
    bio: "Super Admin managing platform infrastructure, multi-tenant organizations, and global security policies.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    status: "ACTIVE",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "usr-instructor",
    name: "Lead Instructor",
    email: "instructor@quizpulse.com",
    role: "INSTRUCTOR",
    password: "Instructor2026!",
    jobTitle: "Senior Instructor & Assessment Author",
    department: "Academic Operations",
    bio: "Lead instructor creating candidate profiles, generating credential vouchers, and managing quiz assessments.",
    organizationId: "org-tech-inst",
    organizationName: "QuizPulse Academy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    status: "ACTIVE",
    createdAt: "2026-02-01T10:00:00Z",
  },
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: "org-tech-inst",
    name: "Tech Institute of Science",
    code: "TIS-2026",
    plan: "PRO",
    totalUsers: 1420,
    totalQuizzes: 0,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "org-global-corp",
    name: "Global Finance Academy",
    code: "GFA-8890",
    plan: "ENTERPRISE",
    totalUsers: 5200,
    totalQuizzes: 0,
    createdAt: "2026-01-05T00:00:00Z",
  },
];

// Completely clean empty array for fresh quiz uploads
export const INITIAL_QUIZZES: Quiz[] = [];

export const INITIAL_QUESTION_BANKS: QuestionBank[] = [];

export const INITIAL_ATTEMPTS: QuizAttempt[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    userId: "usr-super-admin",
    userName: "Platform Administrator",
    userRole: "SUPER_ADMIN",
    action: "SYSTEM_INITIALIZED",
    details: "Platform initialized for fresh instructor quiz authoring.",
    ipAddress: "127.0.0.1",
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_CERTIFICATES: Certificate[] = [];
