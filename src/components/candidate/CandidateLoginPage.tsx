import React, { useState, useEffect } from "react";
import { User, Quiz } from "../../types";
import { authenticateUser, authenticateByVoucherCode, getUsers } from "../../lib/storage";
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
  Ticket,
  Play,
} from "lucide-react";

interface CandidateLoginPageProps {
  onCandidateLoggedIn: (user: User) => void;
  onVoucherAuthenticated: (user: User, quiz: Quiz | null) => void;
  onInstructorPortalClick: () => void;
}

export const CandidateLoginPage: React.FC<CandidateLoginPageProps> = ({
  onCandidateLoggedIn,
  onVoucherAuthenticated,
  onInstructorPortalClick,
}) => {
  const [activeTab, setActiveTab] = useState<"voucher" | "credentials">("voucher");

  // Voucher Login State
  const [voucherInput, setVoucherInput] = useState("");

  // Credentials Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Read URL query parameters on mount e.g. ?pass=VCH-JOHN-8492
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const passParam = params.get("pass") || params.get("voucher") || params.get("code");
      if (passParam) {
        setVoucherInput(passParam);
        setActiveTab("voucher");
      }
    }
  }, []);

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!voucherInput.trim()) {
      setErrorMsg("Please enter your candidate Voucher / Pass Code.");
      return;
    }

    const result = authenticateByVoucherCode(voucherInput);
    if (!result) {
      setErrorMsg("Invalid Voucher / Pass Code. Please check the pass code provided by your instructor.");
      return;
    }

    onVoucherAuthenticated(result.user, result.quiz);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
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
              <span>Direct Exam Access & Voucher Verification</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Enter Your Voucher Pass to Launch Your Exam
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Enter the Voucher Pass Code or open the direct link provided by your instructor to instantly launch your test interface and attempt your questions.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-emerald-400" />
                  <span>Voucher Direct Pass</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">1-click exam launch using your voucher code.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>Offline Assessment</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Questions load and score seamlessly offline.</p>
              </div>
            </div>
          </div>

          {/* Right Candidate Login Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Candidate Assessment Access</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your voucher pass code or sign in with email</p>
                </div>
              </div>

              {/* Login Method Toggle Tabs */}
              <div className="flex rounded-2xl bg-slate-900 p-1 text-xs font-bold text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("voucher");
                    setErrorMsg("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                    activeTab === "voucher" ? "bg-blue-600 text-white font-extrabold shadow-md" : "hover:text-white"
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span>Voucher / Pass Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("credentials");
                    setErrorMsg("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                    activeTab === "credentials" ? "bg-blue-600 text-white font-extrabold shadow-md" : "hover:text-white"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email & Password</span>
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-800 p-3 text-xs font-medium text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* METHOD 1: VOUCHER / PASS CODE FORM */}
              {activeTab === "voucher" && (
                <form onSubmit={handleVoucherSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Candidate Voucher / Pass Code *</label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="Enter voucher pass code (e.g. VCH-JOHN-8492)"
                        required
                        className="w-full rounded-xl border border-blue-800/80 bg-slate-900 py-3 pl-9 pr-3 font-mono text-sm font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none uppercase tracking-wider"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Pre-filled automatically if you clicked a shared candidate link.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Verify Voucher & Launch Test Directly</span>
                  </button>
                </form>
              )}

              {/* METHOD 2: EMAIL & PASSWORD FORM */}
              {activeTab === "credentials" && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Candidate Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john.doe@student.edu"
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
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950">
        QuizPulse Candidate Assessment Engine • Apache-2.0 License • Direct Voucher Pass Enabled
      </footer>
    </div>
  );
};
