import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { isSupabaseConfigured } from './config/supabase.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import inspectionsRoutes from './routes/inspections.routes.js';
import issuesRoutes from './routes/issues.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import workstationsRoutes from './routes/workstations.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static file serving for uploaded workstation images
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Root Health & System Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'VisionGuard AI — Intelligent Visual Auditor',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      provider: isSupabaseConfigured() ? 'Supabase Cloud PostgreSQL' : 'Seeded Memory Store (Fallback Mode)',
      supabaseConfigured: isSupabaseConfigured()
    },
    aiEngine: {
      provider: config.gemini.apiKey ? 'Google Gemini Vision' : 'Rule-Based Heuristic Reasoning Engine',
      model: config.gemini.model,
      geminiConfigured: Boolean(config.gemini.apiKey)
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workstations', workstationsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🛡️  VisionGuard AI Backend Server running on port: ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database Status: ${isSupabaseConfigured() ? 'Connected to Supabase' : 'Running in High-Fidelity Local Fallback Mode'}`);
  console.log(`🤖 Gemini AI Status: ${config.gemini.apiKey ? 'Configured (' + config.gemini.model + ')' : 'Local Reasoning Fallback'}`);
  console.log('================================================================');
});

export default app;
