import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  Camera, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

import { StatCard } from '../components/StatCard';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { RecurringAlertBanner } from '../components/RecurringAlertBanner';
import { analyticsApi, inspectionsApi } from '../services/api';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [labs, setLabs] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, labsRes, inspRes] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getLabs(),
          inspectionsApi.getInspections({ limit: 6 })
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (labsRes.data.success) setLabs(labsRes.data.data);
        if (inspRes.data.success) setRecentInspections(inspRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs font-mono text-cyan-400">LOADING SAFETY METRICS...</p>
        </div>
      </div>
    );
  }

  // Charts Data
  const severityData = [
    { name: 'Critical', value: summary?.severityCount?.Critical || 0, color: '#f43f5e' },
    { name: 'Medium', value: summary?.severityCount?.Medium || 0, color: '#f59e0b' },
    { name: 'Low', value: summary?.severityCount?.Low || 0, color: '#06b6d4' }
  ];

  const categoryData = [
    { name: 'Safety', count: summary?.categoryCount?.Safety || 0, fill: '#ef4444' },
    { name: 'Maintenance', count: summary?.categoryCount?.Maintenance || 0, fill: '#3b82f6' },
    { name: 'Equipment', count: summary?.categoryCount?.Equipment || 0, fill: '#a855f7' },
    { name: 'Organization', count: summary?.categoryCount?.Organization || 0, fill: '#10b981' },
  ];

  const recurringItem = summary?.recurringWorkstations?.[0];

  return (
    <div className="space-y-8">
      {/* Top Banner & Call to Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Engineering Lab Safety Command
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AUDIT ACTIVE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time visual anomaly auditing, historical cross-referencing, and proactive compliance intelligence.
          </p>
        </div>

        <Link
          to="/new-audit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-950/60 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Camera className="w-4 h-4" />
          Deploy Agentic Scan
        </Link>
      </div>

      {/* Recurring Violation Highlight Banner */}
      {recurringItem && (
        <RecurringAlertBanner
          workstationId={recurringItem.workstation_id}
          details={recurringItem.recurringDetails}
        />
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lab Safety Index"
          value={`${summary?.safetyScore || 92}%`}
          subtitle="Based on condition weighting"
          icon={Activity}
          color={summary?.safetyScore > 80 ? 'emerald' : summary?.safetyScore > 60 ? 'amber' : 'rose'}
          change="+4.2% this month"
        />
        <StatCard
          title="Total Audits"
          value={summary?.totalInspections || 0}
          subtitle="Across all laboratories"
          icon={Layers}
          color="cyan"
          change="4 audits logged"
        />
        <StatCard
          title="Critical Hazards"
          value={summary?.severityCount?.Critical || 0}
          subtitle="Immediate remediation needed"
          icon={ShieldAlert}
          color="rose"
          change="Action required"
        />
        <StatCard
          title="Pending Actions"
          value={summary?.statusCount?.Pending || 0}
          subtitle={`${summary?.statusCount?.Resolved || 0} already resolved`}
          icon={AlertTriangle}
          color="amber"
          change={`${summary?.recurringCount || 0} recurring flags`}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Severity Breakdown Donut */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Severity Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {summary?.totalIssues || 0} Total Hazards
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-black font-mono text-white">
                {summary?.totalIssues || 0}
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Issues</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Hazard Category Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Hazards by Operational Category
            </h3>
            <span className="text-xs font-mono text-cyan-400">OSHA / IEEE DOMAINS</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-slate-800 text-center text-xs">
            {categoryData.map(c => (
              <div key={c.name}>
                <span className="text-slate-400 text-[10px] uppercase block">{c.name}</span>
                <span className="font-mono font-bold text-white text-sm">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Audits Table & Quick Inspect */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-panel">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Recent Laboratory Visual Audits</h3>
            <p className="text-xs text-slate-400">Historical visual inspection events with AI condition assessment</p>
          </div>
          <Link
            to="/workstations"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            All Workstations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentInspections.map((insp) => (
            <div
              key={insp.id}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                    {insp.workstation_id}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1.5 truncate max-w-[180px]">
                    {insp.lab_name}
                  </h4>
                </div>
                <StatusBadge condition={insp.overall_condition} />
              </div>

              {/* Workstation photo thumbnail */}
              {insp.image_url && (
                <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-800 relative bg-slate-900">
                  <img
                    src={insp.image_url}
                    alt={insp.workstation_id}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {insp.is_recurring && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                      Recurring Risk
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-slate-950/80 text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded">
                    {(insp.detected_issues || []).length} Anomalies
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(insp.created_at).toLocaleDateString()}
                </span>

                <Link
                  to={`/workstations/${insp.workstation_id}`}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
