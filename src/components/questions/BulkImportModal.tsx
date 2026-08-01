import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Download,
  FileText,
  Sparkles,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Question } from "../../types";
import { exportQuestionsToTemplate } from "../../lib/exporter";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsImported: (importedQuestions: Question[]) => void;
}

const SAMPLE_MEMORY_VERSE_TEXT = `Question 1:
Recite the memory verse for the topic New Birth in Christ

Answer to Question 1: 
2 Corinthians 5:17 Therefore if any man be in Christ he is a new creature old things are passed away behold all things are become new

Question 2:
Recite the memory verse for Lesson 1

Answer to Question 2:
2 Corinthians 5:17 Therefore if any man be in Christ he is a new creature old things are passed away behold all things are become new

Question 3:
Recite the memory verse for the topic What is Worship?

Answer to Question 3: 
Psalm 95:6 O come let us worship and bow down let us kneel before the Lord our maker`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onQuestionsImported,
}) => {
  const [activeTab, setActiveTab] = useState<"FILE" | "PASTE">("PASTE");
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [pastedText, setPastedText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Regex parser for Q&A formats like Question X: ... Answer to Question X: ...
  const parseUnstructuredText = (text: string): Question[] => {
    const questions: Question[] = [];

    // Pattern 1: Question [X]: <text> Answer to Question [X]: <answer>
    const pattern1 = /(?:Question\s*\d*|Q\d*)\s*:\s*([\s\S]*?)\s*(?:Answer\s*(?:to\s*Question\s*\d*)?|Ans\d*|Answer)\s*:\s*([\s\S]*?)(?=(?:Question\s*\d*|Q\d*)\s*:|$)/gi;

    let match;
    let index = 1;
    while ((match = pattern1.exec(text)) !== null) {
      const qText = match[1].trim();
      const aText = match[2].trim();
      if (qText) {
        questions.push({
          id: `imp-txt-${Date.now()}-${index}`,
          type: "SHORT_TEXT",
          questionText: qText,
          correctAnswerText: aText,
          marks: 5,
          category: "Memory Verses & Recitation",
          difficulty: "Intermediate",
          tags: ["Text Import", "Recitation"],
          explanation: aText ? `Correct Answer: ${aText}` : "",
          createdBy: "Bulk Importer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        index++;
      }
    }

    // Pattern 1.5: Lesson sheet format e.g. Lesson 1 — Topic — Reference — Verse
    const lessonLines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const lessonRegex = /^Lesson\s*(\d+)\s*[—\-]\s*(.*?)\s*[—\-]\s*([123]?\s*[A-Za-z]+\s*\d+:\d+[a-c]?)\s*[—\-]\s*(.*)$/i;
    
    let lessonIndex = 1;
    for (const line of lessonLines) {
      const matchLesson = line.match(lessonRegex);
      if (matchLesson) {
        const lessonNum = matchLesson[1];
        const topic = matchLesson[2].trim();
        const ref = matchLesson[3].trim();
        const verseText = matchLesson[4].trim();

        questions.push({
          id: `imp-les-${Date.now()}-${lessonIndex}`,
          type: "SHORT_TEXT",
          questionText: `Recite the memory verse for the topic ${topic}`,
          correctAnswerText: `${ref} ${verseText}`,
          marks: 5,
          category: "Memory Verses & Recitation",
          difficulty: "Intermediate",
          tags: [`Lesson ${lessonNum}`, "Memory Verse"],
          explanation: `Reference: ${ref}\nLesson: ${lessonNum}`,
          createdBy: "Bulk Importer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        lessonIndex++;
      }
    }

    if (questions.length > 0) {
      return questions;
    }
    if (questions.length === 0) {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      let currentQ = "";
      let currentA = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^(Question\s*\d*:?|Q\d*:?|\d+[\.\)])\s*(.*)/i.test(line)) {
          if (currentQ) {
            questions.push({
              id: `imp-txt-${Date.now()}-${questions.length + 1}`,
              type: "SHORT_TEXT",
              questionText: currentQ,
              correctAnswerText: currentA,
              marks: 5,
              category: "General",
              difficulty: "Intermediate",
              tags: ["Text Import"],
              explanation: currentA ? `Answer: ${currentA}` : "",
              createdBy: "Bulk Importer",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            currentQ = "";
            currentA = "";
          }
          currentQ = line.replace(/^(Question\s*\d*:?|Q\d*:?|\d+[\.\)])\s*/i, "");
        } else if (/^(Answer(?:\s*to\s*Question\s*\d*)?:?|Ans\d*:?|Answer:)\s*(.*)/i.test(line)) {
          currentA = line.replace(/^(Answer(?:\s*to\s*Question\s*\d*)?:?|Ans\d*:?|Answer:)\s*/i, "");
        } else if (currentA) {
          currentA += " " + line;
        } else if (currentQ) {
          currentQ += " " + line;
        }
      }

      if (currentQ) {
        questions.push({
          id: `imp-txt-${Date.now()}-${questions.length + 1}`,
          type: "SHORT_TEXT",
          questionText: currentQ,
          correctAnswerText: currentA,
          marks: 5,
          category: "General",
          difficulty: "Intermediate",
          tags: ["Text Import"],
          explanation: currentA ? `Answer: ${currentA}` : "",
          createdBy: "Bulk Importer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return questions;
  };

  const handleTextParse = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg("Please enter or paste question text first.");
      return;
    }

    const qs = parseUnstructuredText(pastedText);
    if (qs.length === 0) {
      setErrorMsg("Could not detect any Question/Answer pairs. Try clicking 'Parse with AI' or check your formatting.");
    } else {
      setParsedQuestions(qs);
    }
  };

  const handleAiParse = async () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg("Please enter or paste question text first.");
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/parse-raw-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: pastedText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse questions using AI");
      }

      const formatted: Question[] = (data.questions || []).map((q: any, idx: number) => ({
        id: `imp-ai-${Date.now()}-${idx}`,
        type: (q.type || "SHORT_TEXT").toUpperCase() as any,
        questionText: q.questionText || `Question ${idx + 1}`,
        options: q.options,
        correctAnswerText: q.correctAnswerText || "",
        marks: q.marks || 5,
        category: q.category || "Memory Verses & Recitation",
        difficulty: "Intermediate",
        tags: ["AI Import"],
        explanation: q.explanation || "",
        createdBy: "Bulk AI Parser",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setParsedQuestions(formatted);
    } catch (err: any) {
      setErrorMsg(`AI Parsing Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRawRows(results.data);
        },
        error: (err) => {
          setErrorMsg(`CSV Parsing Error: ${err.message}`);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processRawRows(data);
        } catch (err: any) {
          setErrorMsg(`Excel Reading Error: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          processRawRows(Array.isArray(json) ? json : [json]);
        } catch (err: any) {
          setErrorMsg(`JSON Parsing Error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const txt = evt.target?.result as string;
        setPastedText(txt);
        const qs = parseUnstructuredText(txt);
        setParsedQuestions(qs);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg("Unsupported file format. Please upload .xlsx, .csv, .json, or .txt");
    }
  };

  const processRawRows = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setErrorMsg("Uploaded file contains no rows.");
      return;
    }

    try {
      const formatted: Question[] = rows.map((row, idx) => {
        const questionText = row.Question || row.questionText || row["Question Text"] || `Imported Question ${idx + 1}`;
        const type = (row.Type || row.type || "MULTIPLE_CHOICE").toUpperCase();
        const marks = Number(row.Marks || row.marks || 5);
        const category = row.Category || row.category || "General";
        const difficulty = row.Difficulty || row.difficulty || "Intermediate";
        const explanation = row.Explanation || row.explanation || "";

        // Build options if available
        const options = [];
        if (row["Option A"]) options.push({ id: `opt-a-${idx}`, text: String(row["Option A"]), isCorrect: String(row["Correct Answer"]).includes("Option A") || String(row["Correct Answer"]).includes("True") });
        if (row["Option B"]) options.push({ id: `opt-b-${idx}`, text: String(row["Option B"]), isCorrect: String(row["Correct Answer"]).includes("Option B") || String(row["Correct Answer"]).includes("False") });
        if (row["Option C"]) options.push({ id: `opt-c-${idx}`, text: String(row["Option C"]), isCorrect: String(row["Correct Answer"]).includes("Option C") });
        if (row["Option D"]) options.push({ id: `opt-d-${idx}`, text: String(row["Option D"]), isCorrect: String(row["Correct Answer"]).includes("Option D") });

        return {
          id: `imp-q-${Date.now()}-${idx}`,
          type: type as any,
          questionText,
          options: options.length > 0 ? options : undefined,
          correctAnswerText: String(row["Correct Answer"] || row.correctAnswerText || ""),
          marks,
          category,
          difficulty: difficulty as any,
          tags: ["Bulk Import"],
          explanation,
          createdBy: "Bulk Importer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setParsedQuestions(formatted);
    } catch (err: any) {
      setErrorMsg(`Validation Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-500/30">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk Question Importer</h2>
              <p className="text-xs text-slate-500">
                Upload files or paste text formats (Question/Answer recitations, verses & MCQ)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("PASTE")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "PASTE"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Paste Raw Text / Q&A Format</span>
          </button>
          <button
            onClick={() => setActiveTab("FILE")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "FILE"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Upload File (.xlsx, .csv, .txt)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-800 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PASTE TEXT */}
          {activeTab === "PASTE" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Paste Question & Answer Text:</label>
                <button
                  type="button"
                  onClick={() => {
                    setPastedText(SAMPLE_MEMORY_VERSE_TEXT);
                    const qs = parseUnstructuredText(SAMPLE_MEMORY_VERSE_TEXT);
                    setParsedQuestions(qs);
                    setErrorMsg(null);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Load Memory Verse Example</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Paste questions in any standard format:\n\nQuestion 1:\nRecite the memory verse for the topic New Birth in Christ\n\nAnswer to Question 1:\n2 Corinthians 5:17 Therefore if any man be in Christ he is a new creature old things are passed away behold all things are become new`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTextParse}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                  <span>Fast Parse Text</span>
                </button>

                <button
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAiLoading ? "Parsing with AI..." : "Parse with AI (Gemini)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === "FILE" && (
            <div className="space-y-4">
              {/* Sample Template Downloader */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div>
                  <p className="font-bold text-slate-900">Download Excel Template</p>
                  <p className="text-[11px] text-slate-500">
                    Pre-formatted sheet with Question, Type, Options & Answer Key columns
                  </p>
                </div>
                <button
                  onClick={exportQuestionsToTemplate}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Download .xlsx</span>
                </button>
              </div>

              {/* Dropzone */}
              <div className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/20">
                <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-bold text-slate-800">
                  {fileName ? `Loaded: ${fileName}` : "Click to select or drag & drop file"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Accepts .xlsx, .csv, .json, or .txt text files
                </p>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .json, .txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Parsed Questions Preview ({parsedQuestions.length} Questions)
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Ready to import</span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 divide-y divide-slate-100">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {q.questionText}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {q.type}
                      </span>
                    </div>
                    {q.correctAnswerText && (
                      <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold">Answer:</span> {q.correctAnswerText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (parsedQuestions.length > 0) {
                onQuestionsImported(parsedQuestions);
                onClose();
              }
            }}
            disabled={parsedQuestions.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>Confirm Import ({parsedQuestions.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
