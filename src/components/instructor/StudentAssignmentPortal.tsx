import React, { useState } from "react";
import { User, Quiz, QuizAssignment } from "../../types";
import { createUser, createQuizAssignment, deleteQuizAssignment, generateVoucherCode, updateUser } from "../../lib/storage";
import {
  UserPlus,
  BookOpen,
  Calendar,
  Key,
  Copy,
  CheckCircle2,
  Trash2,
  Users,
  Search,
  CheckSquare,
  ShieldCheck,
  FileText,
  Clock,
  Send,
  AlertCircle,
  X,
  Lock,
  Link,
  Printer,
  Sparkles,
  Ticket,
} from "lucide-react";

interface StudentAssignmentPortalProps {
  users: User[];
  quizzes: Quiz[];
  assignments: QuizAssignment[];
  onRefreshData: () => void;
}

export const StudentAssignmentPortal: React.FC<StudentAssignmentPortalProps> = ({
  users,
  quizzes,
  assignments,
  onRefreshData,
}) => {
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showAssignQuizModal, setShowAssignQuizModal] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<User | null>(null);

  // Voucher Slip Modal State
  const [viewVoucherStudent, setViewVoucherStudent] = useState<User | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ALL");

  // Create Student Form State
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("Student123!");
  const [studentDept, setStudentDept] = useState("Computer Science");
  const [customVoucher, setCustomVoucher] = useState("");
  const [createError, setCreateError] = useState("");

  // Assign Quiz Form State
  const [targetQuizId, setTargetQuizId] = useState(quizzes[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [assignError, setAssignError] = useState("");

  // Credential Voucher Copy State
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  const studentUsers = users.filter((u) => u.role === "STUDENT");
  const departments = Array.from(new Set(studentUsers.map((s) => s.department))).filter(Boolean);

  const filteredStudents = studentUsers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.voucherCode && s.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = filterDepartment === "ALL" || s.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!studentName.trim()) {
      setCreateError("Candidate name is required.");
      return;
    }
    if (!studentEmail.trim() || !studentEmail.includes("@")) {
      setCreateError("A valid candidate email is required.");
      return;
    }
    if (!studentPassword || studentPassword.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    try {
      const voucherCode = customVoucher.trim() || generateVoucherCode(studentName);

      createUser({
        name: studentName.trim(),
        email: studentEmail.trim().toLowerCase(),
        password: studentPassword,
        voucherCode,
        role: "STUDENT",
        department: studentDept.trim(),
        jobTitle: "Candidate Student",
        organizationId: "org-tech-inst",
        organizationName: "Tech Institute of Science",
        status: "ACTIVE",
      });

      setStudentName("");
      setStudentEmail("");
      setCustomVoucher("");
      setShowCreateStudentModal(false);
      onRefreshData();
      alert(`Candidate profile created!\nLogin Voucher Code: ${voucherCode}\nPassword: ${studentPassword}`);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create candidate profile.");
    }
  };

  const handleAssignQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError("");

    if (!targetQuizId) {
      setAssignError("Please select a quiz to assign.");
      return;
    }
    if (!selectedStudentForAssign) {
      setAssignError("Please select a candidate student.");
      return;
    }

    try {
      createQuizAssignment(targetQuizId, selectedStudentForAssign.id, dueDate, accessCode);
      setShowAssignQuizModal(false);
      setSelectedStudentForAssign(null);
      onRefreshData();
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign quiz.");
    }
  };

  const getCandidatePassCode = (student: User) => {
    return student.voucherCode || student.password || `VCH-${student.id.slice(-4).toUpperCase()}`;
  };

  const getCandidateDirectLink = (student: User) => {
    const passCode = getCandidatePassCode(student);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://lagoszone.vercel.app";
    const studentAssignments = assignments.filter((a) => a.studentId === student.id || a.studentEmail?.toLowerCase() === student.email.toLowerCase());
    const assignedQuizId = studentAssignments.length > 0 ? studentAssignments[0].quizId : (student.assignedQuizIds?.[0] || "");
    const quizQuery = assignedQuizId ? `&quizId=${encodeURIComponent(assignedQuizId)}` : "";
    const userQuery = `&userId=${encodeURIComponent(student.id)}`;
    return `${origin}/?pass=${encodeURIComponent(passCode)}${quizQuery}${userQuery}`;
  };

  const handleCopyDirectExamLink = (student: User) => {
    const directLink = getCandidateDirectLink(student);
    navigator.clipboard.writeText(directLink);
    setCopiedLinkId(student.id);
    setTimeout(() => setCopiedLinkId(null), 3000);
  };

  const handleCopyVoucherText = (student: User) => {
    const passCode = getCandidatePassCode(student);
    const directLink = getCandidateDirectLink(student);
    const text = `QuizPulse Candidate Exam Voucher:\nName: ${student.name}\nEmail: ${student.email}\nVoucher / Pass Code: ${passCode}\nDirect Exam Link: ${directLink}`;
    navigator.clipboard.writeText(text);
    setCopiedVoucherId(student.id);
    setTimeout(() => setCopiedVoucherId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Candidate Profiles & Quiz Assignments</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Create student login credentials, generate exam voucher pass codes, and share direct test access links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateStudentModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Candidate Profile</span>
          </button>
        </div>
      </div>

      {/* Candidates List with Credential Vouchers */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Registered Candidates ({filteredStudents.length})</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates or voucher code..."
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {departments.length > 0 && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const studentAssignments = assignments.filter((a) => a.studentId === student.id);
            const passCode = getCandidatePassCode(student);
            const isLinkCopied = copiedLinkId === student.id;
            const isVoucherCopied = copiedVoucherId === student.id;

            return (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-blue-300 hover:bg-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{student.name}</h3>
                        <p className="text-[11px] text-slate-500">{student.email}</p>
                      </div>
                    </div>

                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase">
                      {student.department || "General"}
                    </span>
                  </div>

                  {/* Voucher / Pass Credentials Box */}
                  <div className="mt-3 rounded-xl border border-blue-200/60 bg-blue-50/60 p-3 text-[11px] space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-600 font-sans text-[10px] font-bold uppercase tracking-wider">Voucher / Pass:</span>
                      <strong className="text-blue-900 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">{passCode}</strong>
                    </div>

                    {/* Action Buttons: Copy Link & Voucher Slip */}
                    <div className="flex items-center gap-2 border-t border-blue-200/40 pt-2">
                      <button
                        onClick={() => handleCopyDirectExamLink(student)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white border border-blue-200 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                        title="Copy direct shareable URL for candidate"
                      >
                        {isLinkCopied ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Link className="h-3 w-3" />}
                        <span>{isLinkCopied ? "Link Copied!" : "Copy Share Link"}</span>
                      </button>

                      <button
                        onClick={() => setViewVoucherStudent(student)}
                        className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                        title="View & Print Voucher Slip"
                      >
                        <Ticket className="h-3 w-3" />
                        <span>Voucher Slip</span>
                      </button>
                    </div>
                  </div>

                  {/* Assigned Quizzes Badges */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Quizzes ({studentAssignments.length})
                    </p>
                    {studentAssignments.length > 0 ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {studentAssignments.map((asg) => (
                          <div
                            key={asg.id}
                            className="flex items-center justify-between rounded-lg bg-blue-50/70 px-2 py-1 text-[11px] text-blue-900"
                          >
                            <span className="truncate font-semibold max-w-[170px]">{asg.quizTitle}</span>
                            <button
                              onClick={() => {
                                deleteQuizAssignment(asg.id);
                                onRefreshData();
                              }}
                              className="text-slate-400 hover:text-rose-600"
                              title="Unassign Quiz"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No quizzes assigned yet.</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudentForAssign(student);
                    setShowAssignQuizModal(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Assign Test to Candidate</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE CANDIDATE MODAL */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Create Candidate Profile</h3>
              </div>
              <button
                onClick={() => setShowCreateStudentModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudentSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unique Student Email *</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g. john.doe@student.edu"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Login Password *</label>
                <input
                  type="text"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Voucher / Pass Code (Optional)</label>
                <input
                  type="text"
                  value={customVoucher}
                  onChange={(e) => setCustomVoucher(e.target.value)}
                  placeholder="Auto-generated if left blank (e.g. VCH-JOHN-8492)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Stream</label>
                <input
                  type="text"
                  value={studentDept}
                  onChange={(e) => setStudentDept(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateStudentModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700"
                >
                  Create & Generate Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOUCHER SLIP MODAL */}
      {viewVoucherStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold">Candidate Exam Voucher Slip</h3>
              </div>
              <button
                onClick={() => setViewVoucherStudent(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Voucher Card Graphic */}
            <div className="mt-4 rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-6 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-extrabold text-blue-900 text-sm">QuizPulse Assessment Ticket</span>
                </div>
                <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-extrabold text-white uppercase">
                  Exam Pass
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Candidate Name</p>
                  <p className="font-bold text-slate-900 text-sm">{viewVoucherStudent.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Candidate Email</p>
                  <p className="font-semibold text-slate-700 truncate">{viewVoucherStudent.email}</p>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-white p-3 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Voucher / Pass Code</p>
                <p className="font-mono text-xl font-black text-blue-700 tracking-wider">
                  {getCandidatePassCode(viewVoucherStudent)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Direct Exam Access URL</p>
                <p className="font-mono text-[11px] text-blue-800 bg-blue-100/60 p-2 rounded-lg break-all font-semibold">
                  {getCandidateDirectLink(viewVoucherStudent)}
                </p>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => handleCopyVoucherText(viewVoucherStudent)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Copy className="h-4 w-4 text-blue-600" />
                <span>Copy Full Voucher Details</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                <span>Print Voucher Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN QUIZ MODAL */}
      {showAssignQuizModal && selectedStudentForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Quiz to Candidate</h3>
                <p className="text-xs text-slate-500">Candidate: {selectedStudentForAssign.name}</p>
              </div>
              <button
                onClick={() => setShowAssignQuizModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assignError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignQuizSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Quiz / Assessment *</label>
                <select
                  value={targetQuizId}
                  onChange={(e) => setTargetQuizId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.questions?.length || 0} Qs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Access Deadline (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Access Code (Optional)</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. EXAM-2026-PASS"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignQuizModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700"
                >
                  Assign Quiz to Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
