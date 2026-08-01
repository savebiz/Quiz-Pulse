import React, { useState } from "react";
import { Quiz, Question, QuestionType, OptionItem } from "../../types";
import { saveQuiz, regradeQuizAttempts } from "../../lib/storage";
import {
  convertQuestionType,
  convertAllQuestionsType,
  getCorrectAnswerSnippet,
} from "../../lib/questionUtils";
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Save,
  ShieldCheck,
  CheckSquare,
  Sparkles,
} from "lucide-react";

interface QuizAnswerAuditModalProps {
  isOpen: boolean;
  quiz: Quiz | null;
  onClose: () => void;
  onQuizUpdated: () => void;
}

export const QuizAnswerAuditModal: React.FC<QuizAnswerAuditModalProps> = ({
  isOpen,
  quiz,
  onClose,
  onQuizUpdated,
}) => {
  if (!isOpen || !quiz) return null;

  const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    quiz.questions[0]?.id || ""
  );
  const [batchTargetType, setBatchTargetType] = useState<QuestionType>("PARAGRAPH");
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regradeNotice, setRegradeNotice] = useState<string | null>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleSingleTypeChange = (id: string, newType: QuestionType) => {
    setQuestions(
      questions.map((q) => (q.id === id ? convertQuestionType(q, newType) : q))
    );
  };

  const handleBatchConvert = () => {
    const converted = convertAllQuestionsType(questions, batchTargetType);
    setQuestions(converted);
    setShowBatchConfirm(false);
    setRegradeNotice(`Converted all ${questions.length} questions to ${batchTargetType.replace(/_/g, " ")}.`);
  };

  const handleSaveCorrections = () => {
    setIsSaving(true);
    const updatedQuiz: Quiz = {
      ...quiz,
      questions,
      totalQuestions: questions.length,
      totalMarks: questions.reduce((sum, q) => sum + (q.marks || 0), 0),
      updatedAt: new Date().toISOString(),
    };

    saveQuiz(updatedQuiz);
    const regraded = regradeQuizAttempts(quiz.id);

    setIsSaving(false);
    if (regraded > 0) {
      alert(`Answer key corrections saved! Automatically regraded ${regraded} existing candidate attempt(s).`);
    } else {
      alert("Answer key corrections saved successfully!");
    }

    onQuizUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Answer Key & Correction Audit</h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-800">
                  {quiz.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">{quiz.title} • {questions.length} Questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchConfirm(!showBatchConfirm)}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Batch Convert All Types</span>
            </button>

            <button
              onClick={handleSaveCorrections}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Corrections & Auto-Regrade"}</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Batch Convert Toolbar Banner */}
        {showBatchConfirm && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-purple-50 p-3 text-xs border border-purple-200">
            <div className="flex items-center gap-3">
              <span className="font-bold text-purple-900">Batch Target Type:</span>
              <select
                value={batchTargetType}
                onChange={(e) => setBatchTargetType(e.target.value as QuestionType)}
                className="rounded-xl border border-purple-300 bg-white px-3 py-1 font-bold text-purple-900 focus:outline-none"
              >
                <option value="PARAGRAPH">Essay / Free Text</option>
                <option value="SHORT_TEXT">Short Text</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Single)</option>
                <option value="MULTIPLE_RESPONSE">Multiple Response (Multi-Select)</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
            </div>
            <button
              onClick={handleBatchConvert}
              className="rounded-xl bg-purple-700 px-3.5 py-1 text-xs font-bold text-white hover:bg-purple-800"
            >
              Apply to All {questions.length} Questions
            </button>
          </div>
        )}

        {regradeNotice && (
          <div className="mt-2 rounded-xl bg-blue-50 p-2.5 text-xs font-semibold text-blue-800 border border-blue-200 flex items-center justify-between">
            <span>{regradeNotice}</span>
            <button onClick={() => setRegradeNotice(null)} className="text-blue-500 hover:text-blue-800">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Audit Body */}
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Questions List */}
          <div className="lg:col-span-5 border-r border-slate-100 pr-3 overflow-y-auto space-y-2">
            {questions.map((q, idx) => {
              const snippet = getCorrectAnswerSnippet(q);
              const isSel = selectedQuestion && selectedQuestion.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`w-full flex flex-col p-3 rounded-2xl border text-left transition-all ${
                    isSel
                      ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Q{idx + 1}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {q.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-900 line-clamp-2">{q.questionText}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold truncate max-w-[200px]">
                      {snippet}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{q.marks} PTS</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Key Correction Inspector */}
          <div className="lg:col-span-7 overflow-y-auto pl-1 space-y-4">
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Question Type:</span>
                    <select
                      value={selectedQuestion.type}
                      onChange={(e) => handleSingleTypeChange(selectedQuestion.id, e.target.value as QuestionType)}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-900 focus:outline-none"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice (Single)</option>
                      <option value="MULTIPLE_RESPONSE">Multiple Response (Multi-Select)</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_TEXT">Short Text</option>
                      <option value="PARAGRAPH">Essay / Free Text</option>
                      <option value="FILL_IN_BLANK">Fill in Blank</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Marks:</span>
                    <input
                      type="number"
                      value={selectedQuestion.marks}
                      onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { marks: Number(e.target.value) })}
                      className="w-14 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Question Prompt</label>
                  <textarea
                    rows={2}
                    value={selectedQuestion.questionText}
                    onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { questionText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>

                {/* Answer Key Options editing */}
                {(selectedQuestion.type === "MULTIPLE_CHOICE" ||
                  selectedQuestion.type === "MULTIPLE_RESPONSE" ||
                  selectedQuestion.type === "TRUE_FALSE") && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Answer Choices & Correct Key (Check to mark correct)
                    </label>
                    <div className="space-y-2">
                      {(selectedQuestion.options || []).map((opt, oIdx) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <input
                            type={selectedQuestion.type === "MULTIPLE_RESPONSE" ? "checkbox" : "radio"}
                            checked={opt.isCorrect || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const updatedOptions = (selectedQuestion.options || []).map((o) => {
                                if (selectedQuestion.type === "MULTIPLE_CHOICE" || selectedQuestion.type === "TRUE_FALSE") {
                                  return { ...o, isCorrect: o.id === opt.id };
                                }
                                return o.id === opt.id ? { ...o, isCorrect: isChecked } : o;
                              });
                              handleUpdateQuestion(selectedQuestion.id, { options: updatedOptions });
                            }}
                            className="h-4 w-4 text-emerald-600"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...(selectedQuestion.options || [])];
                              newOpts[oIdx].text = e.target.value;
                              handleUpdateQuestion(selectedQuestion.id, { options: newOpts });
                            }}
                            className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedQuestion.type === "SHORT_TEXT" || selectedQuestion.type === "FILL_IN_BLANK") && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expected Correct Text Key</label>
                    <input
                      type="text"
                      value={selectedQuestion.correctAnswerText || ""}
                      onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { correctAnswerText: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Answer Explanation</label>
                  <textarea
                    rows={2}
                    value={selectedQuestion.explanation || ""}
                    onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { explanation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
