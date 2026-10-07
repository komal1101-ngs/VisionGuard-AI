import { Router } from 'express';
import { z } from 'zod';
import { supabase, isSupabaseConfigured, inMemoryStore } from '../config/supabase.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

const UpdateStatusSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Resolved'])
});

// ------------------------------------------------------------------------------
// GET /api/issues - List All Detected Issues with Filters
// ------------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { status, severity, category, search, limit = 100, offset = 0 } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase
        .from('detected_issues')
        .select(`
          *,
          inspections:inspection_id (
            id, lab_name, workstation_id, overall_condition, created_at, image_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (status) query = query.eq('status', status);
      if (severity) query = query.eq('severity', severity);
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('issue', `%${search}%`);

      const { data, count, error } = await query;
      if (error) throw error;

      return res.json({
        success: true,
        total: count || 0,
        data: data || []
      });
    } else {
      let list = inMemoryStore.detected_issues.map(iss => {
        const inspection = inMemoryStore.inspections.find(i => i.id === iss.inspection_id);
        return {
          ...iss,
          inspections: inspection ? {
            id: inspection.id,
            lab_name: inspection.lab_name,
            workstation_id: inspection.workstation_id,
            overall_condition: inspection.overall_condition,
            created_at: inspection.created_at,
            image_url: inspection.image_url
          } : null
        };
      });

      if (status) list = list.filter(i => i.status === status);
      if (severity) list = list.filter(i => i.severity === severity);
      if (category) list = list.filter(i => i.category === category);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(i => 
          i.issue.toLowerCase().includes(s) || 
          (i.explanation && i.explanation.toLowerCase().includes(s)) ||
          (i.inspections && i.inspections.workstation_id.toLowerCase().includes(s))
        );
      }

      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const total = list.length;
      const paginated = list.slice(Number(offset), Number(offset) + Number(limit));

      return res.json({
        success: true,
        total,
        data: paginated
      });
    }
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// PATCH /api/issues/:id/status - Update Issue Status (Pending -> In Progress -> Resolved)
// ------------------------------------------------------------------------------
router.patch('/:id/status', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = UpdateStatusSchema.parse(req.body);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('detected_issues')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Issue not found or update failed.' });
      }

      return res.json({
        success: true,
        message: `Issue status updated to "${status}"`,
        data
      });
    } else {
      const issue = inMemoryStore.detected_issues.find(i => i.id === id);
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
      }

      issue.status = status;
      return res.json({
        success: true,
        message: `Issue status updated to "${status}"`,
        data: issue
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
