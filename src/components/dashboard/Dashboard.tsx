import React, { useState } from "react";
import {
  FileQuestion,
  Users,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Plus,
  Upload,
  ArrowRight,
  HelpCircle,
  BarChart,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileText,
  X,
  Search,
} from "lucide-react";
import { User, Quiz, QuizAttempt, DashboardStats } from "../../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart as ReBarChart, Bar, XAxis, YAxis } from "recharts";
import { analyzeCharacterDiscrepancy } from "../../lib/questionUtils";

interface DashboardProps {
  currentUser: User;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onNavigate: (view: string) => void;
  onSelectQuizToTake: (quiz: Quiz) => void;
  onCreateQuizClick: () => void;
  onInspectAttempt?: (attempt: QuizAttempt) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  quizzes,
  attempts,
  onNavigate,
  onSelectQuizToTake,
  onCreateQuizClick,
  onInspectAttempt,
}) => {
  const isStudent = currentUser.role === "STUDENT";
  const [selectedAttemptModal, setSelectedAttemptModal] = useState<QuizAttempt | null>(null);

  // Calculate statistics
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((q) => q.status === "PUBLISHED").length;
  const draftQuizzes = quizzes.filter((q) => q.status === "DRAFT").length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.isPassed).length;

  const avgScore =
    attempts.length > 0
      ? parseFloat((attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1))
      : 0;

  const passRate =
    attempts.length > 0 ? parseFloat(((passedAttempts / attempts.length) * 100).toFixed(1)) : 0;

  const passFailData = [
    { name: "Passed", value: passedAttempts, color: "#10b981" },
    { name: "Failed / Incomplete", value: Math.max(0, attempts.length - passedAttempts), color: "#f43f5e" },
  ];

  const quizScoresData = quizzes.slice(0, 5).map((q) => ({
    title: q.title.length > 18 ? q.title.substring(0, 18) + "..." : q.title,
    avgScore: q.avgScore || 80,
    attempts: q.attemptsCount || 10,
  }));

  const handleRowClick = (att: QuizAttempt) => {
    if (onInspectAttempt) {
      onInspectAttempt(att);
    } else {
      setSelectedAttemptModal(att);
    }
  };

  const modalQuiz = selectedAttemptModal
    ? quizzes.find((q) => q.id === selectedAttemptModal.quizId)
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/10 md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>
                {isStudent ? "Candidate Portal Active" : `Welcome back, ${currentUser.name}`}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
              {isStudent
                ? "Ready to take your assessment?"
                : "Modern Quiz & Assessment Engine"}
            </h1>
            <p className="mt-1 max-w-xl text-xs font-normal text-blue-100/80 md:text-sm">
              {isStudent
                ? "Browse assigned assessments, track your progress, test knowledge with timed tests, and download certificates."
                : "Create robust quizzes, generate questions with AI, upload bulk XLSX/CSV datasets, auto-grade candidates, and view real-time analytics."}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            {!isStudent ? (
              <>
                <button
                  onClick={onCreateQuizClick}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span>Create Quiz</span>
                </button>

                <button
                  onClick={() => onNavigate("assignments")}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span>Candidate Assignments</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Quizzes
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileQuestion className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{totalQuizzes}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">
            {activeQuizzes} Published
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Questions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{totalQuestions}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Across {totalQuizzes} tests
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attempts Logged
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{totalAttempts}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">
            {passRate}% Pass Rate
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{avgScore}%</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Global Average</p>
        </div>
      </div>

      {/* Main Grid: Left Charts + Right Candidate Attempt Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Quizzes List Preview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Featured & Available Quizzes</h2>
              <button
                onClick={() => onNavigate("quizzes")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All ({quizzes.length})
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {quizzes.slice(0, 3).map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:bg-slate-100/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={quiz.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100"}
                      alt={quiz.title}
                      className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{quiz.title}</h3>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-blue-600">{quiz.category}</span>
                        <span>•</span>
                        <span>{quiz.questions?.length || 0} Questions</span>
                        <span>•</span>
                        <span>{quiz.durationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectQuizToTake(quiz)}
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                  >
                    <span>View / Attempt</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Average Performance Bar Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">Quiz Performance Comparison</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={quizScoresData}>
                  <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#2563eb" radius={[8, 8, 0, 0]} name="Avg Score (%)" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Candidate Attempt Logs Feed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Candidate Test Results</h2>
                <p className="text-[11px] text-slate-500">Click any candidate log to review answers</p>
              </div>
              <button
                onClick={() => onNavigate("analytics")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {attempts.length > 0 ? (
                attempts.slice(0, 6).map((att) => (
                  <div
                    key={att.id}
                    onClick={() => handleRowClick(att)}
                    className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{att.studentName}</p>
                        <Eye className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <p className="line-clamp-1 text-[11px] text-slate-500">{att.quizTitle}</p>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(att.startedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black ${
                          att.isPassed
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {att.score} / {att.totalMarks} ({att.percentage}%)
                      </span>
                      <p className="mt-1 text-[10px] font-bold text-blue-600 group-hover:underline">
                        Review Results →
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No candidate attempts recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Pass/Fail Distribution */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">Pass / Fail Ratio</h2>
            <div className="mt-2 flex h-44 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-center gap-6 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span>Passed ({passedAttempts})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span>Failed ({Math.max(0, attempts.length - passedAttempts)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD ATTEMPT RESULT INSPECTION MODAL */}
      {selectedAttemptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Candidate Test Result Details</h3>
                <p className="text-xs text-slate-500">
                  Candidate: {selectedAttemptModal.studentName} ({selectedAttemptModal.studentEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptModal(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-blue-50/80 p-3 border border-blue-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Score</p>
                <p className="text-xl font-black text-blue-900">
                  {selectedAttemptModal.score} / {selectedAttemptModal.totalMarks}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50/80 p-3 border border-emerald-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Percentage</p>
                <p className="text-xl font-black text-emerald-900">{selectedAttemptModal.percentage}%</p>
              </div>
              <div className="rounded-2xl bg-purple-50/80 p-3 border border-purple-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="text-xl font-black text-purple-900">
                  {selectedAttemptModal.isPassed ? "PASSED ✓" : "FAILED"}
                </p>
              </div>
            </div>

            {/* Answers List Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                Question & Answer Submission Breakdown
              </h4>

              {modalQuiz ? (
                modalQuiz.questions.map((q, idx) => {
                  const ans = selectedAttemptModal.answers[q.id];
                  let submittedText = ans?.textAnswer || "";
                  if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_RESPONSE") {
                    const selOpts = (q.options || []).filter((o) => (ans?.selectedOptionIds || []).includes(o.id));
                    submittedText = selOpts.map((o) => o.text).join(", ");
                  }

                  let expectedText = q.correctAnswerText || q.explanation || "";
                  if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_RESPONSE") {
                    const corrOpts = (q.options || []).filter((o) => o.isCorrect);
                    expectedText = corrOpts.map((o) => o.text).join(", ");
                  }

                  const isCorrect = ans?.isCorrect || false;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-4 space-y-2 text-xs ${
                        isCorrect ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>
                          {idx + 1}. {q.questionText}
                        </span>
                        <span className={isCorrect ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                          {ans?.obtainedMarks || (isCorrect ? q.marks : 0)} / {q.marks} PTS
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200/80">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted Answer</p>
                          <p className="font-semibold text-slate-900 mt-0.5">{submittedText || "No answer submitted"}</p>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 border border-blue-200/80">
                          <p className="text-[10px] font-bold text-blue-500 uppercase">Correct Answer Key</p>
                          <p className="font-semibold text-blue-900 mt-0.5">{expectedText || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">Quiz questions details loaded.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedAttemptModal(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
