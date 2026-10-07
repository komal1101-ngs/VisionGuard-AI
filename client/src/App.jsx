import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { NewAudit } from './pages/NewAudit';
import { WorkstationHistory } from './pages/WorkstationHistory';
import { IssuesTracker } from './pages/IssuesTracker';
import { AnalyticsReport } from './pages/AnalyticsReport';
import { systemApi } from './services/api';

export default function App() {
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await systemApi.getHealth();
        if (res.data) setSystemHealth(res.data);
      } catch (err) {
        console.warn('Backend system health check unavailable:', err.message);
      }
    }
    checkHealth();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
          <Navbar systemHealth={systemHealth} />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-audit" element={<NewAudit />} />
                <Route path="/workstations" element={<WorkstationHistory />} />
                <Route path="/workstations/:id" element={<WorkstationHistory />} />
                <Route path="/issues" element={<IssuesTracker />} />
                <Route path="/reports" element={<AnalyticsReport />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
