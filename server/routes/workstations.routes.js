import { Router } from 'express';
import { supabase, isSupabaseConfigured, inMemoryStore } from '../config/supabase.js';

const router = Router();

// ------------------------------------------------------------------------------
// GET /api/workstations - List All Workstations & Their Current Status
// ------------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    let inspections = [];
    let issues = [];

    if (isSupabaseConfigured()) {
      const { data: inspData } = await supabase.from('inspections').select('*').order('created_at', { ascending: false });
      const { data: issData } = await supabase.from('detected_issues').select('*');
      inspections = inspData || [];
      issues = issData || [];
    } else {
      inspections = [...inMemoryStore.inspections].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      issues = [...inMemoryStore.detected_issues];
    }

    const wsMap = {};
    inspections.forEach(insp => {
      const wsId = insp.workstation_id;
      if (!wsMap[wsId]) {
        wsMap[wsId] = {
          workstation_id: wsId,
          lab_name: insp.lab_name,
          latest_condition: insp.overall_condition,
          latest_audit_at: insp.created_at,
          latest_image_url: insp.image_url,
          is_recurring: insp.is_recurring,
          recurring_details: insp.recurring_details,
          total_audits: 0,
          pending_issues_count: 0,
          critical_issues_count: 0
        };
      }
      wsMap[wsId].total_audits++;

      // Count issues for this inspection
      const inspIssues = issues.filter(i => i.inspection_id === insp.id);
      wsMap[wsId].pending_issues_count += inspIssues.filter(i => i.status !== 'Resolved').length;
      wsMap[wsId].critical_issues_count += inspIssues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
    });

    res.json({
      success: true,
      data: Object.values(wsMap)
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/workstations/:id/history - Chronological Audit Timeline for Workstation
// ------------------------------------------------------------------------------
router.get('/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          users:inspected_by ( id, name, email, role ),
          detected_issues (*)
        `)
        .ilike('workstation_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({
        success: true,
        workstation_id: id,
        total_audits: data?.length || 0,
        data: data || []
      });
    } else {
      const audits = inMemoryStore.inspections
        .filter(i => i.workstation_id.toUpperCase() === id.toUpperCase())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(insp => {
          const inspector = inMemoryStore.users.find(u => u.id === insp.inspected_by);
          const issues = inMemoryStore.detected_issues.filter(d => d.inspection_id === insp.id);
          return {
            ...insp,
            users: inspector ? { id: inspector.id, name: inspector.name, email: inspector.email, role: inspector.role } : null,
            detected_issues: issues
          };
        });

      return res.json({
        success: true,
        workstation_id: id,
        total_audits: audits.length,
        data: audits
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
