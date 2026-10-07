import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Server, 
  History, 
  Calendar, 
  AlertOctagon, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Filter,
  Camera
} from 'lucide-react';
import { workstationsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RecurringAlertBanner } from '../components/RecurringAlertBanner';
import { IssueCard } from '../components/IssueCard';

export function WorkstationHistory() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [workstations, setWorkstations] = useState([]);
  const [selectedWsId, setSelectedWsId] = useState(paramId || 'WS-04');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load workstations list
  useEffect(() => {
    async function loadWorkstations() {
      try {
        const res = await workstationsApi.getWorkstations();
        if (res.data.success) {
          setWorkstations(res.data.data);
          if (!paramId && res.data.data.length > 0) {
            // Default to WS-04 if present, else first
            const hasWS04 = res.data.data.find(w => w.workstation_id === 'WS-04');
            setSelectedWsId(hasWS04 ? 'WS-04' : res.data.data[0].workstation_id);
          }
        }
      } catch (err) {
        console.error('Failed to load workstations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkstations();
  }, [paramId]);

  // Load chronological history whenever selectedWsId changes
  useEffect(() => {
    if (!selectedWsId) return;

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const res = await workstationsApi.getWorkstationHistory(selectedWsId);
        if (res.data.success) {
          setHistoryData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load workstation history:', err);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, [selectedWsId]);

  const currentWsSummary = workstations.find(w => w.workstation_id === selectedWsId);
  const latestAudit = historyData[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Server className="w-8 h-8 text-cyan-400" />
            Workstation Historical Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit logs timeline and recurring hazard pattern tracking for individual lab benches.
          </p>
        </div>

        {/* Workstation Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase">Target Station:</label>
          <select
            value={selectedWsId}
            onChange={(e) => {
              setSelectedWsId(e.target.value);
              navigate(`/workstations/${e.target.value}`);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
          >
            {workstations.map(w => (
              <option key={w.workstation_id} value={w.workstation_id}>
                {w.workstation_id} — {w.lab_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Workstation Status Card */}
      {currentWsSummary && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-panel space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800">
                {currentWsSummary.workstation_id}
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">{currentWsSummary.lab_name}</h3>
                <p className="text-xs text-slate-400">
                  Total Audits Logged: {currentWsSummary.total_audits} • Active Critical Issues: {currentWsSummary.critical_issues_count}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Latest Condition:</span>
              <StatusBadge condition={currentWsSummary.latest_condition} className="text-sm py-1.5 px-3.5" />
            </div>
          </div>

          {/* Recurring Alert Banner if workstation has persistent violations */}
          {currentWsSummary.is_recurring && (
            <RecurringAlertBanner
              workstationId={currentWsSummary.workstation_id}
              details={currentWsSummary.recurring_details}
            />
          )}
        </div>
      )}

      {/* Chronological Audit Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Chronological Audit Timeline ({historyData.length} Inspections)
          </h3>
          <span className="text-xs font-mono text-slate-500">NEWEST TO OLDEST</span>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : historyData.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900 text-center text-slate-400">
            No audits recorded for this workstation yet.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
            {historyData.map((audit, idx) => (
              <div key={audit.id} className="relative pl-12 space-y-4">
                
                {/* Timeline node bullet */}
                <div className={`absolute left-3.5 -translate-x-1/2 top-4 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  audit.overall_condition === 'Critical Risk'
                    ? 'bg-rose-500 shadow-sm shadow-rose-500'
                    : audit.overall_condition === 'Needs Attention'
                    ? 'bg-amber-400 shadow-sm shadow-amber-400'
                    : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                }`} />

                {/* Audit Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        Audit #{historyData.length - idx}
                      </span>
                      <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(audit.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {audit.is_recurring && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                          Recurring Flagged
                        </span>
                      )}
                      <StatusBadge condition={audit.overall_condition} />
                    </div>
                  </div>

                  {/* Audit details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {audit.image_url && (
                      <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-800 h-36 bg-slate-950">
                        <img
                          src={audit.image_url}
                          alt="Workstation audit frame"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </div>
                    )}

                    <div className={`space-y-3 ${audit.image_url ? 'md:col-span-3' : 'md:col-span-4'}`}>
                      {audit.recurring_details && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                          <strong>Recurrence Trend:</strong> {audit.recurring_details}
                        </div>
                      )}

                      <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Identified Anomalies ({(audit.detected_issues || []).length})
                        </p>
                        <div className="space-y-2">
                          {(audit.detected_issues || []).map((iss) => (
                            <IssueCard key={iss.id} issue={iss} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
