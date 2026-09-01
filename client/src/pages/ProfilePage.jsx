import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Shield, CheckCircle2, Key, Edit3, ArrowLeft, Home } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'EDITOR':
        return '/editor';
      case 'JOURNALIST':
        return '/journalist';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const res = await updateProfile({ name, bio, avatar });
    if (res?.success) {
      setSuccessMsg('Profile updated successfully! Returning to workspace...');
      setTimeout(() => {
        navigate(getDashboardPath(user?.role));
      }, 1200);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'EDITOR':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'JOURNALIST':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-4">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(getDashboardPath(user?.role))}
          className="px-3 py-1.5 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl p-8 shadow-sm">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-editorial-border dark:border-darkEditorial-border">
          <div className="w-20 h-20 rounded-full bg-editorial-accent text-white flex items-center justify-center text-3xl font-serif font-bold uppercase shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl font-bold font-serif">{user?.name}</h1>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>

          <Link
            to="/change-password"
            className="px-4 py-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold flex items-center gap-2 hover:border-editorial-accent transition"
          >
            <Key className="w-3.5 h-3.5 text-editorial-accent" /> Change Password
          </Link>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold font-serif border-b border-editorial-border dark:border-darkEditorial-border pb-2">
            <Edit3 className="w-4 h-4 text-editorial-accent" /> Edit Public Profile
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Avatar Image URL (Optional)
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              Bio / About You
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about your interests or editorial background..."
              className="w-full px-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(getDashboardPath(user?.role))}
              className="px-4 py-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Cancel / Close
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-editorial-accent hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
