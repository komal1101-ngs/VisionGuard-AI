import React, { useRef } from 'react';
import { X, Printer, Copy, CheckCircle2, Shield, Calendar, User, AlertOctagon } from 'lucide-react';
import { StatusBadge, SeverityBadge, CategoryBadge } from './StatusBadge';

export function ReportModal({ inspection, onClose }) {
  if (!inspection) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(inspection, null, 2));
    alert('Inspection audit data copied to clipboard as JSON!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Laboratory Visual Safety Audit Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Content */}
        <div className="p-8 space-y-6 text-slate-100 bg-[#0c1222] print:bg-white print:text-black">
          
          {/* Institution Header */}
          <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-cyan-400 print:text-blue-700">VISIONGUARD AI</span>
                <span className="text-xs font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded print:border print:border-black">
                  OFFICIAL AUDIT REPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Autonomous Visual Safety & Compliance Intelligence System
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-gray-600 font-mono">
              <p>Audit ID: {inspection.id}</p>
              <p>Timestamp: {new Date(inspection.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Audit Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs">
            <div>
              <span className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold block">Laboratory Name</span>
              <span className="font-semibold text-slate-200 print:text-black text-sm">{inspection.lab_name}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold block">Workstation Target</span>
              <span className="font-mono font-bold text-cyan-400 print:text-blue-700 text-sm">{inspection.workstation_id}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold block">Overall Safety Status</span>
              <div className="mt-1">
                <StatusBadge condition={inspection.overall_condition} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 uppercase text-[10px] font-bold block">Recurring Violation</span>
              <span className={`font-semibold text-sm ${inspection.is_recurring ? 'text-amber-400 print:text-amber-700' : 'text-emerald-400 print:text-green-700'}`}>
                {inspection.is_recurring ? '⚠️ Yes (Flagged)' : '✓ None Detected'}
              </span>
            </div>
          </div>

          {/* Recurring details if any */}
          {inspection.is_recurring && inspection.recurring_details && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 print:text-amber-800 text-xs">
              <span className="font-bold uppercase tracking-wider block mb-1">Cross-Referenced Historical Trend Analysis:</span>
              <p>{inspection.recurring_details}</p>
            </div>
          )}

          {/* Detected Issues Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Identified Anomalies & Remediation Mandates ({(inspection.detected_issues || []).length})
            </h4>

            <div className="space-y-3">
              {(inspection.detected_issues || []).map((iss, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 print:bg-white print:border-gray-300 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white print:text-black">
                      {idx + 1}. {iss.issue}
                    </span>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={iss.severity} />
                      <CategoryBadge category={iss.category} />
                      <span className="text-xs font-mono text-cyan-400 print:text-blue-700">
                        {Math.round((iss.confidence || 0.9) * 100)}% Conf.
                      </span>
                    </div>
                  </div>

                  {iss.explanation && (
                    <p className="text-xs text-slate-300 print:text-gray-700">
                      <strong>Observation:</strong> {iss.explanation}
                    </p>
                  )}

                  {iss.recommended_action && (
                    <p className="text-xs text-cyan-300 print:text-blue-900">
                      <strong>Corrective Protocol:</strong> {iss.recommended_action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certification Signature Block */}
          <div className="pt-8 border-t border-slate-800 flex items-end justify-between text-xs text-slate-400 print:text-gray-600">
            <div>
              <p>Auditor: {inspection.users?.name || 'VisionGuard Agentic Visual Auditor'}</p>
              <p>IEEE 1584 / OSHA 1910 Lab Compliance Standard</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-600 w-44 mb-1" />
              <p className="font-mono">AUTHORIZED LAB SIGNOFF</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
