import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  const { changePassword, isLoading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setLocalError('');

    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters long.');
      return;
    }

    const res = await changePassword({ currentPassword, newPassword });
    if (res?.success) {
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-editorial-accent/10 text-editorial-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif">Change Password</h2>
          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1">
            Update your account password securely
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {(localError || error) && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted dark:text-darkEditorial-muted" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted dark:text-darkEditorial-muted" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars (letters + numbers)"
                className="w-full pl-10 pr-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-editorial-accent hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
