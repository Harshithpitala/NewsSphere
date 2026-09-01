import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Flag,
  History,
  Settings,
  Shield,
  Menu,
  X,
  Image,
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Analytics & Insights', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Article Moderation', path: '/admin/articles', icon: FileText },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Tags & Topics', path: '/admin/tags', icon: Tags },
    { label: 'Comment Moderation', path: '/admin/comments', icon: MessageSquare },
    { label: 'Content Reports', path: '/admin/reports', icon: Flag },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-editorial-bg dark:bg-darkEditorial-bg text-editorial-text dark:text-darkEditorial-text flex flex-col md:flex-row">
      {/* Mobile Top Sub-bar */}
      <div className="md:hidden p-4 bg-editorial-card dark:bg-darkEditorial-card border-b border-editorial-border dark:border-darkEditorial-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-serif font-bold text-sm">System Administration</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg border border-editorial-border hover:bg-black/5 dark:hover:bg-white/5"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-editorial-card dark:bg-darkEditorial-card border-r border-editorial-border dark:border-darkEditorial-border p-4 space-y-6 shrink-0 ${
          mobileSidebarOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex items-center space-x-3 px-3 py-2 border-b border-editorial-border dark:border-darkEditorial-border">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-serif leading-none">Admin Console</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-editorial-muted font-mono">
              System Control
            </span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-editorial-muted dark:text-darkEditorial-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-editorial-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
