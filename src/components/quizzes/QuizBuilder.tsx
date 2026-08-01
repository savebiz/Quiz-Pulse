import React, { useState } from "react";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Shield,
  Settings,
  ArrowLeft,
  CheckCircle2,
  FileQuestion,
  Image as ImageIcon,
  Layers,
  UploadCloud,
} from "lucide-react";
import { Quiz, Question, QuestionType, OptionItem } from "../../types";
import { AIQuestionGeneratorModal } from "./AIQuestionGeneratorModal";
import { BulkImportModal } from "../questions/BulkImportModal";

interface QuizBuilderProps {
  initialQuiz?: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  initialQuiz,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "QUESTIONS">("QUESTIONS");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialQuiz?.title || "");
  const [description, setDescription] = useState(initialQuiz?.description || "");
  const [category, setCategory] = useState(initialQuiz?.category || "Computer Science");
  const [instructions, setInstructions] = useState(
    initialQuiz?.instructions || "Read each question carefully before submitting your final answers."
  );
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">(
    initialQuiz?.difficulty || "Intermediate"
  );
  const [tags, setTags] = useState(initialQuiz?.tags?.join(", ") || "Assessment, Exam");
  const [thumbnail, setThumbnail] = useState(
    initialQuiz?.thumbnail ||
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialQuiz?.status || "PUBLISHED");

  // Settings State
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialQuiz?.settings.timeLimitMinutes ?? 20);
  const [passingScorePercentage, setPassingScorePercentage] = useState(
    initialQuiz?.settings.passingScorePercentage ?? 70
  );
  const [maxAttempts, setMaxAttempts] = useState(initialQuiz?.settings.maxAttempts ?? 3);
  const [randomizeQuestions, setRandomizeQuestions] = useState(
    initialQuiz?.settings.randomizeQuestions ?? true
  );
  const [randomizeOptions, setRandomizeOptions] = useState(
    initialQuiz?.settings.randomizeOptions ?? true
  );
  const [showAnswersAfterSubmission, setShowAnswersAfterSubmission] = useState(
    initialQuiz?.settings.showAnswersAfterSubmission ?? true
  );
  const [showExplanations, setShowExplanations] = useState(
    initialQuiz?.settings.showExplanations ?? true
  );
  const [requireFullscreen, setRequireFullscreen] = useState(
    initialQuiz?.settings.requireFullscreen ?? false
  );
  const [preventCopyPaste, setPreventCopyPaste] = useState(
    initialQuiz?.settings.preventCopyPaste ?? true
  );

  // Questions State
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || []);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    initialQuiz?.questions?.[0]?.id || null
  );

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type,
      questionText: `New ${type.replace(/_/g, " ")} Question`,
      marks: 3,
      difficulty: "Intermediate",
      category,
      tags: ["General"],
      explanation: "Add explanation text here.",
      options:
        type === "MULTIPLE_CHOICE" || type === "MULTIPLE_RESPONSE"
          ? [
              { id: "opt-1", text: "Option A", isCorrect: true },
              { id: "opt-2", text: "Option B", isCorrect: false },
              { id: "opt-3", text: "Option C", isCorrect: false },
            ]
          : type === "TRUE_FALSE"
          ? [
              { id: "tf-1", text: "True", isCorrect: true },
              { id: "tf-2", text: "False", isCorrect: false },
            ]
          : undefined,
      correctAnswerText:
        type === "SHORT_TEXT" || type === "FILL_IN_BLANK" ? "Correct Answer" : undefined,
      matchingPairs:
        type === "MATCHING"
          ? [
              { left: "Term 1", right: "Definition 1" },
              { left: "Term 2", right: "Definition 2" },
            ]
          : undefined,
      orderingItems:
        type === "ORDERING" ? ["Step 1: Planning", "Step 2: Execution", "Step 3: Review"] : undefined,
      createdBy: "Author",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions([...questions, newQ]);
    setEditingQuestionId(newQ.id);
  };

  const updateQuestion = (id: string, updatedFields: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedFields } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
  };

  const handleSaveQuiz = () => {
    if (!title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    const savedQuiz: Quiz = {
      id: initialQuiz?.id || `quiz-${Date.now()}`,
      title,
      description,
      category,
      instructions,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      thumbnail,
      status,
      createdBy: initialQuiz?.createdBy || "usr-instructor",
      createdByName: initialQuiz?.createdByName || "Prof. David Miller",
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions,
      totalQuestions: questions.length,
      totalMarks,
      assignedStudentsCount: initialQuiz?.assignedStudentsCount || 10,
      attemptsCount: initialQuiz?.attemptsCount || 0,
      avgScore: initialQuiz?.avgScore || 0,
      settings: {
        timeLimitMinutes: Number(timeLimitMinutes),
        passingScorePercentage: Number(passingScorePercentage),
        maxAttempts: Number(maxAttempts),
        randomizeQuestions,
        randomizeOptions,
        showAnswersAfterSubmission,
        showExplanations,
        requireFullscreen,
        preventCopyPaste,
        autoSaveIntervalSeconds: 3,
        isPublic: true,
      },
    };

    onSave(savedQuiz);
  };

  const activeQuestion = questions.find((q) => q.id === editingQuestionId);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {initialQuiz ? `Edit '${initialQuiz.title}'` : "Create New Assessment"}
            </h1>
            <p className="text-xs text-slate-500">
              {questions.length} questions • Total Marks: {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Bulk Upload / Paste Text</span>
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate with AI</span>
          </button>

          <button
            onClick={handleSaveQuiz}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Assessment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("QUESTIONS")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition-all ${
            activeTab === "QUESTIONS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileQuestion className="h-4 w-4" />
          <span>Questions ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition-all ${
            activeTab === "SETTINGS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Quiz Details & Proctoring Settings</span>
        </button>
      </div>

      {/* TAB 1: QUESTIONS EDITOR */}
      {activeTab === "QUESTIONS" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Questions List Navigation */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900">Question Outline</span>
                <span className="text-[11px] font-semibold text-blue-600">{questions.length} Total</span>
              </div>

              {/* Add Question Menu */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => addQuestion("MULTIPLE_CHOICE")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + MCQ (Single)
                </button>
                <button
                  onClick={() => addQuestion("MULTIPLE_RESPONSE")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + Multi-Select
                </button>
                <button
                  onClick={() => addQuestion("TRUE_FALSE")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + True / False
                </button>
                <button
                  onClick={() => addQuestion("SHORT_TEXT")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + Short Text
                </button>
                <button
                  onClick={() => addQuestion("PARAGRAPH")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + Essay / Free Text
                </button>
                <button
                  onClick={() => addQuestion("MATCHING")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  + Matching Pairs
                </button>
              </div>

              {/* Questions List */}
              <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    onClick={() => setEditingQuestionId(q.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      editingQuestionId === q.id
                        ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                        : "border-slate-200/80 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 text-[11px] font-black text-slate-700">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <p className="truncate text-xs font-bold text-slate-900">{q.questionText}</p>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {q.type.replace(/_/g, " ")} • {q.marks} pts
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(q.id);
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Question Editor Panel */}
          <div className="lg:col-span-8">
            {activeQuestion ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-900">
                    Editing Question ({activeQuestion.type.replace(/_/g, " ")})
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-600">Marks:</label>
                    <input
                      type="number"
                      value={activeQuestion.marks}
                      onChange={(e) => updateQuestion(activeQuestion.id, { marks: Number(e.target.value) })}
                      className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-center text-slate-900"
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Question Prompt / Statement *
                  </label>
                  <textarea
                    rows={3}
                    value={activeQuestion.questionText}
                    onChange={(e) => updateQuestion(activeQuestion.id, { questionText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                    placeholder="Enter full question text or prompt..."
                  />
                </div>

                {/* Option Authoring for MCQ / Multi-select / True-False */}
                {(activeQuestion.type === "MULTIPLE_CHOICE" ||
                  activeQuestion.type === "MULTIPLE_RESPONSE" ||
                  activeQuestion.type === "TRUE_FALSE") && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Answer Choices & Key (Check correct answers)
                    </label>

                    {(activeQuestion.options || []).map((opt, optIdx) => (
                      <div key={opt.id} className="flex items-center gap-2.5">
                        <input
                          type={activeQuestion.type === "MULTIPLE_RESPONSE" ? "checkbox" : "radio"}
                          checked={opt.isCorrect || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const updatedOptions = (activeQuestion.options || []).map((o) => {
                              if (activeQuestion.type === "MULTIPLE_CHOICE" || activeQuestion.type === "TRUE_FALSE") {
                                return { ...o, isCorrect: o.id === opt.id };
                              }
                              return o.id === opt.id ? { ...o, isCorrect: isChecked } : o;
                            });
                            updateQuestion(activeQuestion.id, { options: updatedOptions });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...(activeQuestion.options || [])];
                            newOpts[optIdx].text = e.target.value;
                            updateQuestion(activeQuestion.id, { options: newOpts });
                          }}
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Text or Fill in blank */}
                {(activeQuestion.type === "SHORT_TEXT" || activeQuestion.type === "FILL_IN_BLANK") && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Expected Correct Answer Text
                    </label>
                    <input
                      type="text"
                      value={activeQuestion.correctAnswerText || ""}
                      onChange={(e) => updateQuestion(activeQuestion.id, { correctAnswerText: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
                      placeholder="Exact correct answer string..."
                    />
                  </div>
                )}

                {/* Explanation & Hint */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Answer Explanation</label>
                    <textarea
                      rows={2}
                      value={activeQuestion.explanation || ""}
                      onChange={(e) => updateQuestion(activeQuestion.id, { explanation: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                      placeholder="Why is this answer correct?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Student Hint (Optional)</label>
                    <textarea
                      rows={2}
                      value={activeQuestion.hint || ""}
                      onChange={(e) => updateQuestion(activeQuestion.id, { hint: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                      placeholder="Optional clue for candidate..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                <FileQuestion className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm font-bold text-slate-700">Select or add a question to edit</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === "SETTINGS" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Assessment Details & Instructions</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Assessment Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 focus:border-blue-500 focus:bg-white"
                placeholder="e.g. AI & Machine Learning Essentials Certification"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Time Limit (Mins)</label>
                <input
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  value={passingScorePercentage}
                  onChange={(e) => setPassingScorePercentage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="font-bold text-slate-900">Proctoring & Anti-Cheat Controls</h3>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-bold text-slate-900">Prevent Copy / Paste</p>
                  <p className="text-[11px] text-slate-500">Disables right click and clipboard copying during exam</p>
                </div>
                <input
                  type="checkbox"
                  checked={preventCopyPaste}
                  onChange={(e) => setPreventCopyPaste(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-bold text-slate-900">Shuffle Questions</p>
                  <p className="text-[11px] text-slate-500">Randomize question order for each candidate</p>
                </div>
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      <AIQuestionGeneratorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onQuestionsGenerated={(aiQs) => {
          setQuestions([...questions, ...aiQs]);
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onQuestionsImported={(impQs) => {
          setQuestions([...questions, ...impQs]);
          if (impQs.length > 0 && !editingQuestionId) {
            setEditingQuestionId(impQs[0].id);
          }
        }}
      />
    </div>
  );
};
