import React from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Award,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Quiz, QuizAttempt } from "../../types";
import { exportAttemptsToCSV, exportAttemptsToExcel } from "../../lib/exporter";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsDashboardProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ quizzes, attempts }) => {
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.isPassed).length;
  const avgScore =
    attempts.length > 0
      ? parseFloat((attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1))
      : 0;

  const scoreDistributionData = [
    { range: "90-100%", count: attempts.filter((a) => a.percentage >= 90).length },
    { range: "75-89%", count: attempts.filter((a) => a.percentage >= 75 && a.percentage < 90).length },
    { range: "60-74%", count: attempts.filter((a) => a.percentage >= 60 && a.percentage < 75).length },
    { range: "< 60%", count: attempts.filter((a) => a.percentage < 60).length },
  ];

  const passFailData = [
    { name: "Passed", value: passedAttempts, color: "#10b981" },
    { name: "Failed", value: Math.max(0, totalAttempts - passedAttempts), color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analytics & Performance Reports</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time candidate metrics, pass rates, score distributions, and export data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAttemptsToCSV(attempts, "All_Quizzes")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportAttemptsToExcel(attempts, "All_Quizzes")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Candidates Examined</span>
          <p className="mt-2 text-3xl font-black text-slate-900">{totalAttempts}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Overall Pass Rate</span>
          <p className="mt-2 text-3xl font-black text-emerald-600">
            {totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Mean Percentage Score</span>
          <p className="mt-2 text-3xl font-black text-blue-600">{avgScore}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Distribution Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Score Range Distribution</h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={scoreDistributionData}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Candidates" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass/Fail Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Pass / Fail Ratio</h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
