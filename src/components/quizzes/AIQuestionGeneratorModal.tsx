import React, { useState } from "react";
import { Sparkles, Loader2, X, Check, HelpCircle } from "lucide-react";
import { Question } from "../../types";

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (generatedQuestions: Question[]) => void;
}

export const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
}) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please specify a subject or topic for question generation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount: count,
          questionTypes: ["MULTIPLE_CHOICE", "MULTIPLE_RESPONSE", "TRUE_FALSE", "SHORT_TEXT"],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server failed to generate questions.");
      }

      // Format generated questions with IDs
      const formattedQuestions: Question[] = (data.questions || []).map((q: any, i: number) => ({
        id: `ai-q-${Date.now()}-${i}`,
        type: q.type || "MULTIPLE_CHOICE",
        questionText: q.questionText || "Untitled AI Question",
        options: q.options || [
          { id: "opt-1", text: "Option A", isCorrect: true },
          { id: "opt-2", text: "Option B", isCorrect: false },
        ],
        correctAnswerText: q.correctAnswerText || "",
        marks: q.marks || 2,
        difficulty: (q.difficulty as any) || difficulty,
        category: q.category || topic,
        tags: q.tags || [topic, "AI Generated"],
        explanation: q.explanation || "",
        hint: q.hint || "",
        createdBy: "AI Author",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      onQuestionsGenerated(formattedQuestions);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during AI generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Question Generator</h2>
              <p className="text-xs text-slate-500">Powered by Gemini 3.6 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 font-medium text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Topic or Subject Matter *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Python Data Structures, World War II History, Cardiology Fundamentals"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Question Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/60 p-3 text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>What AI generates:</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Structured questions with correct answer key, explanations, distractor choices, and hints tailored to your specified difficulty.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
