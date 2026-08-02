import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Bell,
  Search,
  Building2,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
  Users,
  Lock,
} from "lucide-react";
import { User, UserRole } from "../../types";
import { resetToSeedData } from "../../lib/storage";

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (view: string) => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  searchQuery,
  onSearchChange,
  onNavigate,
  onOpenProfileModal,
  onOpenAuthModal,
  onSignOut,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesConfig: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: "SUPER_ADMIN", label: "Super Admin", icon: ShieldCheck, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { role: "ORG_ADMIN", label: "Org Admin", icon: Building2, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { role: "INSTRUCTOR", label: "Instructor", icon: UserCheck, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { role: "STUDENT", label: "Candidate / Student", icon: GraduationCap, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  const currentRoleConfig = rolesConfig.find((r) => r.role === currentUser.role) || rolesConfig[2];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Search */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-lg font-bold tracking-tight text-slate-900">QuizPulse</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-blue-600 sm:block">
              Assessment Engine
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden w-64 md:block lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search quizzes, questions, students..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Role Badge */}
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs ${currentRoleConfig.color}`}>
          <currentRoleConfig.icon className="h-4 w-4" />
          <span>{currentRoleConfig.label}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 z-40">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold text-blue-600">3 New</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 text-slate-700">
                  <p className="font-semibold text-slate-900">Quiz Completed</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Sarah Jenkins submitted AI Essentials Certification (86.6%).</p>
                </div>
                <div className="rounded-xl bg-blue-50/50 p-2.5 text-slate-700">
                  <p className="font-semibold text-slate-900">Pending Manual Grading</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">1 essay answer requires review for Sarah Jenkins.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Badge */}
        <div className="relative border-l border-slate-200 pl-3">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="hidden text-left lg:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <p className="mt-0.5 text-[10px] text-slate-500 leading-none">{currentUser.email}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-40">
              <div className="border-b border-slate-100 p-3">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                {currentUser.jobTitle && (
                  <p className="mt-1 text-[10px] font-semibold text-blue-600">{currentUser.jobTitle}</p>
                )}
              </div>

              <div className="mt-1 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfileModal) onOpenProfileModal();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <span>My Profile & Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>Switch Unique Profile</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSignOut) onSignOut();
                    else if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
