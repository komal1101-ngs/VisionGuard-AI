import React, { useEffect, useState } from 'react';
import { Camera, Eye, Cpu, CheckCircle2, History, AlertTriangle } from 'lucide-react';

export function ScanVisualizer({ isScanning, previewUrl, currentStep, workstationId }) {
  const steps = [
    { id: 1, label: 'Visual Capture & Frame Normalization', icon: Camera, desc: 'Preprocessing workstation telemetry & image artifacts' },
    { id: 2, label: 'Contextual Object & Hazard Detection', icon: Eye, desc: 'Identifying equipment, loose wiring, heat sources, safety gear' },
    { id: 3, label: 'Cross-Referencing Workstation History', icon: History, desc: `Querying Supabase for past inspection records of ${workstationId || 'workstation'}` },
    { id: 4, label: 'Agentic Reasoning & Action Plan', icon: Cpu, desc: 'Synthesizing IEEE/OSHA safety standards & corrective workflows' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-6 glass-panel">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Visual Frame Container */}
        <div className="relative w-full md:w-80 h-56 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Workstation scan preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-slate-500">
              <Camera className="w-10 h-10 mx-auto mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs">No visual frame loaded</p>
            </div>
          )}

          {/* Animated Laser Scan Bar */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="scanner-laser animate-scan" />
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
              
              {/* Corner targeting brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              <div className="absolute top-3 left-3 bg-slate-950/80 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-500/40">
                ACTIVE VISION SCAN: {workstationId || 'WS-TARGET'}
              </div>
            </div>
          )}
        </div>

        {/* 4-Step Pipeline Reasoning Feed */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Agentic Visual Intelligence Pipeline
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {isScanning ? 'REASONING IN PROGRESS...' : 'STANDBY'}
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = isScanning && currentStep === s.id;
              const isCompleted = currentStep > s.id;

              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                      : isCompleted
                      ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-900/30 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 animate-bounce'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${isActive ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                        {s.id}. {s.label}
                      </p>
                      {isActive && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30 animate-pulse">
                          PROCESSING
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
