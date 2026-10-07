import React, { useEffect, useState } from 'react';
import { 
  FileBarChart2, 
  Download, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { analyticsApi, inspectionsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ReportModal } from '../components/ReportModal';

export function AnalyticsReport() {
  const [labs, setLabs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allInspections, setAllInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [labsRes, sumRes, inspRes] = await Promise.all([
          analyticsApi.getLabs(),
          analyticsApi.getSummary(),
          inspectionsApi.getInspections({ limit: 50 })
        ]);

        if (labsRes.data.success) setLabs(labsRes.data.data);
        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (inspRes.data.success) setAllInspections(inspRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <FileBarChart2 className="w-8 h-8 text-cyan-400" />
            Laboratory Compliance & Safety Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated institutional compliance auditing, facility rankings, and certified export reports.
          </p>
        </div>

        <button
          onClick={() => {
            if (allInspections.length > 0) {
              setSelectedInspection(allInspections[0]);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Generate Certified Audit Report
        </button>
      </div>

      {/* Facility Rankings & Compliance Index */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-panel space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Laboratory Safety Compliance Index
            </h3>
            <p className="text-xs text-slate-400">Institutional rankings based on weighted audit pass rates</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {labs.length} Facilities Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {labs.map((lab) => {
            const score = lab.complianceScore;
            return (
              <div key={lab.lab_name} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{lab.lab_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lab.workstationsCount} Workstations Monitored • {lab.inspectionsCount} Total Audits Logged • {lab.issuesCount} Anomalies
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className={`text-xl font-black font-mono ${
                      score >= 85 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {score}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Audit Certificates Available for Export */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Certified Inspection Records Archive
            </h3>
            <p className="text-xs text-slate-400">Click any audit to open formal printable certificate and export</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {allInspections.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {allInspections.map((insp) => (
            <div
              key={insp.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-lg transition-colors cursor-pointer"
              onClick={() => setSelectedInspection(insp)}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                  {insp.workstation_id}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{insp.lab_name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {new Date(insp.created_at).toLocaleString()} • {(insp.detected_issues || []).length} Detected Anomalies
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <StatusBadge condition={insp.overall_condition} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInspection(insp);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-cyan-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedInspection && (
        <ReportModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
}
