import React from "react";
import { ShieldAlert, Users, Building2, ShieldCheck, Clock, FileText } from "lucide-react";
import { User, AuditLog, Organization } from "../../types";

interface AdminPanelProps {
  users: User[];
  auditLogs: AuditLog[];
  organizations: Organization[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, auditLogs, organizations }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Panel & Security Audits</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Super Admin and Organization management, user permissions, and real-time audit event tracking
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Platform Users ({users.length})</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{u.name} ({u.email})</td>
                  <td className="p-3 font-bold text-blue-600">{u.role}</td>
                  <td className="p-3 text-slate-600">{u.organizationName || "System Global"}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">System Audit Trail Logs</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="p-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
