import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { supabase, isSupabaseConfigured, inMemoryStore } from '../config/supabase.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { runVisionGuardAgent } from '../services/geminiAgent.js';
import { config } from '../config/env.js';

const router = Router();

const isTableMissing = (err) => err && (err.code === 'PGRST205' || err.code === '42P01' || err.message?.includes('schema cache'));

const NewInspectionSchema = z.object({
  lab_name: z.string().min(2, 'Lab name is required'),
  workstation_id: z.string().min(2, 'Workstation ID is required'),
  image_url: z.string().optional()
});

// ------------------------------------------------------------------------------
// POST /api/inspections - Run AI Visual Audit & Save Inspection
// ------------------------------------------------------------------------------
router.post('/', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { lab_name, workstation_id, image_url: providedImageUrl } = req.body;
    NewInspectionSchema.parse({ lab_name, workstation_id, image_url: providedImageUrl });

    let imageBuffer = null;
    let mimeType = 'image/jpeg';
    let storedImageUrl = providedImageUrl || '';

    // If an image file was uploaded
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;

      const extension = path.extname(req.file.originalname) || '.jpg';
      const fileName = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
      const filePath = path.join(config.uploads.dir, fileName);

      fs.writeFileSync(filePath, imageBuffer);
      storedImageUrl = `/uploads/${fileName}`;
    } else if (providedImageUrl) {
      if (providedImageUrl.startsWith('data:image/')) {
        const matches = providedImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
          const ext = mimeType.split('/')[1] || 'jpg';
          const fileName = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
          const filePath = path.join(config.uploads.dir, fileName);
          fs.writeFileSync(filePath, imageBuffer);
          storedImageUrl = `/uploads/${fileName}`;
        }
      } else {
        try {
          const fetchRes = await fetch(providedImageUrl);
          if (fetchRes.ok) {
            const arrayBuf = await fetchRes.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuf);
            mimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
          }
        } catch (fetchErr) {
          console.warn('Could not fetch remote image buffer for Gemini, falling back to simulated inference:', fetchErr.message);
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Inspection requires either an uploaded image file or a valid image_url.'
      });
    }

    // Step 1: Retrieve historical inspections for this workstation
    let historicalInspections = [];

    if (isSupabaseConfigured()) {
      try {
        const { data: histData, error } = await supabase
          .from('inspections')
          .select(`
            id, lab_name, workstation_id, overall_condition, is_recurring, created_at,
            detected_issues ( id, issue, category, severity, status )
          `)
          .eq('workstation_id', workstation_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error && isTableMissing(error)) {
          throw error;
        }
        historicalInspections = histData || [];
      } catch (histErr) {
        console.warn('Supabase inspections table not found yet. Using local history:', histErr.message);
        const hist = inMemoryStore.inspections
          .filter(i => i.workstation_id.toUpperCase() === workstation_id.toUpperCase())
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        historicalInspections = hist.map(i => ({
          ...i,
          detected_issues: inMemoryStore.detected_issues.filter(d => d.inspection_id === i.id)
        }));
      }
    } else {
      const hist = inMemoryStore.inspections
        .filter(i => i.workstation_id.toUpperCase() === workstation_id.toUpperCase())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      historicalInspections = hist.map(i => ({
        ...i,
        detected_issues: inMemoryStore.detected_issues.filter(d => d.inspection_id === i.id)
      }));
    }

    // Step 2: Run Gemini Agent Reasoning Pipeline
    const agentAnalysis = await runVisionGuardAgent({
      imageBuffer: imageBuffer || Buffer.from(''),
      mimeType,
      labName: lab_name,
      workstationId: workstation_id,
      historicalInspections
    });

    const inspectorId = req.user?.id || (inMemoryStore.users[2]?.id || null);
    const newInspectionId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const inspectionRecord = {
      id: newInspectionId,
      lab_name,
      workstation_id,
      image_url: storedImageUrl,
      overall_condition: agentAnalysis.overallCondition,
      is_recurring: agentAnalysis.isRecurring,
      recurring_details: agentAnalysis.recurringDetails || null,
      inspected_by: inspectorId,
      created_at: createdAt
    };

    const detectedIssuesList = (agentAnalysis.issues || []).map(issue => ({
      id: crypto.randomUUID(),
      inspection_id: newInspectionId,
      issue: issue.issue,
      category: issue.category,
      severity: issue.severity,
      confidence: issue.confidence || 0.9,
      explanation: issue.explanation,
      recommended_action: issue.recommendedAction,
      status: 'Pending',
      created_at: createdAt
    }));

    // Step 3: Persist Inspection and Detected Issues
    let persistedToSupabase = false;
    if (isSupabaseConfigured()) {
      try {
        const { error: insErr } = await supabase
          .from('inspections')
          .insert([inspectionRecord]);

        if (insErr) throw insErr;

        if (detectedIssuesList.length > 0) {
          const { error: issErr } = await supabase
            .from('detected_issues')
            .insert(detectedIssuesList);

          if (issErr) throw issErr;
        }
        persistedToSupabase = true;
      } catch (saveErr) {
        console.warn('⚠️ Supabase tables not yet created or error saving. Storing in local memory store:', saveErr.message);
        inMemoryStore.inspections.unshift(inspectionRecord);
        inMemoryStore.detected_issues.unshift(...detectedIssuesList);
      }
    } else {
      inMemoryStore.inspections.unshift(inspectionRecord);
      inMemoryStore.detected_issues.unshift(...detectedIssuesList);
    }

    return res.status(201).json({
      success: true,
      message: 'Inspection completed and saved successfully.',
      persistedToSupabase,
      data: {
        ...inspectionRecord,
        detected_issues: detectedIssuesList
      }
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/inspections - List Inspections with Filters
// ------------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { lab_name, workstation_id, overall_condition, limit = 50, offset = 0 } = req.query;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('inspections')
          .select(`
            *,
            users:inspected_by ( id, name, email, role ),
            detected_issues (*)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(Number(offset), Number(offset) + Number(limit) - 1);

        if (lab_name) query = query.eq('lab_name', lab_name);
        if (workstation_id) query = query.eq('workstation_id', workstation_id);
        if (overall_condition) query = query.eq('overall_condition', overall_condition);

        const { data, count, error } = await query;
        if (error && isTableMissing(error)) throw error;

        return res.json({
          success: true,
          total: count || 0,
          data: data || []
        });
      } catch (err) {
        // Table not yet created in Supabase SQL editor -> fallback to memory
      }
    }

    // In-memory fallback
    let list = inMemoryStore.inspections.map(insp => {
      const inspector = inMemoryStore.users.find(u => u.id === insp.inspected_by);
      const issues = inMemoryStore.detected_issues.filter(d => d.inspection_id === insp.id);
      return {
        ...insp,
        users: inspector ? { id: inspector.id, name: inspector.name, email: inspector.email, role: inspector.role } : null,
        detected_issues: issues
      };
    });

    if (lab_name) list = list.filter(i => i.lab_name.toLowerCase().includes(lab_name.toLowerCase()));
    if (workstation_id) list = list.filter(i => i.workstation_id.toUpperCase() === workstation_id.toUpperCase());
    if (overall_condition) list = list.filter(i => i.overall_condition === overall_condition);

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = list.length;
    const paginated = list.slice(Number(offset), Number(offset) + Number(limit));

    return res.json({
      success: true,
      total,
      data: paginated
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/inspections/:id - Get Single Inspection
// ------------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('inspections')
          .select(`
            *,
            users:inspected_by ( id, name, email, role ),
            detected_issues (*)
          `)
          .eq('id', id)
          .single();

        if (error && isTableMissing(error)) throw error;
        if (data) return res.json({ success: true, data });
      } catch (err) {
        // Fallback
      }
    }

    const insp = inMemoryStore.inspections.find(i => i.id === id);
    if (!insp) {
      return res.status(404).json({ success: false, message: 'Inspection record not found.' });
    }

    const inspector = inMemoryStore.users.find(u => u.id === insp.inspected_by);
    const issues = inMemoryStore.detected_issues.filter(d => d.inspection_id === insp.id);

    return res.json({
      success: true,
      data: {
        ...insp,
        users: inspector ? { id: inspector.id, name: inspector.name, email: inspector.email, role: inspector.role } : null,
        detected_issues: issues
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
