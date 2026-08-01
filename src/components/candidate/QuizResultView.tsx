import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Download,
  HelpCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { QuizAttempt, Quiz, Certificate } from "../../types";
import { CertificateViewer } from "../certificates/CertificateViewer";

interface QuizResultViewProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  onRetake: () => void;
  onBackToDashboard: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  attempt,
  quiz,
  onRetake,
  onBackToDashboard,
}) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  // Burst confetti if passed
  useEffect(() => {
    if (attempt.isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.isPassed]);

  const handleFetchAiExplanation = async (questionId: string, questionText: string, studentAns: string, correctAns: string) => {
    setLoadingAiId(questionId);
    try {
      const res = await fetch("/api/ai/explain-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText,
          studentAnswer: studentAns,
          correctAnswer: correctAns,
        }),
      });

      const data = await res.json();
      if (data.success && data.explanation) {
        setAiExplanations((prev) => ({ ...prev, [questionId]: data.explanation }));
      }
    } catch (err) {
      console.error("AI explanation error:", err);
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retake Quiz</span>
        </button>
      </div>

      {/* Result Card Header */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-xl ${
          attempt.isPassed
            ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 shadow-emerald-900/10"
            : "bg-gradient-to-r from-rose-600 via-slate-800 to-slate-900 shadow-rose-900/10"
        }`}
      >
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Award className="h-4 w-4 text-amber-300" />
              <span>Assessment Completed</span>
            </div>

            <h1 className="mt-3 text-2xl font-black md:text-3xl">{quiz.title}</h1>

            <div className="mt-3 flex items-baseline gap-4">
              <span className="text-4xl font-black">{attempt.percentage}%</span>
              <span className="text-sm font-semibold opacity-90">
                Score: {attempt.score} / {attempt.totalMarks} Marks
              </span>
            </div>

            <p className="mt-1 text-xs font-medium text-white/80">
              Pass threshold: {quiz.settings.passingScorePercentage}% • Status:{" "}
              <span className="font-bold underline">{attempt.isPassed ? "PASSED" : "FAILED"}</span>
            </p>
          </div>

          {/* Certificate Action */}
          {attempt.isPassed && (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-emerald-900 shadow-xl transition-transform hover:scale-105"
            >
              <Award className="h-5 w-5 text-emerald-600" />
              <span>View & Download Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Answer Breakdown & Explanations</h2>
          <p className="text-xs text-slate-500">Review correct keys or generate step-by-step AI explanation</p>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, idx) => {
            const ans = attempt.answers[q.id];
            const isCorrect = ans?.isCorrect || false;
            const correctOpt = q.options?.find((o) => o.isCorrect);

            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-4 space-y-3 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-rose-200 bg-rose-50/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {idx + 1}. {q.questionText}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Marks Obtained: {ans?.obtainedMarks || 0} / {q.marks}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleFetchAiExplanation(
                        q.id,
                        q.questionText,
                        ans?.selectedOptionIds?.join(", ") || ans?.textAnswer || "None",
                        correctOpt?.text || q.correctAnswerText || "Reference Key"
                      )
                    }
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                  >
                    {loadingAiId === q.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>Ask AI Tutor</span>
                  </button>
                </div>

                {q.explanation && (
                  <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Author Explanation: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}

                {/* AI Explanation Box */}
                {aiExplanations[q.id] && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span>Gemini AI Tutor Guidance:</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{aiExplanations[q.id]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {showCertificate && (
        <CertificateViewer
          studentName={attempt.studentName}
          quizTitle={quiz.title}
          issueDate={attempt.submittedAt || new Date().toISOString()}
          scorePercentage={attempt.percentage}
          verificationCode={`QP-2026-${attempt.id.slice(-6)}`}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
