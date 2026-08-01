export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  organizationId?: string;
  organizationName?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  lastLogin?: string;
  assignedQuizIds?: string[];
  voucherCode?: string;
}

export interface QuizAssignment {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignedBy: string;
  assignedByName?: string;
  assignedAt: string;
  dueDate?: string;
  accessCode?: string;
  voucherCode?: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  logo?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  totalUsers: number;
  totalQuizzes: number;
  createdAt: string;
}

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_RESPONSE"
  | "TRUE_FALSE"
  | "SHORT_TEXT"
  | "PARAGRAPH"
  | "FILL_IN_BLANK"
  | "MATCHING"
  | "ORDERING"
  | "IMAGE_BASED"
  | "AUDIO_VIDEO"
  | "SPELLING_BEE";

export interface OptionItem {
  id: string;
  text: string;
  isCorrect?: boolean;
  image?: string;
  matchPairId?: string; // For matching
  orderIndex?: number;  // For ordering
}

export interface Question {
  id: string;
  bankId?: string;
  type: QuestionType;
  questionText: string;
  options?: OptionItem[];
  correctAnswerText?: string; // For short text, fill in blank, essay reference, spelling bee
  spellingWord?: string; // Target word for Spelling Bee
  maxPlays?: number; // Max audio replay limit for Spelling Bee (default: 3)
  matchingPairs?: { left: string; right: string }[];
  orderingItems?: string[]; // Correct sequence
  mediaUrl?: string; // Image, Audio, Video URL
  mediaType?: "image" | "audio" | "video";
  marks: number;
  negativeMarks?: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
  topic?: string;
  tags: string[];
  explanation?: string;
  hint?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSettings {
  timeLimitMinutes: number; // 0 for unlimited
  perQuestionTimeSeconds?: number;
  passingScorePercentage: number;
  maxAttempts: number; // 0 for unlimited
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showAnswersAfterSubmission: boolean;
  showExplanations: boolean;
  requireFullscreen: boolean;
  preventCopyPaste: boolean;
  autoSaveIntervalSeconds: number;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  accessCode?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  instructions?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  tags: string[];
  thumbnail?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  organizationId?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  settings: QuizSettings;
  questions: Question[];
  totalMarks: number;
  totalQuestions: number;
  assignedStudentsCount?: number;
  attemptsCount?: number;
  avgScore?: number;
}

export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  totalQuestions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  matchingPairsAnswer?: { left: string; right: string }[];
  orderingAnswer?: string[];
  obtainedMarks?: number;
  isGradedManually?: boolean;
  instructorFeedback?: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  startedAt: string;
  submittedAt?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "GRADING_PENDING" | "ABANDONED";
  answers: Record<string, AnswerSubmission>; // questionId -> AnswerSubmission
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  rank?: number;
  certificateId?: string;
  proctoringLogs?: { timestamp: string; event: string }[];
}

export interface Certificate {
  id: string;
  attemptId: string;
  quizId: string;
  quizTitle: string;
  studentName: string;
  studentEmail: string;
  issueDate: string;
  scorePercentage: number;
  verificationCode: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardStats {
  totalQuizzes: number;
  activeQuizzes: number;
  draftQuizzes: number;
  totalQuestions: number;
  totalStudents: number;
  totalAttempts: number;
  avgScorePercentage: number;
  passRatePercentage: number;
}
