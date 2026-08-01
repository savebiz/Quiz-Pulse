import React from "react";
import { Award, Printer, Download, X, CheckCircle2, ShieldCheck } from "lucide-react";

interface CertificateViewerProps {
  studentName: string;
  quizTitle: string;
  issueDate: string;
  scorePercentage: number;
  verificationCode: string;
  onClose: () => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  studentName,
  quizTitle,
  issueDate,
  scorePercentage,
  verificationCode,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl print:border-none print:shadow-none print:max-w-none">
        {/* Modal Close & Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-900">Certificate of Completion</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Frame */}
        <div className="mt-4 rounded-2xl border-4 border-double border-amber-600/60 bg-gradient-to-b from-amber-50/20 via-white to-slate-50/50 p-8 text-center shadow-inner relative overflow-hidden">
          {/* Corner Decors */}
          <div className="absolute top-3 left-3 h-10 w-10 border-t-2 border-l-2 border-amber-600/80"></div>
          <div className="absolute top-3 right-3 h-10 w-10 border-t-2 border-r-2 border-amber-600/80"></div>
          <div className="absolute bottom-3 left-3 h-10 w-10 border-b-2 border-l-2 border-amber-600/80"></div>
          <div className="absolute bottom-3 right-3 h-10 w-10 border-b-2 border-r-2 border-amber-600/80"></div>

          {/* Seal Header */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-lg shadow-amber-500/30">
            <Award className="h-9 w-9" />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-700">
            QuizPulse Assessment Platform
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-wide text-slate-900 md:text-3xl font-serif">
            Certificate of Achievement
          </h1>

          <p className="mt-6 text-xs text-slate-500 italic">This is proudly awarded to</p>
          <h2 className="mt-2 text-2xl font-black text-blue-900 border-b-2 border-amber-400/50 inline-block px-8 py-1">
            {studentName}
          </h2>

          <p className="mt-6 max-w-lg mx-auto text-xs text-slate-600 leading-relaxed">
            for successfully passing the official assessment for <br />
            <strong className="text-slate-900 text-sm">{quizTitle}</strong>
            <br /> with an achieved score of <strong className="text-emerald-700">{scorePercentage}%</strong>.
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 pt-6 px-4 text-left">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</p>
              <p className="text-xs font-bold text-slate-900">
                {new Date(issueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Assessment</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Verification ID</p>
              <p className="text-xs font-mono font-bold text-slate-900">{verificationCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
