import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, PlusCircle, User, LogOut, CheckCircle, Database, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ systemHealth }) {
  const { user, loginAsDemo, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const demoAccounts = [
    { email: 'admin@visionguard.edu', role: 'admin', label: 'Dr. Sarah Connor (Admin)' },
    { email: 'staff@visionguard.edu', role: 'lab_staff', label: 'Marcus Vance (Lab Staff)' },
    { email: 'inspector@visionguard.edu', role: 'inspector', label: 'Elena Rostova (Inspector)' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#080d1a]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-950 group-hover:shadow-cyan-500/20 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                VisionGuard <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Intelligent Visual Auditor for Engineering Labs
              </span>
            </div>
          </Link>
        </div>

        {/* Live System Diagnostics Badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">AI:</span>
            <span className="font-semibold text-slate-200">
              {systemHealth?.aiEngine?.provider || 'Google Gemini Vision'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">DB:</span>
            <span className="font-semibold text-slate-200">
              {systemHealth?.database?.supabaseConfigured ? 'Supabase Cloud' : 'High-Fidelity DB'}
            </span>
          </div>
        </div>

        {/* User Controls & Quick Action */}
        <div className="flex items-center gap-3">
          <Link
            to="/new-audit"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-950 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Audit</span>
            <span className="sm:hidden">Audit</span>
          </Link>

          {/* User Profile & Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold font-mono text-[10px]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-slate-200 leading-tight max-w-[120px] truncate">{user?.name || 'Inspector'}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider">{user?.role || 'inspector'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-300">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Switch Persona Demo:
                  </p>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        loginAsDemo(acc.email);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        user?.email === acc.email
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {user?.email === acc.email && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
