import React, { useState } from "react";
import {
  Database,
  Plus,
  Search,
  Upload,
  Copy,
  Trash2,
  Folder,
  Tag,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { QuestionBank, Question } from "../../types";

interface QuestionBankViewProps {
  banks: QuestionBank[];
  onOpenBulkUpload: () => void;
  onSaveBank: (bank: QuestionBank) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  banks,
  onOpenBulkUpload,
  onSaveBank,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || "");
  const [search, setSearch] = useState("");

  const selectedBank = banks.find((b) => b.id === selectedBankId) || banks[0];

  const filteredQuestions = (selectedBank?.questions || []).filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase()) ||
    q.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Question Banks & Repository</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Centralized reusable questions categorized by subjects, topics, and difficulty levels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBulkUpload}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-transform active:scale-95"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload (XLSX/CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Folders / Question Banks List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Question Folders
              </span>
              <span className="text-[10px] font-bold text-slate-500">{banks.length} Banks</span>
            </div>

            <div className="mt-3 space-y-2">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                    selectedBankId === bank.id
                      ? "border border-blue-600 bg-blue-50/60 shadow-2xs"
                      : "border border-slate-200/80 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        selectedBankId === bank.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Folder className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{bank.title}</p>
                      <p className="text-[10px] text-slate-500">{bank.questions?.length || 0} Questions</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Questions inside Selected Bank */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedBank?.title}</h2>
                <p className="text-xs text-slate-500">{selectedBank?.description}</p>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions in bank..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[10px] font-bold text-blue-800">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-900">{q.questionText}</p>
                    </div>

                    <span className="shrink-0 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {q.marks} pts
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 pt-1">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">{q.type}</span>
                    <span className="rounded bg-slate-200/60 px-2 py-0.5">{q.difficulty}</span>
                    {q.explanation && <span className="line-clamp-1 italic text-slate-400">"{q.explanation}"</span>}
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-xs font-bold text-slate-700">No questions found in this folder</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
