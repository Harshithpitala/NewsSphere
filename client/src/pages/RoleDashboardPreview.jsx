import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, FileEdit, Award } from 'lucide-react';

export default function RoleDashboardPreview({ roleName, description }) {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-editorial-accent">
            Role Authorization Verified
          </span>
          <h1 className="text-2xl font-bold font-serif">{roleName} Portal Foundation</h1>
        </div>
      </div>

      <p className="text-sm text-editorial-muted dark:text-darkEditorial-muted mb-6 leading-relaxed">
        {description}
      </p>

      <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg">
        <div className="text-xs font-semibold mb-2 uppercase tracking-wider">Active Authenticated Session:</div>
        <div className="text-sm font-mono space-y-1">
          <div>User: <span className="font-bold">{user?.name}</span> ({user?.email})</div>
          <div>Role: <span className="font-bold text-editorial-accent uppercase">{user?.role}</span></div>
          <div>Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Authorized via Backend RBAC Middleware</span></div>
        </div>
      </div>
    </div>
  );
}
