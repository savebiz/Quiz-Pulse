import React from "react";
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
} from "lucide-react";
import { User, Quiz, QuizAttempt, DashboardStats } from "../../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart as ReBarChart, Bar, XAxis, YAxis } from "recharts";

interface DashboardProps {
  currentUser: User;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onNavigate: (view: string) => void;
  onSelectQuizToTake: (quiz: Quiz) => void;
  onCreateQuizClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  quizzes,
  attempts,
  onNavigate,
  onSelectQuizToTake,
  onCreateQuizClick,
}) => {
  const isStudent = currentUser.role === "STUDENT";

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
                  onClick={() => onNavigate("bulk-import")}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20"
                >
                  <Upload className="h-4 w-4" />
                  <span>Bulk Upload</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("quizzes")}
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-blue-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span>View My Assessments</span>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quizzes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileQuestion className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalQuizzes}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{activeQuizzes} Published</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalQuestions}</span>
            <span className="text-[11px] font-semibold text-slate-500">Across {totalQuizzes} tests</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attempts Logged</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalAttempts}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{passRate}% Pass Rate</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{avgScore}%</span>
            <span className="text-[11px] font-semibold text-slate-500">Global Average</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active & Available Quizzes */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Featured & Available Quizzes</h2>
                <p className="text-xs text-slate-500">Select any test to start candidate attempt or edit</p>
              </div>
              <button
                onClick={() => onNavigate("quizzes")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All ({quizzes.length})
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/30 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={quiz.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=200"}
                      alt={quiz.title}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {quiz.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          • {quiz.questions?.length || 0} Questions
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          • {quiz.settings.timeLimitMinutes > 0 ? `${quiz.settings.timeLimitMinutes} mins` : "Untimed"}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-600">
                        {quiz.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {quiz.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => onSelectQuizToTake(quiz)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
                    >
                      <span>Take Test</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Overview Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">Quiz Average Score Comparison</h2>
            <p className="text-xs text-slate-500">Average performance metric across major assessments</p>
            <div className="mt-4 h-60 w-full">
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

        {/* Right 1 Col: Recent Activity & Quick Metrics */}
        <div className="space-y-6">
          {/* Recent Attempts Feed */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Recent Attempt Logs</h2>
              <button
                onClick={() => onNavigate("analytics")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {attempts.slice(0, 4).map((att) => (
                <div
                  key={att.id}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{att.studentName}</p>
                    <p className="line-clamp-1 text-[11px] text-slate-500">{att.quizTitle}</p>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(att.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black ${
                        att.isPassed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {att.percentage}% ({att.isPassed ? "PASS" : "FAIL"})
                    </span>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">
                      {Math.round(att.timeSpentSeconds / 60)} mins
                    </p>
                  </div>
                </div>
              ))}
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
    </div>
  );
};
