import { Router } from 'express';
import { supabase, isSupabaseConfigured, inMemoryStore } from '../config/supabase.js';

const router = Router();

// ------------------------------------------------------------------------------
// GET /api/analytics/summary - High-Level Laboratory Safety Metrics
// ------------------------------------------------------------------------------
router.get('/summary', async (req, res, next) => {
  try {
    let inspections = [];
    let issues = [];

    if (isSupabaseConfigured()) {
      const { data: inspData } = await supabase.from('inspections').select('*');
      const { data: issData } = await supabase.from('detected_issues').select('*');
      inspections = inspData || [];
      issues = issData || [];
    } else {
      inspections = [...inMemoryStore.inspections];
      issues = [...inMemoryStore.detected_issues];
    }

    const totalInspections = inspections.length;
    const totalIssues = issues.length;

    // Severity Breakdown
    const severityCount = {
      Critical: issues.filter(i => i.severity === 'Critical').length,
      Medium: issues.filter(i => i.severity === 'Medium').length,
      Low: issues.filter(i => i.severity === 'Low').length
    };

    // Status Breakdown
    const statusCount = {
      Pending: issues.filter(i => i.status === 'Pending').length,
      InProgress: issues.filter(i => i.status === 'In Progress').length,
      Resolved: issues.filter(i => i.status === 'Resolved').length
    };

    // Category Breakdown
    const categoryCount = {
      Safety: issues.filter(i => i.category === 'Safety').length,
      Maintenance: issues.filter(i => i.category === 'Maintenance').length,
      Equipment: issues.filter(i => i.category === 'Equipment').length,
      Organization: issues.filter(i => i.category === 'Organization').length
    };

    // Condition Distribution
    const conditionCount = {
      Good: inspections.filter(i => i.overall_condition === 'Good').length,
      NeedsAttention: inspections.filter(i => i.overall_condition === 'Needs Attention').length,
      CriticalRisk: inspections.filter(i => i.overall_condition === 'Critical Risk').length
    };

    // Calculate Lab Safety Index (0 - 100)
    // Formula: Good (100%), Needs Attention (60%), Critical Risk (10%)
    let safetyScore = 100;
    if (totalInspections > 0) {
      const weightedSum = (conditionCount.Good * 100) + 
                          (conditionCount.NeedsAttention * 60) + 
                          (conditionCount.CriticalRisk * 15);
      safetyScore = Math.round(weightedSum / totalInspections);
    }

    // Identify Workstations with Recurring Issues
    const recurringInspections = inspections.filter(i => i.is_recurring);
    const recurringWorkstationIds = [...new Set(recurringInspections.map(i => i.workstation_id))];

    // Recurring Workstation summary list
    const recurringWorkstations = recurringWorkstationIds.map(wsId => {
      const audits = inspections.filter(i => i.workstation_id === wsId);
      const auditIssues = issues.filter(iss => audits.some(a => a.id === iss.inspection_id));
      const criticalCount = auditIssues.filter(iss => iss.severity === 'Critical').length;
      const latestAudit = audits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      return {
        workstation_id: wsId,
        lab_name: latestAudit?.lab_name || 'Engineering Lab',
        auditCount: audits.length,
        criticalCount,
        latestCondition: latestAudit?.overall_condition || 'Needs Attention',
        recurringDetails: latestAudit?.recurring_details || 'Repeated violations across multiple cycles.'
      };
    });

    res.json({
      success: true,
      data: {
        totalInspections,
        totalIssues,
        safetyScore,
        severityCount,
        statusCount,
        categoryCount,
        conditionCount,
        recurringCount: recurringInspections.length,
        recurringWorkstations
      }
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/analytics/labs - Metrics grouped by laboratory
// ------------------------------------------------------------------------------
router.get('/labs', async (req, res, next) => {
  try {
    let inspections = [];
    let issues = [];

    if (isSupabaseConfigured()) {
      const { data: inspData } = await supabase.from('inspections').select('*');
      const { data: issData } = await supabase.from('detected_issues').select('*');
      inspections = inspData || [];
      issues = issData || [];
    } else {
      inspections = [...inMemoryStore.inspections];
      issues = [...inMemoryStore.detected_issues];
    }

    const labMap = {};
    inspections.forEach(insp => {
      const lab = insp.lab_name;
      if (!labMap[lab]) {
        labMap[lab] = {
          lab_name: lab,
          inspectionsCount: 0,
          goodCount: 0,
          needsAttentionCount: 0,
          criticalCount: 0,
          issuesCount: 0,
          workstations: new Set()
        };
      }

      labMap[lab].inspectionsCount++;
      labMap[lab].workstations.add(insp.workstation_id);

      if (insp.overall_condition === 'Good') labMap[lab].goodCount++;
      else if (insp.overall_condition === 'Needs Attention') labMap[lab].needsAttentionCount++;
      else if (insp.overall_condition === 'Critical Risk') labMap[lab].criticalCount++;

      const labIssues = issues.filter(iss => iss.inspection_id === insp.id);
      labMap[lab].issuesCount += labIssues.length;
    });

    const labs = Object.values(labMap).map(l => ({
      ...l,
      workstationsCount: l.workstations.size,
      workstations: Array.from(l.workstations),
      complianceScore: l.inspectionsCount > 0 
        ? Math.round(((l.goodCount * 100) + (l.needsAttentionCount * 60) + (l.criticalCount * 15)) / l.inspectionsCount)
        : 100
    }));

    res.json({ success: true, data: labs });
  } catch (error) {
    next(error);
  }
});

export default router;
