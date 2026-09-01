import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, Shield, ShieldAlert, UserCheck, UserX, Eye, Edit2, AlertCircle, X } from 'lucide-react';

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState('USER');

  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', page, roleFilter, statusFilter, search],
    queryFn: () => adminService.getUsers({ page, limit: 12, role: roleFilter, status: statusFilter, search }),
  });

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  // Role Mutation
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminService.updateUserRole(id, role),
    onSuccess: () => {
      setRoleModalUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, isSuspended }) => adminService.updateUserStatus(id, isSuspended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const roles = [
    { label: 'All Roles', value: '' },
    { label: 'Users', value: 'USER' },
    { label: 'Journalists', value: 'JOURNALIST' },
    { label: 'Editors', value: 'EDITOR' },
    { label: 'Admins', value: 'ADMIN' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">User Administration</span>
        <h1 className="text-3xl font-bold font-serif">User Management</h1>
        <p className="text-xs text-editorial-muted mt-1">Manage user account roles, view details, and suspend or restore access</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filters */}
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setRoleFilter(r.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  roleFilter === r.value
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border hover:border-purple-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="SUSPENDED">Suspended Accounts</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-editorial-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading && <ArticleSkeleton count={6} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && users.length === 0 && (
        <EmptyState
          title="No Users Found"
          description="No user accounts match your current filter parameters."
        />
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-bold">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center uppercase text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <Link to={`/admin/users/${u._id}`} className="hover:text-purple-600 transition">
                          {u.name}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : u.role === 'EDITOR'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : u.role === 'JOURNALIST'
                            ? 'bg-editorial-accent/10 text-editorial-accent border border-editorial-accent/20'
                            : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-bold font-mono text-[10px]">
                          <ShieldAlert className="w-3 h-3" /> SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10px]">
                          <UserCheck className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setRoleModalUser(u);
                          setNewRole(u.role);
                        }}
                        className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-editorial-border rounded text-[11px] font-semibold hover:border-purple-600 transition"
                      >
                        Change Role
                      </button>

                      <button
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: u._id, isSuspended: !u.isSuspended })}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          u.isSuspended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {u.isSuspended ? 'Restore' : 'Suspend'}
                      </button>

                      <Link
                        to={`/admin/users/${u._id}`}
                        className="p-1.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 inline-block align-middle"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-editorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card border rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-editorial-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card border rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-purple-600 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Change User Role
              </h4>
              <button onClick={() => setRoleModalUser(null)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-editorial-muted">
              Modify account role for <strong className="text-editorial-text">{roleModalUser.name}</strong> ({roleModalUser.email}).
            </p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Select Account Role *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="USER">USER (Reader)</option>
                <option value="JOURNALIST">JOURNALIST (Reporter / Writer)</option>
                <option value="EDITOR">EDITOR (Sub-editor / Publisher)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setRoleModalUser(null)} className="px-4 py-2 text-editorial-muted">Cancel</button>
              <button
                disabled={roleMutation.isPending}
                onClick={() => roleMutation.mutate({ id: roleModalUser._id, role: newRole })}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
              >
                Confirm Role Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
