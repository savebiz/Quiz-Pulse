/**
 * @license
 * QuizPulse Supabase Cloud Backend Integration Client
 * Provides real-time cross-device synchronization for Quizzes, Vouchers, Assignments, and Attempts
 */

import { Quiz, QuizAssignment, QuizAttempt, User } from "../types";

// Default Supabase Environment Configs (reads from VITE_SUPABASE_URL or defaults to project instance)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://vnhzocmlgcwqaptcwksm.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHpvY21sZ2N3cWFwdGN3a3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mzg1MzQsImV4cCI6MjEwMTIxNDUzNH0.VVZbB6G9TjjNDksSTEcdnTf0NaIBpJ3f3fuPYt7jJKM";

/**
 * Check if Supabase client is connected
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("MY_SUPABASE"));
}

/**
 * Helper to execute Supabase REST API requests
 */
async function supabaseFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${endpoint}`;
    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      console.warn(`Supabase REST warning [${response.status}]: ${await response.text()}`);
      return null;
    }
    const data = await response.json();
    return data as T;
  } catch (err) {
    console.warn("Supabase fetch exception:", err);
    return null;
  }
}

// ==========================================
// 1. QUIZ CLOUD SYNCHRONIZATION
// ==========================================

export async function syncQuizToCloud(quiz: Quiz): Promise<boolean> {
  if (!quiz || !quiz.id) return false;
  const payload = {
    id: quiz.id,
    title: quiz.title,
    category: quiz.category || "General",
    difficulty: quiz.difficulty || "Intermediate",
    total_marks: quiz.totalMarks || 0,
    created_by: quiz.createdBy || "Instructor",
    is_published: quiz.isPublished ?? true,
    data_json: quiz,
    updated_at: new Date().toISOString(),
  };

  const res = await supabaseFetch<any>("quizzes?on_conflict=id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify([payload]),
  });
  return Boolean(res);
}

export async function fetchQuizzesFromCloud(): Promise<Quiz[]> {
  const rows = await supabaseFetch<any[]>("quizzes?select=data_json");
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((r) => r.data_json).filter(Boolean);
}

export async function fetchQuizByIdFromCloud(quizId: string): Promise<Quiz | null> {
  const rows = await supabaseFetch<any[]>(`quizzes?id=eq.${encodeURIComponent(quizId)}&select=data_json`);
  if (rows && rows.length > 0 && rows[0].data_json) {
    return rows[0].data_json as Quiz;
  }
  return null;
}

// ==========================================
// 2. CANDIDATE & VOUCHER ASSIGNMENT CLOUD SYNC
// ==========================================

export async function syncAssignmentToCloud(assignment: QuizAssignment): Promise<boolean> {
  if (!assignment || !assignment.id) return false;
  const payload = {
    id: assignment.id,
    quiz_id: assignment.quizId,
    user_id: assignment.studentId || (assignment as any).userId,
    student_id: assignment.studentId,
    student_name: assignment.studentName,
    student_email: assignment.studentEmail,
    voucher_code: (assignment.voucherCode || assignment.accessCode || "").toUpperCase(),
    assigned_by: assignment.assignedBy || "Instructor",
    status: assignment.status || "ASSIGNED",
    due_date: assignment.dueDate || null,
    data_json: assignment,
  };

  const res = await supabaseFetch<any>("assignments?on_conflict=id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify([payload]),
  });
  return Boolean(res);
}

export async function syncUserToCloud(user: User): Promise<boolean> {
  if (!user || !user.id) return false;
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role,
    password: user.password || "",
    voucher_code: (user.voucherCode || "").toUpperCase(),
    organization_id: user.organizationId || "org-1",
    organization_name: user.organizationName || "Tech Institute",
    department: user.department || "",
    job_title: user.jobTitle || "",
    phone: user.phone || "",
    status: user.status || "ACTIVE",
    data_json: user,
    updated_at: new Date().toISOString(),
  };

  const res = await supabaseFetch<any>("users?on_conflict=id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify([payload]),
  });
  return Boolean(res);
}

export async function fetchUsersFromCloud(): Promise<User[]> {
  const rows = await supabaseFetch<any[]>("users?select=data_json");
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((r) => r.data_json).filter(Boolean);
}

/**
 * Fetch assigned quiz and candidate user profile by Voucher Pass Code from Supabase Cloud
 */
export async function fetchQuizAndUserByVoucherFromCloud(
  voucherCode: string
): Promise<{ user: User; quiz: Quiz; assignment: QuizAssignment } | null> {
  if (!voucherCode || !voucherCode.trim()) return null;
  const cleanCode = voucherCode.trim().toUpperCase();

  // 1. Search assignments table by voucher_code
  const assignRows = await supabaseFetch<any[]>(
    `assignments?voucher_code=eq.${encodeURIComponent(cleanCode)}&select=*`
  );

  if (assignRows && assignRows.length > 0) {
    const assignData = assignRows[0];
    const quizId = assignData.quiz_id || assignData.data_json?.quizId;
    const studentId = assignData.user_id || assignData.student_id || assignData.data_json?.studentId;
    const studentEmail = assignData.student_email || assignData.data_json?.studentEmail;

    // Fetch associated Quiz
    const targetQuiz = await fetchQuizByIdFromCloud(quizId);
    if (targetQuiz) {
      // Query exact candidate user profile from users cloud table
      let candUser: User | null = null;
      if (studentId) {
        const userRows = await supabaseFetch<any[]>(`users?id=eq.${encodeURIComponent(studentId)}&select=data_json`);
        if (userRows && userRows.length > 0 && userRows[0].data_json) {
          candUser = userRows[0].data_json as User;
        }
      }

      if (!candUser && studentEmail) {
        const userRows = await supabaseFetch<any[]>(`users?email=eq.${encodeURIComponent(studentEmail.toLowerCase())}&select=data_json`);
        if (userRows && userRows.length > 0 && userRows[0].data_json) {
          candUser = userRows[0].data_json as User;
        }
      }

      if (!candUser) {
        candUser = {
          id: studentId || `usr-cand-${cleanCode}`,
          name: assignData.student_name || assignData.data_json?.studentName || `Candidate (${cleanCode})`,
          email: studentEmail || `candidate.${cleanCode.toLowerCase()}@quizpulse.com`,
          role: "STUDENT",
          voucherCode: cleanCode,
          organizationId: "org-tech-inst",
          organizationName: "Tech Institute of Science",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };
      }

      const assignment: QuizAssignment = assignData.data_json || {
        id: assignData.id,
        quizId: targetQuiz.id,
        studentId: candUser.id,
        studentName: candUser.name,
        studentEmail: candUser.email,
        assignedBy: assignData.assigned_by || "Instructor",
        assignedAt: assignData.created_at || new Date().toISOString(),
        voucherCode: cleanCode,
        status: assignData.status || "ASSIGNED",
      };

      return { user: candUser, quiz: targetQuiz, assignment };
    }
  }

  // 2. Search users table by voucher_code as fallback
  const userRows = await supabaseFetch<any[]>(
    `users?voucher_code=eq.${encodeURIComponent(cleanCode)}&select=data_json`
  );

  if (userRows && userRows.length > 0 && userRows[0].data_json) {
    const candUser = userRows[0].data_json as User;

    // Find any assignment associated with this candidate user ID
    const assignRows = await supabaseFetch<any[]>(
      `assignments?user_id=eq.${encodeURIComponent(candUser.id)}&select=*`
    );

    if (assignRows && assignRows.length > 0) {
      const targetQuiz = await fetchQuizByIdFromCloud(assignRows[0].quiz_id);
      if (targetQuiz) {
        return {
          user: candUser,
          quiz: targetQuiz,
          assignment: assignRows[0].data_json || assignRows[0],
        };
      }
    }
  }

  return null;
}

// ==========================================
// 3. ATTEMPTS CLOUD SYNCHRONIZATION
// ==========================================

export async function syncAttemptToCloud(attempt: QuizAttempt): Promise<boolean> {
  if (!attempt || !attempt.id) return false;
  const payload = {
    id: attempt.id,
    quiz_id: attempt.quizId,
    quiz_title: attempt.quizTitle,
    student_id: attempt.studentId,
    student_name: attempt.studentName,
    student_email: attempt.studentEmail,
    score: attempt.score,
    total_marks: attempt.totalMarks,
    percentage: attempt.percentage,
    is_passed: attempt.isPassed,
    status: attempt.status,
    data_json: attempt,
    started_at: attempt.startedAt,
    submitted_at: attempt.submittedAt || new Date().toISOString(),
  };

  const res = await supabaseFetch<any>("attempts?on_conflict=id", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify([payload]),
  });
  return Boolean(res);
}

export async function fetchAttemptsFromCloud(): Promise<QuizAttempt[]> {
  const rows = await supabaseFetch<any[]>("attempts?select=data_json");
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((r) => r.data_json).filter(Boolean);
}
