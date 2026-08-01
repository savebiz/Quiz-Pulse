import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Building2,
  ShieldCheck,
  Clock,
  UserPlus,
  Search,
  Key,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Mail,
  Briefcase,
} from "lucide-react";
import { User, AuditLog, Organization } from "../../types";
import { CreateUserModal } from "./CreateUserModal";
import { deleteUser, resetUserPassword, updateUser } from "../../lib/storage";

interface AdminPanelProps {
  users: User[];
  auditLogs: AuditLog[];
  organizations: Organization[];
  onUserChange?: () => void;
  onEditUserProfile?: (user: User) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  auditLogs,
  organizations,
  onUserChange,
  onEditUserProfile,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (u: User) => {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateUser(u.id, { status: newStatus });
    if (onUserChange) onUserChange();
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Are you sure you want to permanently delete user profile '${u.name}' (${u.email})?`)) {
      deleteUser(u.id);
      if (onUserChange) onUserChange();
    }
  };

  const handleResetPasswordPrompt = (u: User) => {
    const newPass = prompt(`Enter new password for ${u.name} (${u.email}):`, "NewPassword123!");
    if (newPass && newPass.trim().length >= 6) {
      resetUserPassword(u.id, newPass.trim());
      alert(`Password for ${u.name} has been reset successfully!`);
      if (onUserChange) onUserChange();
    } else if (newPass !== null) {
      alert("Password must be at least 6 characters long.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Panel & Security Audits</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Provision unique user profiles, manage credentials, and monitor audit trails in real-time
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create New Profile</span>
        </button>
      </div>

      {/* Users Management Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Platform Unique Profiles ({filteredUsers.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search name, email, title..."
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ORG_ADMIN">Org Admin</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="p-3">Profile User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Title & Dept</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-9 w-9 rounded-xl border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-bold text-blue-600">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] uppercase tracking-wide">
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3 text-slate-600">
                    <p className="font-semibold text-slate-800">{u.jobTitle || "N/A"}</p>
                    <p className="text-[10px] text-slate-500">{u.department || u.organizationName || "System"}</p>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold text-[10px] transition-colors ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {u.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>{u.status}</span>
                    </button>
                  </td>

                  <td className="p-3 text-slate-400 font-medium">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEditUserProfile && (
                        <button
                          onClick={() => onEditUserProfile(u)}
                          title="Edit Profile"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleResetPasswordPrompt(u)}
                        title="Reset Password"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Delete Profile"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={() => {
          if (onUserChange) onUserChange();
        }}
      />
    </div>
  );
};
