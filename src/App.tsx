/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  initStorage,
  subscribeState,
  getCurrentUser,
  setCurrentUserRole,
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  duplicateQuiz,
  getAttempts,
  saveAttempt,
  gradeEssayAnswer,
  getQuestionBanks,
  saveQuestionBank,
  getAuditLogs,
  getUsers,
  getCertificates,
  getQuizAssignments,
  switchUser,
  authenticateByVoucherCode,
  authenticateByVoucherCodeAsync,
  clearAllQuizzesAndReset,
} from "./lib/storage";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { QuizList } from "./components/quizzes/QuizList";
import { QuizBuilder } from "./components/quizzes/QuizBuilder";
import { QuizPlayer } from "./components/candidate/QuizPlayer";
import { QuizResultView } from "./components/candidate/QuizResultView";
import { QuestionBankView } from "./components/questions/QuestionBank";
import { BulkImportModal } from "./components/questions/BulkImportModal";
import { ManualGrading } from "./components/grading/ManualGrading";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { AdminPanel } from "./components/admin/AdminPanel";
import { UserProfileModal } from "./components/profile/UserProfileModal";
import { AuthModal } from "./components/auth/AuthModal";
import { QuizAnswerAuditModal } from "./components/quizzes/QuizAnswerAuditModal";
import { StudentAssignmentPortal } from "./components/instructor/StudentAssignmentPortal";
import { CandidateLoginPage } from "./components/candidate/CandidateLoginPage";
import { CandidateStudentPortal } from "./components/candidate/CandidateStudentPortal";
import { OfflineStatusBanner } from "./components/common/OfflineStatusBanner";
import { UserRole, Quiz, QuizAttempt, Question, User } from "./types";

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Logged out / Landing Page Session state (default to true when visiting root domain directly)
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const passParam = params.get("pass") || params.get("voucher") || params.get("code");
      if (passParam) return false;
      return sessionStorage.getItem("quizpulse_active_session") !== "true";
    }
    return true;
  });

  // Selected Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [auditingQuiz, setAuditingQuiz] = useState<Quiz | null>(null);

  // User Profile & Auth Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingTargetUser, setEditingTargetUser] = useState<User | null>(null);

  // Other Modals
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Initialize storage on mount & process candidate voucher URL parameter asynchronously
  useEffect(() => {
    initStorage();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const passParam = params.get("pass") || params.get("voucher") || params.get("code");
      const quizIdParam = params.get("quizId") || params.get("quiz");
      const userIdParam = params.get("userId") || params.get("user");

      if (passParam) {
        authenticateByVoucherCodeAsync(passParam, quizIdParam || undefined, userIdParam || undefined).then((result) => {
          setInitialized(true);
          if (result && result.user) {
            sessionStorage.setItem("quizpulse_active_session", "true");
            setIsLoggedOut(false);
            if (result.quiz) {
              setSelectedQuiz(result.quiz);
              setCurrentView("take-quiz");
            } else {
              setCurrentView("dashboard");
            }
            // Clean query parameters from address bar
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }).catch(() => {
          setInitialized(true);
        });
        return;
      }
    }
    setInitialized(true);
  }, []);

  // Subscribe to storage changes
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeState(() => setTick((t) => t + 1));
  }, []);

  if (!initialized) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading QuizPulse...</div>;
  }

  const currentUser = getCurrentUser();
  const quizzes = getQuizzes();
  const attempts = getAttempts();
  const questionBanks = getQuestionBanks();
  const auditLogs = getAuditLogs();
  const users = getUsers();
  const certificates = getCertificates();
  const assignments = getQuizAssignments();

  // If candidate is logged out, render candidate landing & login page
  if (isLoggedOut) {
    return (
      <CandidateLoginPage
        onCandidateLoggedIn={(candUser) => {
          sessionStorage.setItem("quizpulse_active_session", "true");
          setIsLoggedOut(false);
          setCurrentView("dashboard");
          setTick((t) => t + 1);
        }}
        onVoucherAuthenticated={(candUser, targetQuiz) => {
          sessionStorage.setItem("quizpulse_active_session", "true");
          setIsLoggedOut(false);
          setTick((t) => t + 1);
          if (targetQuiz) {
            setSelectedQuiz(targetQuiz);
            setCurrentView("take-quiz");
          } else {
            setCurrentView("dashboard");
          }
        }}
        onInstructorPortalClick={() => {
          sessionStorage.setItem("quizpulse_active_session", "true");
          setIsLoggedOut(false);
          setCurrentUserRole("INSTRUCTOR");
          setCurrentView("dashboard");
        }}
      />
    );
  }

  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    setCurrentView("dashboard");
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    saveQuiz(quiz);
    setCurrentView("quizzes");
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView("take-quiz");
  };

  const handleCompleteAttempt = (attempt: QuizAttempt) => {
    saveAttempt(attempt);
    setActiveAttempt(attempt);
    setCurrentView("quiz-result");
  };

  const handleQuestionsImported = (importedQs: Question[]) => {
    if (questionBanks.length > 0) {
      const bank = { ...questionBanks[0] };
      bank.questions = [...(bank.questions || []), ...importedQs];
      bank.totalQuestions = bank.questions.length;
      saveQuestionBank(bank);
      alert(`Imported ${importedQs.length} questions into '${bank.title}'!`);
    }
  };

  // Get candidate assigned quizzes list
  const isStudent = currentUser.role === "STUDENT";
  const candidateAssignedQuizzes = quizzes.filter((q) => {
    if (!isStudent) return true;
    const assignedIds = currentUser.assignedQuizIds || [];
    return assignedIds.includes(q.id) || q.id === "quiz-ai-core"; // fallback seed assignment
  });

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("quizpulse_active_session");
    }
    setIsLoggedOut(true);
  };

  const handleInspectAttempt = (att: QuizAttempt) => {
    setActiveAttempt(att);
    const q = quizzes.find((x) => x.id === att.quizId);
    if (q) setSelectedQuiz(q);
    setCurrentView("quiz-result");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Offline Status Banner */}
      <OfflineStatusBanner />

      {/* Top Navigation Bar */}
      {currentView !== "take-quiz" && (
        <Header
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={(v) => setCurrentView(v)}
          onOpenProfileModal={() => {
            setEditingTargetUser(currentUser);
            setShowProfileModal(true);
          }}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Layout Area */}
      {currentView === "take-quiz" && selectedQuiz ? (
        <QuizPlayer
          quiz={selectedQuiz}
          currentUser={currentUser}
          onCompleteAttempt={handleCompleteAttempt}
          onCancel={() => setCurrentView("quizzes")}
        />
      ) : (
        <div className="flex flex-1">
          <Sidebar
            currentView={currentView}
            onNavigate={(v) => setCurrentView(v)}
            userRole={currentUser.role}
            pendingGradingCount={attempts.filter((a) => a.status === "GRADING_PENDING").length}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* If Student/Candidate is logged in, show dedicated Candidate Student Portal on dashboard view */}
            {currentView === "dashboard" && isStudent && (
              <CandidateStudentPortal
                candidateUser={currentUser}
                assignedQuizzes={candidateAssignedQuizzes}
                attempts={attempts}
                certificates={certificates}
                onStartQuiz={handleStartQuiz}
                onSignOut={handleSignOut}
              />
            )}

            {currentView === "dashboard" && !isStudent && (
              <Dashboard
                currentUser={currentUser}
                quizzes={quizzes}
                attempts={attempts}
                onNavigate={(v) => setCurrentView(v)}
                onSelectQuizToTake={handleStartQuiz}
                onCreateQuizClick={() => {
                  setSelectedQuiz(null);
                  setCurrentView("create-quiz");
                }}
                onInspectAttempt={handleInspectAttempt}
              />
            )}

            {currentView === "quizzes" && (
              <QuizList
                quizzes={quizzes}
                userRole={currentUser.role}
                currentUser={currentUser}
                onSelectQuizToTake={handleStartQuiz}
                onEditQuiz={(q) => {
                  setSelectedQuiz(q);
                  setCurrentView("edit-quiz");
                }}
                onCreateQuiz={() => {
                  setSelectedQuiz(null);
                  setCurrentView("create-quiz");
                }}
                onDuplicateQuiz={(id) => duplicateQuiz(id)}
                onDeleteQuiz={(id) => deleteQuiz(id)}
                onAuditAnswerKeys={(quiz) => setAuditingQuiz(quiz)}
                onClearAllQuizzes={() => {
                  clearAllQuizzesAndReset();
                  setTick((t) => t + 1);
                }}
              />
            )}

            {currentView === "student-assignments" && (
              <StudentAssignmentPortal
                users={users}
                quizzes={quizzes}
                assignments={assignments}
                onRefreshData={() => setTick((t) => t + 1)}
              />
            )}

            {(currentView === "create-quiz" || currentView === "edit-quiz") && (
              <QuizBuilder
                initialQuiz={selectedQuiz}
                onSave={handleSaveQuiz}
                onCancel={() => setCurrentView("quizzes")}
              />
            )}

            {currentView === "quiz-result" && activeAttempt && selectedQuiz && (
              <QuizResultView
                attempt={activeAttempt}
                quiz={selectedQuiz}
                onRetake={() => setCurrentView("take-quiz")}
                onBackToDashboard={() => setCurrentView("dashboard")}
              />
            )}

            {currentView === "question-bank" && (
              <QuestionBankView
                banks={questionBanks}
                onOpenBulkUpload={() => setShowBulkUploadModal(true)}
                onSaveBank={saveQuestionBank}
              />
            )}

            {currentView === "bulk-import" && (
              <div className="space-y-4">
                <QuestionBankView
                  banks={questionBanks}
                  onOpenBulkUpload={() => setShowBulkUploadModal(true)}
                  onSaveBank={saveQuestionBank}
                />
              </div>
            )}

            {currentView === "manual-grading" && (
              <ManualGrading
                attempts={attempts}
                quizzes={quizzes}
                onGradeEssay={(attemptId, qId, marks, feedback) => {
                  gradeEssayAnswer(attemptId, qId, marks, feedback);
                }}
              />
            )}

            {currentView === "analytics" && (
              <AnalyticsDashboard quizzes={quizzes} attempts={attempts} />
            )}

            {currentView === "certificates" && (
              <AnalyticsDashboard quizzes={quizzes} attempts={attempts} />
            )}

            {currentView === "admin-panel" && (
              <AdminPanel
                users={users}
                auditLogs={auditLogs}
                organizations={[]}
                onUserChange={() => setTick((t) => t + 1)}
                onEditUserProfile={(targetUser) => {
                  setEditingTargetUser(targetUser);
                  setShowProfileModal(true);
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* Profile Settings Modal */}
      {editingTargetUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          currentUser={editingTargetUser}
          onClose={() => {
            setShowProfileModal(false);
            setEditingTargetUser(null);
          }}
          onUserUpdated={() => setTick((t) => t + 1)}
        />
      )}

      {/* Auth & Profile Switcher Modal */}
      <AuthModal
        isOpen={showAuthModal}
        users={users}
        currentUser={currentUser}
        onClose={() => setShowAuthModal(false)}
        onUserAuthenticated={() => setTick((t) => t + 1)}
      />

      {/* Answer Keys & Corrections Audit Modal */}
      {auditingQuiz && (
        <QuizAnswerAuditModal
          isOpen={Boolean(auditingQuiz)}
          quiz={auditingQuiz}
          onClose={() => setAuditingQuiz(null)}
          onQuizUpdated={() => setTick((t) => t + 1)}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkImportModal
        isOpen={showBulkUploadModal || currentView === "bulk-import"}
        onClose={() => setShowBulkUploadModal(false)}
        onQuestionsImported={handleQuestionsImported}
      />
    </div>
  );
}
