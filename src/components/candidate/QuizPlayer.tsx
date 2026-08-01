import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Save,
  HelpCircle,
  Sparkles,
  Shuffle,
  Volume2,
  RotateCcw,
} from "lucide-react";
import { Quiz, Question, QuizAttempt, AnswerSubmission, User } from "../../types";
import { evaluateCaseInsensitiveMatch } from "../../lib/questionUtils";
import { speakWord, stopSpeech } from "../../lib/ttsEngine";

interface QuizPlayerProps {
  quiz: Quiz;
  currentUser: User;
  onCompleteAttempt: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

// Fisher-Yates Shuffle Helper
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  currentUser,
  onCompleteAttempt,
  onCancel,
}) => {
  // Initialize prepared questions (apply shuffle settings if enabled)
  const [preparedQuestions] = useState<Question[]>(() => {
    let list = [...(quiz.questions || [])];

    if (quiz.settings?.randomizeQuestions) {
      list = shuffleArray(list);
    }

    if (quiz.settings?.randomizeOptions) {
      list = list.map((q) => {
        if (q.options && q.options.length > 0) {
          return { ...q, options: shuffleArray(q.options) };
        }
        return q;
      });
    }

    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>("Just now");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [proctoringWarnings, setProctoringWarnings] = useState<string[]>([]);

  // Timer setup
  const totalSeconds = quiz.settings.timeLimitMinutes > 0 ? quiz.settings.timeLimitMinutes * 60 : 3600;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  const startTimeRef = useRef<string>(new Date().toISOString());

  // Countdown timer effect
  useEffect(() => {
    if (quiz.settings.timeLimitMinutes <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinalAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.settings.timeLimitMinutes]);

  // Anti-cheat / focus loss listener
  useEffect(() => {
    if (!quiz.settings.preventCopyPaste) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const warning = `Tab switch detected at ${new Date().toLocaleTimeString()}`;
        setProctoringWarnings((prev) => [...prev, warning]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [quiz.settings.preventCopyPaste]);

  const currentQuestion = preparedQuestions[currentIndex] || preparedQuestions[0];

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || { questionId, selectedOptionIds: [] };
      let newSelected: string[] = [];

      if (isMulti) {
        const currentArr = existing.selectedOptionIds || [];
        if (currentArr.includes(optionId)) {
          newSelected = currentArr.filter((id) => id !== optionId);
        } else {
          newSelected = [...currentArr, optionId];
        }
      } else {
        newSelected = [optionId];
      }

      return {
        ...prev,
        [questionId]: {
          ...existing,
          selectedOptionIds: newSelected,
        },
      };
    });

    setLastAutoSaveTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        textAnswer: text,
      },
    }));
    setLastAutoSaveTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(questionId)) copy.delete(questionId);
      else copy.add(questionId);
      return copy;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSubmitFinalAttempt = () => {
    let obtainedMarks = 0;

    // Calculate objective scores against preparedQuestions
    preparedQuestions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) return;

      if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
        const selectedId = ans.selectedOptionIds?.[0];
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (selectedId && correctOpt && selectedId === correctOpt.id) {
          obtainedMarks += q.marks;
          ans.obtainedMarks = q.marks;
          ans.isCorrect = true;
        } else {
          ans.obtainedMarks = 0;
          ans.isCorrect = false;
        }
      } else if (q.type === "MULTIPLE_RESPONSE") {
        const correctOptIds = new Set(q.options?.filter((o) => o.isCorrect).map((o) => o.id));
        const selectedOptIds = new Set(ans.selectedOptionIds || []);

        const isExactMatch =
          correctOptIds.size === selectedOptIds.size &&
          [...correctOptIds].every((id) => selectedOptIds.has(id));

        if (isExactMatch) {
          obtainedMarks += q.marks;
          ans.obtainedMarks = q.marks;
          ans.isCorrect = true;
        } else {
          ans.obtainedMarks = 0;
          ans.isCorrect = false;
        }
      } else if (q.type === "SHORT_TEXT" || q.type === "FILL_IN_BLANK" || q.type === "PARAGRAPH" || q.type === "SPELLING_BEE") {
        const expectedRef = q.spellingWord || q.correctAnswerText || q.explanation || "";
        const isMatched = evaluateCaseInsensitiveMatch(ans.textAnswer, expectedRef);
        if (isMatched) {
          obtainedMarks += q.marks;
          ans.obtainedMarks = q.marks;
          ans.isCorrect = true;
        } else if (q.type === "PARAGRAPH" && !expectedRef) {
          // Requires manual grading by instructor only if no reference text is specified
          ans.isGradedManually = false;
          ans.obtainedMarks = 0;
          ans.isCorrect = false;
        } else {
          ans.obtainedMarks = 0;
          ans.isCorrect = false;
        }
      }
    });

    const timeSpentSeconds = totalSeconds - secondsRemaining;
    const percentage = parseFloat(((obtainedMarks / (quiz.totalMarks || 1)) * 100).toFixed(1));
    const isPassed = percentage >= quiz.settings.passingScorePercentage;

    // Check if any question requires manual grading
    const hasManualEssay = preparedQuestions.some((q) => q.type === "PARAGRAPH");

    const finalAttempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      startedAt: startTimeRef.current,
      submittedAt: new Date().toISOString(),
      status: hasManualEssay ? "GRADING_PENDING" : "COMPLETED",
      answers,
      score: obtainedMarks,
      totalMarks: quiz.totalMarks,
      percentage,
      isPassed,
      timeSpentSeconds,
    };

    onCompleteAttempt(finalAttempt);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeWarning = secondsRemaining <= 300; // 5 minutes warning

  const totalAnsweredCount = Object.keys(answers).filter(
    (key) =>
      (answers[key]?.selectedOptionIds && answers[key].selectedOptionIds!.length > 0) ||
      (answers[key]?.textAnswer && answers[key].textAnswer!.trim().length > 0)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Quiz Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-white">
            Exit Quiz
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate max-w-md">{quiz.title}</h1>
              {quiz.settings?.randomizeQuestions && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-900/60 border border-blue-700/50 px-2 py-0.5 text-[9px] font-extrabold text-blue-300">
                  <Shuffle className="h-2.5 w-2.5" />
                  <span>Shuffled</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Candidate: <span className="text-slate-200 font-semibold">{currentUser.name}</span>
            </p>
          </div>
        </div>

        {/* Timer & Fullscreen Controls */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-1.5 font-mono text-sm font-black border ${
              isTimeWarning
                ? "bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse"
                : "bg-slate-900 text-blue-400 border-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-4xl mx-auto">
          {/* Question Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-900/60 text-blue-300 px-2.5 py-1 font-bold">
                Question {currentIndex + 1} of {preparedQuestions.length}
              </span>
              <span className="text-slate-400">• {currentQuestion.marks} Marks</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Save className="h-3 w-3 text-emerald-400" />
                <span>Auto-saved</span>
              </span>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  flaggedIds.has(currentQuestion.id)
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flaggedIds.has(currentQuestion.id) ? "Flagged" : "Flag"}</span>
              </button>
            </div>
          </div>

          {/* Question Text Prompt */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white leading-relaxed md:text-lg">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.mediaUrl && (
              <div className="rounded-2xl border border-slate-800 overflow-hidden max-w-md">
                <img src={currentQuestion.mediaUrl} alt="Media" className="w-full object-cover" />
              </div>
            )}
          </div>

          {/* Options / Input Controls */}
          <div className="mt-6 space-y-3">
            {(currentQuestion.type === "MULTIPLE_CHOICE" ||
              currentQuestion.type === "MULTIPLE_RESPONSE" ||
              currentQuestion.type === "TRUE_FALSE") && (
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt) => {
                  const isMulti = currentQuestion.type === "MULTIPLE_RESPONSE";
                  const selectedArr = answers[currentQuestion.id]?.selectedOptionIds || [];
                  const isSelected = selectedArr.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id, isMulti)}
                      className={`flex items-center gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/40 text-white font-semibold shadow-md"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-${
                          isMulti ? "md" : "full"
                        } border ${
                          isSelected
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-slate-600 bg-slate-950"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs md:text-sm">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {(currentQuestion.type === "SHORT_TEXT" || currentQuestion.type === "FILL_IN_BLANK") && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  Type your concise answer below:
                </label>
                <input
                  type="text"
                  value={answers[currentQuestion.id]?.textAnswer || ""}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Enter response..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {currentQuestion.type === "PARAGRAPH" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  Type your detailed free-text essay response below:
                </label>
                <textarea
                  rows={6}
                  value={answers[currentQuestion.id]?.textAnswer || ""}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Write your explanation or essay..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {currentQuestion.type === "SPELLING_BEE" && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-purple-800/80 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
                        <Volume2 className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Spelling Bee Pronunciation</h4>
                        <p className="text-[11px] text-purple-300">Listen to the spoken word and type the spelling below</p>
                      </div>
                    </div>

                    {/* Audio Play & Replay Button */}
                    <button
                      type="button"
                      disabled={(playCounts[currentQuestion.id] || 0) >= (currentQuestion.maxPlays ?? 3)}
                      onClick={() => {
                        const currentPlays = playCounts[currentQuestion.id] || 0;
                        const maxPlays = currentQuestion.maxPlays ?? 3;
                        if (currentPlays < maxPlays) {
                          setPlayCounts((prev) => ({ ...prev, [currentQuestion.id]: currentPlays + 1 }));
                          speakWord(currentQuestion.spellingWord || currentQuestion.correctAnswerText || "");
                        }
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-purple-500/30 hover:bg-purple-500 disabled:opacity-40 transition-all"
                    >
                      {(playCounts[currentQuestion.id] || 0) === 0 ? (
                        <>
                          <Volume2 className="h-4 w-4 fill-white" />
                          <span>▶ Play Word</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          <span>🔁 Replay Word</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Play Count & Remaining Replays Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-200">
                      Audio Replays Used: <strong className="text-white font-mono font-bold">{playCounts[currentQuestion.id] || 0}</strong> / {currentQuestion.maxPlays ?? 3}
                    </span>
                    {(playCounts[currentQuestion.id] || 0) >= (currentQuestion.maxPlays ?? 3) && (
                      <span className="rounded-md bg-rose-950 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                        Max Replay Limit Reached
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional Hint Clue Accordion */}
                {currentQuestion.hint && (
                  <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-3.5 text-xs text-blue-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-blue-400">
                      <HelpCircle className="h-4 w-4" />
                      <span>💡 Word Clue / Hint:</span>
                    </div>
                    <p className="pl-6 font-medium italic text-slate-300">{currentQuestion.hint}</p>
                  </div>
                )}

                {/* Candidate Spelling Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Type Your Spelling Answer Below *
                  </label>
                  <input
                    type="text"
                    value={answers[currentQuestion.id]?.textAnswer || ""}
                    onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Type the exact spelling here..."
                    className="w-full rounded-2xl border border-purple-800/80 bg-slate-950 p-4 font-mono text-base font-bold text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none tracking-wider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(preparedQuestions.length - 1, prev + 1))}
              disabled={currentIndex === preparedQuestions.length - 1}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
            >
              <span>Next Question</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Question Palette */}
        <div className="hidden w-72 shrink-0 border-l border-slate-800 bg-slate-950 p-5 md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Question Palette
          </h3>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {preparedQuestions.map((q, idx) => {
              const isAnswered =
                (answers[q.id]?.selectedOptionIds && answers[q.id].selectedOptionIds!.length > 0) ||
                (answers[q.id]?.textAnswer && answers[q.id].textAnswer!.trim().length > 0);

              const isFlagged = flaggedIds.has(q.id);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${
                    isCurrent
                      ? "ring-2 ring-blue-500 bg-blue-600 text-white"
                      : isFlagged
                      ? "bg-amber-500/30 text-amber-300 border border-amber-500/60"
                      : isAnswered
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 text-[11px] font-medium text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500"></span>
              <span>Answered ({totalAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-amber-500"></span>
              <span>Flagged ({flaggedIds.size})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-slate-700"></span>
              <span>Unanswered ({preparedQuestions.length - totalAnsweredCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Submit Assessment?</h2>
            <p className="mt-2 text-xs text-slate-400">
              You have answered <span className="font-bold text-white">{totalAnsweredCount}</span> out of{" "}
              <span className="font-bold text-white">{preparedQuestions.length}</span> questions.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-300"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitFinalAttempt}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
