import React from 'react';
import { FileEdit, Send, Eye, CheckCircle2, XCircle, Globe, Clock } from 'lucide-react';

export default function StatusBadge({ status, scheduledPublishAt }) {
  const isScheduled = scheduledPublishAt && new Date(scheduledPublishAt) > new Date();

  if (isScheduled && status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
        <Clock className="w-3 h-3" /> SCHEDULED
      </span>
    );
  }

  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
          <FileEdit className="w-3 h-3" /> DRAFT
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Send className="w-3 h-3" /> SUBMITTED
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Eye className="w-3 h-3" /> UNDER REVIEW
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> APPROVED
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" /> REJECTED
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Globe className="w-3 h-3" /> PUBLISHED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-slate-500/10 text-slate-600 border border-slate-500/20">
          {status}
        </span>
      );
  }
}
