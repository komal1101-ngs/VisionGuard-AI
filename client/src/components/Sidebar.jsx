import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Server, AlertCircle, FileBarChart2, ShieldCheck, Zap } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/new-audit', label: 'New Visual Audit', icon: Camera },
    { to: '/workstations', label: 'Workstations & History', icon: Server },
    { to: '/issues', label: 'Hazard & Action Tracker', icon: AlertCircle },
    { to: '/reports', label: 'Safety Reports & Export', icon: FileBarChart2 },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800 bg-[#090d16]/90 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Safety Standard Reference Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditing Standards</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Operating in accordance with IEEE 1584, NFPA 70E, and OSHA 1910 Electrical Lab Protocols.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>PIPELINE v1.0</span>
            <span className="text-emerald-400">STATUS ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
