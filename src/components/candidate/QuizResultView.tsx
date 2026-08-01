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
  FileText,
  AlertCircle,
  Type,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { QuizAttempt, Quiz, Certificate } from "../../types";
import { CertificateViewer } from "../certificates/CertificateViewer";
import { analyzeCharacterDiscrepancy } from "../../lib/questionUtils";
import { speakWord } from "../../lib/ttsEngine";

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
          <h2 className="text-base font-bold text-slate-900">Detailed Answer Review & Case Discrepancy Breakdown</h2>
          <p className="text-xs text-slate-500">
            Compare your submitted responses against correct reference keys, character differences, and recitation typos
          </p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const ans = attempt.answers[q.id];

            // Resolve Candidate's Submitted Answer Text
            let submittedAnswerText = "";
            if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_RESPONSE") {
              const selectedIds = ans?.selectedOptionIds || [];
              const selectedOpts = (q.options || []).filter((o) => selectedIds.includes(o.id));
              submittedAnswerText = selectedOpts.map((o) => o.text).join(", ");
            } else {
              submittedAnswerText = ans?.textAnswer || "";
            }

            // Resolve Correct Answer Reference Text
            let expectedAnswerText = "";
            if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_RESPONSE") {
              const correctOpts = (q.options || []).filter((o) => o.isCorrect);
              expectedAnswerText = correctOpts.map((o) => o.text).join(", ");
            } else {
              expectedAnswerText = q.spellingWord || q.correctAnswerText || q.explanation || "";
            }

            const isTextQuestion = q.type === "SHORT_TEXT" || q.type === "FILL_IN_BLANK" || q.type === "PARAGRAPH" || q.type === "SPELLING_BEE";
            const charDiff = isTextQuestion ? analyzeCharacterDiscrepancy(submittedAnswerText, expectedAnswerText) : null;

            // Treat case-insensitive matches as full marks passed!
            const isCorrect = (ans?.isCorrect || false) || Boolean(charDiff?.isCaseInsensitiveMatch);
            const obtainedMarks = isCorrect ? q.marks : (ans?.obtainedMarks || 0);

            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 space-y-4 transition-all ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-rose-200 bg-rose-50/20"
                }`}
              >
                {/* Question Header & Score */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {idx + 1}. {q.questionText}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-slate-500">
                          Marks: <strong className={isCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                            {obtainedMarks}
                          </strong> / {q.marks}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-extrabold text-slate-600 text-[10px]">
                          {q.type.replace(/_/g, " ")}
                        </span>
                        {q.type === "SPELLING_BEE" && (
                          <button
                            type="button"
                            onClick={() => speakWord(q.spellingWord || q.correctAnswerText || "")}
                            className="flex items-center gap-1 rounded-md bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 hover:bg-purple-200 transition-colors"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>▶ Replay Word</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleFetchAiExplanation(
                        q.id,
                        q.questionText,
                        submittedAnswerText || "No response provided",
                        expectedAnswerText || "Reference Key"
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

                {/* Submitted vs Expected Answer Display Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Candidate's Submitted Answer */}
                  <div className={`rounded-xl border p-3.5 ${
                    isCorrect
                      ? "border-emerald-200 bg-white"
                      : "border-rose-200 bg-white"
                  }`}>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-slate-500" />
                      <span>Your Submitted Answer</span>
                    </p>
                    <p className={`font-mono text-xs font-bold leading-relaxed ${
                      submittedAnswerText ? "text-slate-900" : "text-slate-400 italic"
                    }`}>
                      {submittedAnswerText || "(No Answer Provided)"}
                    </p>
                  </div>

                  {/* Correct Answer Reference */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      <span>Correct Answer Key</span>
                    </p>
                    <p className="font-mono text-xs font-bold text-blue-950 leading-relaxed">
                      {expectedAnswerText || "(Manual grading required)"}
                    </p>
                  </div>
                </div>

                {/* Character & Recitation Discrepancy Breakdown for Text/Recitation Questions */}
                {isTextQuestion && charDiff && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Type className="h-4 w-4 text-blue-600" />
                        <span>Recitation & Character Comparison Analysis</span>
                      </div>
                      {charDiff.isCaseInsensitiveMatch && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          Case-Insensitive Match Validated ✓
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                      <p>Submitted String length: <strong className="text-slate-900">{charDiff.submitted.length} chars</strong> | Expected String length: <strong className="text-slate-900">{charDiff.expected.length} chars</strong></p>
                      <p className="text-slate-700 italic font-sans">{charDiff.suggestion}</p>
                    </div>
                  </div>
                )}

                {/* Author Explanation */}
                {q.explanation && (
                  <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Instructor Explanation: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}

                {/* AI Tutor Explanation Box */}
                {aiExplanations[q.id] && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span>Gemini AI Tutor Explanation:</span>
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
