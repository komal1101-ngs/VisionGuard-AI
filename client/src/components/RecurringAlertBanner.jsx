import React from 'react';
import { History, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecurringAlertBanner({ workstationId, details, count, onInspect }) {
  if (!details && !workstationId) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/5 p-4 sm:p-5 shadow-lg shadow-amber-950/20">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 mt-0.5 sm:mt-0 animate-pulse">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                Recurring Hazard Alert
              </span>
              {workstationId && (
                <span className="font-mono text-xs font-semibold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {workstationId}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-200 font-medium leading-relaxed">
              {details || `Persistent violation detected at workstation ${workstationId} across multiple inspection cycles.`}
            </p>
          </div>
        </div>

        {workstationId && (
          <Link
            to={`/workstations/${workstationId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors shrink-0 whitespace-nowrap self-end sm:self-center"
          >
            Audit History Timeline
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
