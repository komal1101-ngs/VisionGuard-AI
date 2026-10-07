import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Wrench,
  ChevronDown
} from 'lucide-react';
import { issuesApi } from '../services/api';
import { IssueCard } from '../components/IssueCard';

export function IssuesTracker() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSeverity) params.severity = selectedSeverity;
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await issuesApi.getIssues(params);
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedStatus, selectedSeverity, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  const handleStatusChanged = (issueId, newStatus) => {
    setIssues(prev => prev.map(iss => iss.id === issueId ? { ...iss, status: newStatus } : iss));
  };

  const totalCount = issues.length;
  const criticalCount = issues.filter(i => i.severity === 'Critical').length;
  const pendingCount = issues.filter(i => i.status === 'Pending').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <AlertCircle className="w-8 h-8 text-cyan-400" />
          Hazard & Action Remediation Board
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track and resolve prioritized physical anomalies detected by autonomous visual audits.
        </p>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 glass-panel">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Hazards</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 glass-panel">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Critical Severity</span>
          <span className="text-2xl font-mono font-bold text-rose-300 mt-1 block">{criticalCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 glass-panel">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Pending Action</span>
          <span className="text-2xl font-mono font-bold text-amber-300 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 glass-panel">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Resolved</span>
          <span className="text-2xl font-mono font-bold text-emerald-300 mt-1 block">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 glass-panel space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hazard title, explanation, or workstation ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </form>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Categories</option>
              <option value="Safety">Safety</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Equipment">Equipment</option>
              <option value="Organization">Organization</option>
            </select>

            {(selectedStatus || selectedSeverity || selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedSeverity('');
                  setSelectedCategory('');
                  setSearchQuery('');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-60" />
            <p className="font-semibold text-sm">No issues matching the selected filters.</p>
            <p className="text-xs text-slate-500">All workstation safety requirements are in compliance.</p>
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onStatusChange={handleStatusChanged}
            />
          ))
        )}
      </div>
    </div>
  );
}
