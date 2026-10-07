import React, { useState } from 'react';
import { AlertCircle, Wrench, Shield, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { SeverityBadge, CategoryBadge, IssueStatusBadge } from './StatusBadge';
import { issuesApi } from '../services/api';

export function IssueCard({ issue, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(issue.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await issuesApi.updateStatus(issue.id, newStatus);
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(issue.id, newStatus);
    } catch (err) {
      console.error('Failed to update issue status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const confidencePercentage = Math.round((Number(issue.confidence) || 0.88) * 100);

  return (
    <div className={`rounded-xl border p-5 transition-all glass-panel ${
      issue.severity === 'Critical'
        ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-slate-900/60'
        : issue.severity === 'Medium'
        ? 'border-amber-500/30 bg-slate-900/60'
        : 'border-slate-700/60 bg-slate-900/40'
    }`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <SeverityBadge severity={issue.severity} />
          <CategoryBadge category={issue.category} />
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            {confidencePercentage}% AI Confidence
          </span>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          <IssueStatusBadge status={currentStatus} />
          <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg border border-slate-700">
            {['Pending', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                disabled={isUpdating}
                onClick={() => handleStatusUpdate(st)}
                className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                  currentStatus === st
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body: Issue Details */}
      <div className="mt-3.5 space-y-3">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 shrink-0 ${
            issue.severity === 'Critical' ? 'text-rose-400' : issue.severity === 'Medium' ? 'text-amber-400' : 'text-slate-400'
          }`} />
          {issue.issue}
        </h4>

        {issue.explanation && (
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-400 block mb-1 uppercase tracking-wider text-[10px]">Technical Diagnosis:</span>
            {issue.explanation}
          </div>
        )}

        {issue.recommended_action && (
          <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
            <span className="font-semibold text-cyan-400 block mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Corrective Remediation Protocol:
            </span>
            {issue.recommended_action}
          </div>
        )}
      </div>
    </div>
  );
}
