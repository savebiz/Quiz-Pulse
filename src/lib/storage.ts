import {
  User,
  Organization,
  Quiz,
  QuestionBank,
  QuizAttempt,
  AuditLog,
  Certificate,
  UserRole,
  QuizAssignment,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_QUIZZES,
  INITIAL_QUESTION_BANKS,
  INITIAL_ATTEMPTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CERTIFICATES,
} from "../data/seedData";
import { evaluateCaseInsensitiveMatch } from "./questionUtils";

const STORAGE_KEYS = {
  CURRENT_USER_ID: "quizpulse_current_user_id",
  USERS: "quizpulse_users",
  ORGANIZATIONS: "quizpulse_organizations",
  QUIZZES: "quizpulse_quizzes",
  QUESTION_BANKS: "quizpulse_question_banks",
  ATTEMPTS: "quizpulse_attempts",
  AUDIT_LOGS: "quizpulse_audit_logs",
  CERTIFICATES: "quizpulse_certificates",
  ASSIGNMENTS: "quizpulse_assignments",
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyStateChanged() {
  listeners.forEach((fn) => fn());
}

// Helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (err) {
    console.error(`Error reading key ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStateChanged();
  } catch (err) {
    console.error(`Error writing key ${key} to storage:`, err);
  }
}

// Initialize seed data if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(INITIAL_USERS[2].id)); // Default to Instructor
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS)) {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(INITIAL_ORGANIZATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTION_BANKS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(INITIAL_QUESTION_BANKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
  }
}

// Current User & Profile Operations
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User {
  const users = getUsers();
  const currentId = getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[2].id);
  return users.find((u) => u.id === currentId) || users[0];
}

export function setCurrentUserRole(role: UserRole): User {
  const users = getUsers();
  const matched = users.find((u) => u.role === role);
  if (matched) {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, matched.id);
    logAuditAction("ROLE_SWITCH", `Switched active preview role to ${role}`);
    return matched;
  }
  return users[0];
}

export function switchUser(userId: string): User {
  const users = getUsers();
  const found = users.find((u) => u.id === userId);
  if (found) {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
    logAuditAction("USER_SWITCH", `Switched logged in profile to ${found.name} (${found.email})`);
    return found;
  }
  return getCurrentUser();
}

export function createUser(userData: Partial<User> & { name: string; email: string; role: UserRole; password: string }): User {
  const users = getUsers();
  
  // Enforce unique email check
  const normalizedEmail = userData.email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error(`A user with email '${userData.email}' already exists. Please use a unique email.`);
  }

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`;

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: userData.name.trim(),
    email: normalizedEmail,
    role: userData.role,
    password: userData.password,
    avatar: userData.avatar || defaultAvatar,
    phone: userData.phone || "",
    bio: userData.bio || "",
    jobTitle: userData.jobTitle || "",
    department: userData.department || "",
    organizationId: userData.organizationId || "org-tech-inst",
    organizationName: userData.organizationName || "Tech Institute of Science",
    status: userData.status || "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...users];
  setItem(STORAGE_KEYS.USERS, updatedUsers);
  logAuditAction("USER_CREATED", `Created new unique profile '${newUser.name}' (${newUser.role})`);
  return newUser;
}

export function updateUser(userId: string, updates: Partial<User>): User {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("User not found.");
  }

  // If email is changing, enforce unique email
  if (updates.email) {
    const normEmail = updates.email.trim().toLowerCase();
    const existing = users.find((u) => u.id !== userId && u.email.toLowerCase() === normEmail);
    if (existing) {
      throw new Error(`Email '${updates.email}' is already in use by another user profile.`);
    }
    updates.email = normEmail;
  }

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  setItem(STORAGE_KEYS.USERS, users);
  logAuditAction("USER_UPDATED", `Updated profile information for '${updatedUser.name}'`);
  return updatedUser;
}

export function deleteUser(userId: string): void {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return;

  const filtered = users.filter((u) => u.id !== userId);
  setItem(STORAGE_KEYS.USERS, filtered);

  // If deleted active user, reset to first remaining
  if (getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, "") === userId && filtered.length > 0) {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, filtered[0].id);
  }

  logAuditAction("USER_DELETED", `Deleted user profile '${target.name}' (${target.email})`);
}

export function authenticateUser(email: string, pass: string): User | null {
  const users = getUsers();
  const normEmail = email.trim().toLowerCase();
  const found = users.find((u) => u.email.toLowerCase() === normEmail && (u.password === pass || !u.password));
  if (found) {
    updateUser(found.id, { lastLogin: new Date().toISOString() });
    switchUser(found.id);
    logAuditAction("USER_LOGIN", `User '${found.name}' logged in successfully.`);
    return found;
  }
  return null;
}

export function resetUserPassword(userId: string, newPassword: string): void {
  updateUser(userId, { password: newPassword });
  logAuditAction("PASSWORD_RESET", `Admin reset password for user ID ${userId}`);
}

// Quizzes
export function getQuizzes(): Quiz[] {
  return getItem<Quiz[]>(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
}

export function getQuizById(id: string): Quiz | undefined {
  return getQuizzes().find((q) => q.id === id);
}

export function saveQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex((q) => q.id === quiz.id);
  let updated: Quiz[];
  if (index >= 0) {
    updated = [...quizzes];
    updated[index] = quiz;
  } else {
    updated = [quiz, ...quizzes];
  }
  setItem(STORAGE_KEYS.QUIZZES, updated);
  logAuditAction("QUIZ_SAVED", `Quiz '${quiz.title}' (${quiz.status}) saved with ${quiz.questions.length} questions.`);

  // Auto regrade candidates if quiz was published and has existing attempts
  if (quiz.status === "PUBLISHED") {
    regradeQuizAttempts(quiz.id);
  }
}

export function regradeQuizAttempts(quizId: string): number {
  const quiz = getQuizById(quizId);
  if (!quiz) return 0;

  const attempts = getAttempts();
  const targetAttempts = attempts.filter((a) => a.quizId === quizId && a.status === "COMPLETED");
  if (targetAttempts.length === 0) return 0;

  let regradedCount = 0;

  targetAttempts.forEach((attempt) => {
    let newScore = 0;

    quiz.questions.forEach((q) => {
      const sub = attempt.answers[q.id];
      if (!sub) return;

      let isCorrect = false;

      if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (correctOpt && sub.selectedOptionIds && sub.selectedOptionIds.includes(correctOpt.id)) {
          isCorrect = true;
        }
      } else if (q.type === "MULTIPLE_RESPONSE") {
        const correctIds = (q.options || []).filter((o) => o.isCorrect).map((o) => o.id);
        const selIds = sub.selectedOptionIds || [];
        if (
          correctIds.length === selIds.length &&
          correctIds.every((id) => selIds.includes(id))
        ) {
          isCorrect = true;
        }
      } else if (q.type === "SHORT_TEXT" || q.type === "FILL_IN_BLANK") {
        if (evaluateCaseInsensitiveMatch(sub.textAnswer, q.correctAnswerText)) {
          isCorrect = true;
        }
      } else if (q.type === "PARAGRAPH") {
        // Keep manual marks if graded
        if (sub.isGradedManually) {
          newScore += sub.obtainedMarks || 0;
          return;
        }
      }

      const marksAwarded = isCorrect ? q.marks : 0;
      sub.isCorrect = isCorrect;
      sub.obtainedMarks = marksAwarded;
      newScore += marksAwarded;
    });

    attempt.score = newScore;
    attempt.totalMarks = quiz.totalMarks;
    attempt.percentage = parseFloat(((newScore / (quiz.totalMarks || 1)) * 100).toFixed(1));
    attempt.isPassed = attempt.percentage >= quiz.settings.passingScorePercentage;

    saveAttempt(attempt);
    regradedCount++;
  });

  if (regradedCount > 0) {
    logAuditAction("POST_PUBLISH_REGRADE", `Auto-regraded ${regradedCount} attempts for quiz '${quiz.title}' following key corrections.`);
  }

  return regradedCount;
}

export function deleteQuiz(quizId: string): void {
  const quizzes = getQuizzes().filter((q) => q.id !== quizId);
  setItem(STORAGE_KEYS.QUIZZES, quizzes);
  logAuditAction("QUIZ_DELETED", `Quiz ${quizId} deleted.`);
}

export function duplicateQuiz(quizId: string): Quiz | null {
  const orig = getQuizById(quizId);
  if (!orig) return null;
  const user = getCurrentUser();
  const copy: Quiz = {
    ...orig,
    id: `quiz-copy-${Date.now()}`,
    title: `${orig.title} (Copy)`,
    status: "DRAFT",
    createdBy: user.id,
    createdByName: user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedStudentsCount: 0,
    attemptsCount: 0,
    avgScore: 0,
  };
  saveQuiz(copy);
  return copy;
}

// Question Banks
export function getQuestionBanks(): QuestionBank[] {
  return getItem<QuestionBank[]>(STORAGE_KEYS.QUESTION_BANKS, INITIAL_QUESTION_BANKS);
}

export function saveQuestionBank(bank: QuestionBank): void {
  const banks = getQuestionBanks();
  const idx = banks.findIndex((b) => b.id === bank.id);
  const updated = idx >= 0 ? [...banks] : [bank, ...banks];
  if (idx >= 0) updated[idx] = bank;
  setItem(STORAGE_KEYS.QUESTION_BANKS, updated);
  logAuditAction("QUESTION_BANK_SAVED", `Question bank '${bank.title}' updated.`);
}

// Attempts
export function getAttempts(): QuizAttempt[] {
  return getItem<QuizAttempt[]>(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
}

export function saveAttempt(attempt: QuizAttempt): void {
  const attempts = getAttempts();
  const idx = attempts.findIndex((a) => a.id === attempt.id);
  const updated = idx >= 0 ? [...attempts] : [attempt, ...attempts];
  if (idx >= 0) updated[idx] = attempt;
  setItem(STORAGE_KEYS.ATTEMPTS, updated);

  // Auto-generate certificate if passed and not yet existing
  if (attempt.isPassed && attempt.status === "COMPLETED" && !attempt.certificateId) {
    const cert: Certificate = {
      id: `cert-${Date.now().toString().slice(-6)}`,
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      studentName: attempt.studentName,
      studentEmail: attempt.studentEmail,
      issueDate: new Date().toISOString(),
      scorePercentage: attempt.percentage,
      verificationCode: `QP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    saveCertificate(cert);
    attempt.certificateId = cert.id;
  }
}

export function gradeEssayAnswer(
  attemptId: string,
  questionId: string,
  obtainedMarks: number,
  feedback: string
): QuizAttempt | null {
  const attempts = getAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);
  if (!attempt) return null;

  const quiz = getQuizById(attempt.quizId);
  if (!quiz) return null;

  const answer = attempt.answers[questionId];
  if (answer) {
    answer.obtainedMarks = obtainedMarks;
    answer.instructorFeedback = feedback;
    answer.isGradedManually = true;
    answer.isCorrect = obtainedMarks > 0;
  }

  // Recalculate total score
  let totalScore = 0;
  Object.values(attempt.answers).forEach((ans) => {
    totalScore += ans.obtainedMarks || 0;
  });

  attempt.score = totalScore;
  attempt.percentage = parseFloat(((totalScore / attempt.totalMarks) * 100).toFixed(1));
  attempt.isPassed = attempt.percentage >= quiz.settings.passingScorePercentage;

  // Check if all essay questions are graded
  const allGraded = quiz.questions.every((q) => {
    if (q.type === "PARAGRAPH") {
      return attempt.answers[q.id]?.isGradedManually === true;
    }
    return true;
  });

  if (allGraded) {
    attempt.status = "COMPLETED";
  }

  saveAttempt(attempt);
  logAuditAction("MANUAL_GRADING", `Graded essay answer for attempt ${attemptId} (${obtainedMarks} marks).`);
  return attempt;
}

// Certificates
export function getCertificates(): Certificate[] {
  return getItem<Certificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
}

export function saveCertificate(cert: Certificate): void {
  const certs = getCertificates();
  setItem(STORAGE_KEYS.CERTIFICATES, [cert, ...certs]);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

export function logAuditAction(action: string, details: string): void {
  const currentUser = getCurrentUser();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action,
    details,
    ipAddress: "127.0.0.1",
    timestamp: new Date().toISOString(),
  };
  const logs = getAuditLogs();
  setItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs.slice(0, 99)]);
}

// Quiz Assignments Management
export function getQuizAssignments(): QuizAssignment[] {
  return getItem<QuizAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
}

export function getAssignmentsForCandidate(candidateId: string): QuizAssignment[] {
  return getQuizAssignments().filter((a) => a.studentId === candidateId);
}

export function saveQuizAssignment(assignment: QuizAssignment): void {
  const assignments = getQuizAssignments();
  const index = assignments.findIndex((a) => a.id === assignment.id);
  const updated = index >= 0 ? [...assignments] : [assignment, ...assignments];
  if (index >= 0) updated[index] = assignment;
  setItem(STORAGE_KEYS.ASSIGNMENTS, updated);
}

export function createQuizAssignment(
  quizId: string,
  studentId: string,
  dueDate?: string,
  accessCode?: string
): QuizAssignment {
  const quiz = getQuizById(quizId);
  const users = getUsers();
  const student = users.find((u) => u.id === studentId);
  const currentUser = getCurrentUser();

  if (!quiz) throw new Error("Quiz not found.");
  if (!student) throw new Error("Student candidate not found.");

  const newAssignment: QuizAssignment = {
    id: `asg-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    assignedBy: currentUser.id,
    assignedByName: currentUser.name,
    assignedAt: new Date().toISOString(),
    dueDate,
    accessCode,
    status: "ASSIGNED",
  };

  saveQuizAssignment(newAssignment);

  // Also append to student.assignedQuizIds if not present
  const assignedList = student.assignedQuizIds || [];
  if (!assignedList.includes(quiz.id)) {
    updateUser(student.id, { assignedQuizIds: [...assignedList, quiz.id] });
  }

  logAuditAction(
    "QUIZ_ASSIGNED",
    `Assigned quiz '${quiz.title}' to candidate '${student.name}' (${student.email})`
  );

  return newAssignment;
}

export function deleteQuizAssignment(assignmentId: string): void {
  const assignments = getQuizAssignments().filter((a) => a.id !== assignmentId);
  setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  logAuditAction("ASSIGNMENT_DELETED", `Deleted quiz assignment ID ${assignmentId}`);
}

// Reset/Seed helper
export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(INITIAL_USERS[2].id));
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(INITIAL_ORGANIZATIONS));
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(INITIAL_QUESTION_BANKS));
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  notifyStateChanged();
}
