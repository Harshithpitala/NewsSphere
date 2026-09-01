import React from 'react';
import { Settings, Shield, Server, Sliders, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">System Configuration</span>
        <h1 className="text-3xl font-bold font-serif">Platform Settings</h1>
        <p className="text-xs text-editorial-muted mt-1">Configurable platform settings and environment parameters</p>
      </div>

      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-6 shadow-xs max-w-2xl">
        <div className="flex items-center space-x-3 border-b border-editorial-border pb-4">
          <Server className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-sm font-bold font-serif">Server Runtime & Architecture</h3>
            <p className="text-xs text-editorial-muted">NewsSphere Monolithic Node.js Express & MongoDB Stack</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border font-mono">
            <span className="text-editorial-muted">Environment Mode</span>
            <span className="font-bold text-emerald-600">development</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border font-mono">
            <span className="text-editorial-muted">Rate Limiter Protection</span>
            <span className="font-bold text-purple-600">Active (100 req/15min)</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border font-mono">
            <span className="text-editorial-muted">Scheduled Article Publisher</span>
            <span className="font-bold text-cyan-600">Active (60s Polling Worker)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
