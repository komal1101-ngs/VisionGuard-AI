import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  History, 
  ShieldCheck, 
  FileText, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { ScanVisualizer } from '../components/ScanVisualizer';
import { RecurringAlertBanner } from '../components/RecurringAlertBanner';
import { StatusBadge } from '../components/StatusBadge';
import { IssueCard } from '../components/IssueCard';
import { ReportModal } from '../components/ReportModal';
import { inspectionsApi } from '../services/api';

const PRESET_WORKSTATION_SCENARIOS = [
  {
    id: 'WS-04-hazard',
    lab_name: 'VLSI & Hardware Testing Lab',
    workstation_id: 'WS-04',
    title: 'WS-04: Soldering Bench Tangled AC Mains & Solvent Hazard',
    description: 'Repeated wire clutter violation near active 350°C iron stand (demonstrates multi-audit recurrence reasoning)',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    tag: 'Recurring Risk Target'
  },
  {
    id: 'WS-02-moderate',
    lab_name: 'Robotics & Embedded Systems Lab',
    workstation_id: 'WS-02',
    title: 'WS-02: Loose DC Power Wiring & Unlabeled Breadboard',
    description: 'Crossed DC power banana leads and unlabeled voltage test rail',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    tag: 'Moderate Hazard'
  },
  {
    id: 'WS-01-clean',
    lab_name: 'Robotics & Embedded Systems Lab',
    workstation_id: 'WS-01',
    title: 'WS-01: Compliant High-Frequency Oscilloscope Bench',
    description: 'Clean bench with organized leads, safety mat, and grounded ESD station',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    tag: 'Compliant Baseline'
  },
  {
    id: 'WS-06-chemical',
    lab_name: 'RF & Microwave Systems Lab',
    workstation_id: 'WS-06',
    title: 'WS-06: Uncapped IPA Solvent & Blocked Emergency Clearance',
    description: 'Chemical cleaning solvent left near live RF amplifier prototype',
    image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    tag: 'Chemical / Fire Risk'
  }
];

export function NewAudit() {
  const [labName, setLabName] = useState('VLSI & Hardware Testing Lab');
  const [workstationId, setWorkstationId] = useState('WS-04');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(PRESET_WORKSTATION_SCENARIOS[0].image_url);
  const [selectedPresetId, setSelectedPresetId] = useState('WS-04-hazard');

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [auditResult, setAuditResult] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSelectPreset = (scenario) => {
    setSelectedPresetId(scenario.id);
    setLabName(scenario.lab_name);
    setWorkstationId(scenario.workstation_id);
    setSelectedFile(null);
    setPreviewUrl(scenario.image_url);
    setAuditResult(null);
    setErrorMessage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedPresetId(null);
      setPreviewUrl(URL.createObjectURL(file));
      setAuditResult(null);
      setErrorMessage(null);
    }
  };

  const handleExecuteAudit = async () => {
    if (!previewUrl && !selectedFile) {
      setErrorMessage('Please select a preset image or upload a workstation photograph.');
      return;
    }

    setIsScanning(true);
    setAuditResult(null);
    setErrorMessage(null);

    // Simulate animated step progression through the 4-phase reasoning pipeline
    setScanStep(1);
    const step1Timer = setTimeout(() => setScanStep(2), 700);
    const step2Timer = setTimeout(() => setScanStep(3), 1600);
    const step3Timer = setTimeout(() => setScanStep(4), 2600);

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('lab_name', labName);
        payload.append('workstation_id', workstationId);
        payload.append('image', selectedFile);
      } else {
        payload = {
          lab_name: labName,
          workstation_id: workstationId,
          image_url: previewUrl
        };
      }

      const response = await inspectionsApi.createInspection(payload);

      // Finish scan animation
      setTimeout(() => {
        setIsScanning(false);
        setScanStep(4);
        if (response.data.success) {
          setAuditResult(response.data.data);
        }
      }, 3400);

    } catch (err) {
      console.error('Audit execution error:', err);
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsScanning(false);
      setErrorMessage(err.response?.data?.message || err.message || 'Audit failed. Check backend logs.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Camera className="w-8 h-8 text-cyan-400" />
          Autonomous Visual Audit Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform multi-phase visual safety inspection powered by Gemini Vision & Historical Supabase Cross-Referencing.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Target Workstation Configuration & Input Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Configuration Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 glass-panel space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Inspection Parameters
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Laboratory Facility
            </label>
            <select
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="VLSI & Hardware Testing Lab">VLSI & Hardware Testing Lab</option>
              <option value="Robotics & Embedded Systems Lab">Robotics & Embedded Systems Lab</option>
              <option value="RF & Microwave Systems Lab">RF & Microwave Systems Lab</option>
              <option value="Power Electronics & High Voltage Lab">Power Electronics & High Voltage Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Target Workstation Identifier
            </label>
            <input
              type="text"
              value={workstationId}
              onChange={(e) => setWorkstationId(e.target.value)}
              placeholder="e.g. WS-04, WS-01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: Select <strong className="text-amber-400">WS-04</strong> to activate historical multi-audit recurring violation reasoning!
            </p>
          </div>

          {/* Custom File Upload Option */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Upload Custom Workstation Image
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-cyan-950/10 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-300">
                {selectedFile ? selectedFile.name : 'Choose file or drag & drop'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Run Audit Button */}
          <button
            onClick={handleExecuteAudit}
            disabled={isScanning}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-size-200 hover:bg-right text-white shadow-lg shadow-cyan-950/80 hover:shadow-cyan-500/30'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                Executing Agentic Scan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Initiate Visual Safety Audit
              </>
            )}
          </button>
        </div>

        {/* Right: Realistic Presets for Instant 1-Click Evaluation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Evaluator Presets (Realistic Engineering Bench Scenarios)
            </h3>
            <span className="text-xs text-slate-500">Instant test benchmarks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRESET_WORKSTATION_SCENARIOS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPresetId === preset.id
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/50'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {preset.workstation_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    preset.tag.includes('Recurring')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : preset.tag.includes('Compliant')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {preset.tag}
                  </span>
                </div>

                <div className="h-28 rounded-lg overflow-hidden border border-slate-800 mb-2 relative">
                  <img
                    src={preset.image_url}
                    alt={preset.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedPresetId === preset.id && (
                    <div className="absolute inset-0 bg-cyan-500/15 border-2 border-cyan-400 pointer-events-none flex items-center justify-center">
                      <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                        Selected Target
                      </span>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-200 truncate">{preset.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{preset.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Visualizer & Pipeline Progress */}
      <ScanVisualizer
        isScanning={isScanning}
        currentStep={scanStep}
        previewUrl={previewUrl}
        workstationId={workstationId}
      />

      {/* Audit Inspection Result Section */}
      {auditResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Result Header & Status Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 glass-panel space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {auditResult.workstation_id}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {auditResult.lab_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Audit Completed: {new Date(auditResult.created_at).toLocaleString()} • Audit ID: {auditResult.id}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge condition={auditResult.overall_condition} className="text-sm py-1.5 px-4" />
                
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Certificate & Report
                </button>
              </div>
            </div>

            {/* Recurring Violation Alert if flagged */}
            {auditResult.is_recurring && (
              <RecurringAlertBanner
                workstationId={auditResult.workstation_id}
                details={auditResult.recurring_details}
              />
            )}

            {/* List of Detected Issues */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Detected Anomalies & Mandates ({(auditResult.detected_issues || []).length})
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  AGENTIC VERIFIED
                </span>
              </div>

              <div className="space-y-4">
                {(auditResult.detected_issues || []).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formal PDF Report Modal */}
      {reportModalOpen && auditResult && (
        <ReportModal
          inspection={auditResult}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
