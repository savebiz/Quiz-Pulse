import React from "react";
import {
  LayoutDashboard,
  FileQuestion,
  Database,
  UploadCloud,
  CheckSquare,
  BarChart3,
  Award,
  ShieldAlert,
  Settings,
  BookOpen,
  Users,
} from "lucide-react";
import { UserRole } from "../../types";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: UserRole;
  pendingGradingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userRole,
  pendingGradingCount = 1,
}) => {
  const isStudent = userRole === "STUDENT";
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ORG_ADMIN";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quizzes", label: isStudent ? "My Quizzes" : "Quizzes & Tests", icon: FileQuestion },
    ...(!isStudent
      ? [
          { id: "student-assignments", label: "Candidate Assignments", icon: Users },
          { id: "question-bank", label: "Question Bank", icon: Database },
          { id: "bulk-import", label: "Bulk Upload", icon: UploadCloud },
          {
            id: "manual-grading",
            label: "Grade Essays",
            icon: CheckSquare,
            badge: pendingGradingCount > 0 ? pendingGradingCount : undefined,
          },
        ]
      : []),
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
    { id: "certificates", label: "Certificates", icon: Award },
    ...(isAdmin
      ? [{ id: "admin-panel", label: "Admin & Audits", icon: ShieldAlert }]
      : []),
  ];

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white p-3 md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {isStudent ? "Candidate Portal" : "Assessment Suite"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white text-blue-700" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span>Proctoring Active</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Auto-timer, shuffle, copy-paste protection & instant PDF certificate validation enabled.
        </p>
      </div>
    </aside>
  );
};
