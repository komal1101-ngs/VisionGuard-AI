import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', change = null }) {
  const colorGradients = {
    cyan: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
  };

  const iconBgs = {
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-b ${colorGradients[color] || colorGradients.cyan} p-5 glass-panel glass-panel-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</span>
            {change && (
              <span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                {change}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${iconBgs[color] || iconBgs.cyan}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/[0.02] pointer-events-none" />
    </div>
  );
}
