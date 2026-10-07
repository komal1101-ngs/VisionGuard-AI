import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export function StatusBadge({ condition, className = '' }) {
  if (condition === 'Good') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Good
      </span>
    );
  }

  if (condition === 'Needs Attention') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-950 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Needs Attention
      </span>
    );
  }

  // Critical Risk
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
      Critical Risk
    </span>
  );
}

export function SeverityBadge({ severity, className = '' }) {
  if (severity === 'Critical') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        Critical
      </span>
    );
  }

  if (severity === 'Medium') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Medium
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-700/40 text-slate-300 border border-slate-600/50 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Low
    </span>
  );
}

export function CategoryBadge({ category, className = '' }) {
  const styles = {
    Safety: 'bg-red-500/10 text-red-300 border-red-500/30',
    Maintenance: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    Equipment: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    Organization: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${styles[category] || 'bg-slate-800 text-slate-300 border-slate-700'} ${className}`}>
      {category}
    </span>
  );
}

export function IssueStatusBadge({ status, className = '' }) {
  if (status === 'Resolved') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}>
        ✓ Resolved
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30 ${className}`}>
        ⏳ In Progress
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 ${className}`}>
      ● Pending
    </span>
  );
}
