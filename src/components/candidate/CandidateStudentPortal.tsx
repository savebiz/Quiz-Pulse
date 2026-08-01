import React, { useState } from "react";
import { User, Quiz, QuizAttempt, Certificate, QuizAssignment } from "../../types";
import {
  GraduationCap,
  Play,
  Award,
  CheckCircle2,
  Clock,
  FileQuestion,
  BookOpen,
  LogOut,
  Calendar,
  Key,
  ShieldCheck,
  Search,
} from "lucide-react";

interface CandidateStudentPortalProps {
  candidateUser: User;
  assignedQuizzes: Quiz[];
  attempts: QuizAttempt[];
  certificates: Certificate[];
  onStartQuiz: (quiz: Quiz) => void;
  onSignOut: () => void;
}

export const CandidateStudentPortal: React.FC<CandidateStudentPortalProps> = ({
  candidateUser,
  assignedQuizzes,
  attempts,
  certificates,
  onStartQuiz,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<"assigned" | "history">("assigned");
  const [searchFilter, setSearchFilter] = useState("");

  const candidateAttempts = attempts.filter((a) => a.studentId === candidateUser.id);
  const candidateCerts = certificates.filter((c) => c.studentEmail === candidateUser.email);

  const filteredQuizzes = assignedQuizzes.filter((q) =>
    q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    q.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Candidate Hero Header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={candidateUser.avatar}
            alt={candidateUser.name}
            className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{candidateUser.name}</h1>
              <span className="rounded-full bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-200">
                Candidate Profile
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">{candidateUser.email} • {candidateUser.department || "General Stream"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Assigned Tests: <strong className="text-white">{assignedQuizzes.length}</strong> | Completed: <strong className="text-emerald-400">{candidateAttempts.length}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition-all ${
            activeTab === "assigned"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>My Assigned Tests ({assignedQuizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition-all ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>My Test Scores & Certificates ({candidateAttempts.length})</span>
        </button>
      </div>

      {/* Tab 1: Assigned Tests Grid */}
      {activeTab === "assigned" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Assigned Assessments Ready to Attempt</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search assigned tests..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={quiz.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"}
                      alt={quiz.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-blue-900/80 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">
                        {quiz.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{quiz.description}</p>

                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5 text-blue-600" />
                      <span>{quiz.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>{quiz.settings.timeLimitMinutes > 0 ? `${quiz.settings.timeLimitMinutes} mins` : "Untimed"}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onStartQuiz(quiz)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Assigned Test</span>
                </button>
              </div>
            ))}

            {filteredQuizzes.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-900">No assigned tests found</h3>
                <p className="mt-1 text-xs text-slate-500">Contact your instructor to assign a test to your profile.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Test History & Scores */}
      {activeTab === "history" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Completed Assessments & Instant Certificates
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Assessment Title</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{att.quizTitle}</td>
                    <td className="p-3 text-slate-500">{new Date(att.submittedAt || att.startedAt).toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{att.score} / {att.totalMarks}</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{att.percentage}%</td>
                    <td className="p-3">
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold text-[10px] ${
                          att.isPassed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {att.isPassed ? "PASSED" : "FAILED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {candidateAttempts.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">No completed tests yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
