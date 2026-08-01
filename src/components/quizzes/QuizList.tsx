import React, { useState } from "react";
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  Play,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Eye,
} from "lucide-react";
import { Quiz, UserRole } from "../../types";

interface QuizListProps {
  quizzes: Quiz[];
  userRole: UserRole;
  onSelectQuizToTake: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onDuplicateQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  userRole,
  onSelectQuizToTake,
  onEditQuiz,
  onCreateQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const isStudent = userRole === "STUDENT";

  const categories = Array.from(new Set(quizzes.map((q) => q.category))).filter(Boolean);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === "ALL" || q.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isStudent ? "Available Quizzes & Assessments" : "Quiz & Test Management"}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {isStudent
              ? "Select an assigned assessment to take now or view past score history"
              : "Manage, publish, duplicate, or build new assessments with AI assistance"}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={onCreateQuiz}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title, tag, or topic..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          {!isStudent && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          )}
        </div>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              {/* Image & Status Badge */}
              <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={quiz.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"}
                  alt={quiz.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {quiz.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md ${
                      quiz.difficulty === "Beginner"
                        ? "bg-emerald-500/90 text-white"
                        : quiz.difficulty === "Intermediate"
                        ? "bg-blue-500/90 text-white"
                        : "bg-purple-500/90 text-white"
                    }`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                {!isStudent && (
                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                        quiz.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {quiz.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {quiz.description}
              </p>

              {/* Quiz Info Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5 text-blue-600" />
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {quiz.settings.timeLimitMinutes > 0
                      ? `${quiz.settings.timeLimitMinutes} mins`
                      : "Untimed"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pass: {quiz.settings.passingScorePercentage}%</span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3.5">
              <button
                onClick={() => onSelectQuizToTake(quiz)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Take Test</span>
              </button>

              {!isStudent && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditQuiz(quiz)}
                    title="Edit Quiz"
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateQuiz(quiz.id)}
                    title="Duplicate Quiz"
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete '${quiz.title}'?`)) {
                        onDeleteQuiz(quiz.id);
                      }
                    }}
                    title="Delete Quiz"
                    className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No quizzes found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search criteria or create a new quiz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
