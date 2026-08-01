import React, { useState } from "react";
import { User } from "../../types";
import { authenticateUser, getUsers } from "../../lib/storage";
import {
  Sparkles,
  LogIn,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  BookOpen,
  UserCheck,
} from "lucide-react";

interface CandidateLoginPageProps {
  onCandidateLoggedIn: (user: User) => void;
  onInstructorPortalClick: () => void;
}

export const CandidateLoginPage: React.FC<CandidateLoginPageProps> = ({
  onCandidateLoggedIn,
  onInstructorPortalClick,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allUsers = getUsers();
  const candidateUsers = allUsers.filter((u) => u.role === "STUDENT");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter your candidate email address and password.");
      return;
    }

    const authenticated = authenticateUser(email, password);
    if (!authenticated) {
      setErrorMsg("Invalid credentials. Please verify the email and password provided by your instructor.");
      return;
    }

    onCandidateLoggedIn(authenticated);
  };

  const handleQuickCandidateLogin = (user: User) => {
    const defaultPass = user.password || "Password123!";
    const authenticated = authenticateUser(user.email, defaultPass);
    if (authenticated) {
      onCandidateLoggedIn(authenticated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-800 px-6 backdrop-blur-md bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">QuizPulse</span>
            <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-full">
              Candidate Portal
            </span>
          </div>
        </div>

        <button
          onClick={onInstructorPortalClick}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <UserCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Instructor / Admin Sign In</span>
        </button>
      </header>

      {/* Main Landing & Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-800 bg-blue-950/70 px-3.5 py-1 text-xs font-bold text-blue-300">
              <GraduationCap className="h-4 w-4 text-blue-400" />
              <span>Secure Online & Offline Candidate Assessment</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Attempt Your Assigned Tests & Certifications
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Welcome to QuizPulse Assessment Engine. Sign in using the credentials provided by your instructor or institution to attempt your assigned exams with full online and offline capability.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Assigned Exams</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Strictly scoped view of tests assigned to you.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>Full Offline Support</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Questions load and score instantly without internet.</p>
              </div>
            </div>
          </div>

          {/* Right Candidate Login Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Candidate Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter your student credentials to load your assigned tests</p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-800 p-3 text-xs font-medium text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Candidate Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@student.edu"
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Login Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password provided by instructor"
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-10 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In & Access My Tests</span>
                </button>
              </form>

              {/* Demo Candidate Quick Launchers */}
              {candidateUsers.length > 0 && (
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Candidate 1-Click Launchers:
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {candidateUsers.slice(0, 4).map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => handleQuickCandidateLogin(cand)}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-left hover:border-blue-600 hover:bg-slate-900 transition-all"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={cand.avatar} alt={cand.name} className="h-7 w-7 rounded-full border border-slate-700 object-cover" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{cand.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cand.email}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950">
        QuizPulse Candidate Assessment Engine • Apache-2.0 License • Full Offline-First Enabled
      </footer>
    </div>
  );
};
