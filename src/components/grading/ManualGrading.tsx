import React, { useState } from "react";
import { CheckSquare, User, Clock, FileText, Check, MessageSquare } from "lucide-react";
import { QuizAttempt, Quiz } from "../../types";

interface ManualGradingProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  onGradeEssay: (
    attemptId: string,
    questionId: string,
    obtainedMarks: number,
    feedback: string
  ) => void;
}

export const ManualGrading: React.FC<ManualGradingProps> = ({
  attempts,
  quizzes,
  onGradeEssay,
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>(attempts[0]?.id || "");
  const [givenMarks, setGivenMarks] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>("");

  const activeAttempt = attempts.find((a) => a.id === selectedAttemptId) || attempts[0];
  const activeQuiz = activeAttempt ? quizzes.find((q) => q.id === activeAttempt.quizId) : null;

  // Find essay questions in active quiz
  const essayQuestions = activeQuiz?.questions.filter((q) => q.type === "PARAGRAPH") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manual Essay & Free Text Grading</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Review essay answers submitted by candidates and assign score marks with instructor comments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List of Attempts requiring grading */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submitted Attempts
            </span>

            <div className="mt-3 space-y-2">
              {attempts.map((att) => (
                <button
                  key={att.id}
                  onClick={() => setSelectedAttemptId(att.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                    selectedAttemptId === att.id
                      ? "border border-blue-600 bg-blue-50/60 shadow-2xs"
                      : "border border-slate-200/80 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{att.studentName}</p>
                    <p className="line-clamp-1 text-[10px] text-slate-500">{att.quizTitle}</p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      att.status === "GRADING_PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {att.status === "GRADING_PENDING" ? "Pending" : "Graded"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Essay Grading Form */}
        <div className="lg:col-span-8 space-y-4">
          {activeAttempt && essayQuestions.length > 0 ? (
            essayQuestions.map((q) => {
              const studentAnswer = activeAttempt.answers[q.id];

              return (
                <div key={q.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900">
                      Essay Question ({q.marks} Max Marks)
                    </span>
                    <span className="text-xs font-bold text-blue-600">{activeAttempt.studentName}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">Prompt: {q.questionText}</p>
                    {q.explanation && (
                      <p className="mt-1 text-[11px] text-slate-500 italic">Reference Guide: {q.explanation}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Student Essay Response:</p>
                    <p className="text-xs text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                      {studentAnswer?.textAnswer || "No response submitted."}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-slate-800">Assign Score Marks (0 - {q.marks}):</label>
                      <input
                        type="number"
                        max={q.marks}
                        min={0}
                        value={givenMarks}
                        onChange={(e) => setGivenMarks(Number(e.target.value))}
                        className="w-20 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center font-bold text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Instructor Comments / Feedback</label>
                      <textarea
                        rows={2}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide feedback to candidate..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => {
                        onGradeEssay(activeAttempt.id, q.id, givenMarks, feedbackText);
                        alert("Grade saved successfully!");
                      }}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Essay Grade</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-700">No pending essay answers for this selection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
