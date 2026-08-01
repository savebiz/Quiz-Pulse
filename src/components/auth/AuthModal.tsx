import React, { useState } from "react";
import { User, UserRole } from "../../types";
import { authenticateUser, createUser, switchUser } from "../../lib/storage";
import {
  X,
  LogIn,
  UserPlus,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUserAuthenticated: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  users,
  currentUser,
  onClose,
  onUserAuthenticated,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("STUDENT");
  const [regPassword, setRegPassword] = useState("Password123!");
  const [regConfirmPassword, setRegConfirmPassword] = useState("Password123!");
  const [jobTitle, setJobTitle] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    const authenticated = authenticateUser(loginEmail, loginPassword);
    if (!authenticated) {
      setErrorMsg("Invalid credentials. Verify your email and password.");
      return;
    }

    onUserAuthenticated(authenticated);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMsg("A valid unique email address is required.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const newUser = createUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        role: regRole,
        password: regPassword,
        jobTitle: jobTitle.trim(),
        organizationId: "org-tech-inst",
        organizationName: "Tech Institute of Science",
        status: "ACTIVE",
      });

      switchUser(newUser.id);
      onUserAuthenticated(newUser);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register new profile.");
    }
  };

  const handleQuickSwitch = (userId: string) => {
    const switched = switchUser(userId);
    onUserAuthenticated(switched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">QuizPulse Account Portal</h2>
              <p className="text-xs text-slate-500">Authentication & Unique Profile Switcher</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="mt-4 flex rounded-2xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeTab === "login" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "hover:text-slate-900"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeTab === "register" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "hover:text-slate-900"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile Switcher */}
        {activeTab === "switcher" && (
          <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Select an existing unique user profile to switch session instantly:
            </p>

            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickSwitch(u.id)}
                  className={`w-full flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{u.name}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wide">
                      {u.role}
                    </span>
                    {u.password && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Password Set</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Login */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unique Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@student.edu"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 font-medium">Seed Passwords: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Admin2026!</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Instructor2026!</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Password123!</code></p>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Register New Profile */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unique Email Address *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. alex.rivera@techinstitute.org"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="STUDENT">Student / Candidate</option>
                  <option value="INSTRUCTOR">Instructor / Teacher</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Major</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineering"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create & Login</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
