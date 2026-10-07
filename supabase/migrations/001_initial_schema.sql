-- ==============================================================================
-- VisionGuard AI: Database Schema Migration
-- Migration: 001_initial_schema.sql
-- Intelligent Visual Auditor for Engineering Labs
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('admin', 'lab_staff', 'inspector')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ------------------------------------------------------------------------------
-- 2. INSPECTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_name TEXT NOT NULL,
    workstation_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    overall_condition TEXT NOT NULL CHECK (overall_condition IN ('Good', 'Needs Attention', 'Critical Risk')),
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_details TEXT,
    inspected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance and historical trend queries
CREATE INDEX IF NOT EXISTS idx_inspections_workstation_id ON public.inspections(workstation_id);
CREATE INDEX IF NOT EXISTS idx_inspections_lab_name ON public.inspections(lab_name);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON public.inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_overall_condition ON public.inspections(overall_condition);

-- ------------------------------------------------------------------------------
-- 3. DETECTED_ISSUES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detected_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Safety', 'Maintenance', 'Equipment', 'Organization')),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'Critical')),
    confidence NUMERIC NOT NULL DEFAULT 0.85,
    explanation TEXT,
    recommended_action TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on foreign key, status, and severity
CREATE INDEX IF NOT EXISTS idx_detected_issues_inspection_id ON public.detected_issues(inspection_id);
CREATE INDEX IF NOT EXISTS idx_detected_issues_status ON public.detected_issues(status);
CREATE INDEX IF NOT EXISTS idx_detected_issues_severity ON public.detected_issues(severity);
CREATE INDEX IF NOT EXISTS idx_detected_issues_category ON public.detected_issues(category);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_issues ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read access for dashboard if configured, and full access for authenticated users & service role
DROP POLICY IF EXISTS "Users can view users" ON public.users;
CREATE POLICY "Users can view users" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role and authenticated insert users" ON public.users;
CREATE POLICY "Allow service role and authenticated insert users" ON public.users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inspections view policy" ON public.inspections;
CREATE POLICY "Inspections view policy" ON public.inspections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inspections insert policy" ON public.inspections;
CREATE POLICY "Inspections insert policy" ON public.inspections
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inspections update policy" ON public.inspections;
CREATE POLICY "Inspections update policy" ON public.inspections
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Detected issues view policy" ON public.detected_issues;
CREATE POLICY "Detected issues view policy" ON public.detected_issues
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Detected issues insert policy" ON public.detected_issues;
CREATE POLICY "Detected issues insert policy" ON public.detected_issues
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Detected issues update policy" ON public.detected_issues;
CREATE POLICY "Detected issues update policy" ON public.detected_issues
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Detected issues delete policy" ON public.detected_issues;
CREATE POLICY "Detected issues delete policy" ON public.detected_issues
    FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- SEED DATA (Demo Users, Historical Inspections & Recurring Issues)
-- ------------------------------------------------------------------------------

-- Seed Users:
-- Passwords all default to 'Password@123' (bcrypt hash: $2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6)
INSERT INTO public.users (id, name, email, password_hash, role, created_at)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'Dr. Sarah Connor (Admin)', 'admin@visionguard.edu', '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', 'admin', now() - interval '30 days'),
    ('b2222222-2222-2222-2222-222222222222', 'Marcus Vance (Lab Staff)', 'staff@visionguard.edu', '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', 'lab_staff', now() - interval '25 days'),
    ('c3333333-3333-3333-3333-333333333333', 'Elena Rostova (Inspector)', 'inspector@visionguard.edu', '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', 'inspector', now() - interval '20 days')
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- Seed Inspections: Historical audits showing recurring problem pattern at WS-04
INSERT INTO public.inspections (id, lab_name, workstation_id, image_url, overall_condition, is_recurring, recurring_details, inspected_by, created_at)
VALUES
    (
        'd4444444-4444-4444-4444-444444444441',
        'Robotics & Embedded Systems Lab',
        'WS-01',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        'Good',
        false,
        NULL,
        'c3333333-3333-3333-3333-333333333333',
        now() - interval '7 days'
    ),
    (
        'd4444444-4444-4444-4444-444444444442',
        'VLSI & Hardware Testing Lab',
        'WS-04',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        'Needs Attention',
        false,
        NULL,
        'c3333333-3333-3333-3333-333333333333',
        now() - interval '5 days'
    ),
    (
        'd4444444-4444-4444-4444-444444444443',
        'VLSI & Hardware Testing Lab',
        'WS-04',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        'Needs Attention',
        true,
        'Workstation WS-04 has shown repeated wire clutter and missing ESD protection in 2 consecutive audits.',
        'b2222222-2222-2222-2222-222222222222',
        now() - interval '2 days'
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'VLSI & Hardware Testing Lab',
        'WS-04',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        'Critical Risk',
        true,
        'Workstation WS-04 has experienced repeated wire clutter and missing safety gear across 3 consecutive audits.',
        'c3333333-3333-3333-3333-333333333333',
        now() - interval '2 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Detected Issues:
INSERT INTO public.detected_issues (id, inspection_id, issue, category, severity, confidence, explanation, recommended_action, status, created_at)
VALUES
    -- WS-01 issues (Minor)
    (
        'e5555555-5555-5555-5555-555555555551',
        'd4444444-4444-4444-4444-444444444441',
        'Unlabeled oscilloscope probe leads',
        'Organization',
        'Low',
        0.91,
        'Oscilloscope probes are properly coiled but lack workstation channel labeling tags.',
        'Affix color-coded heat-shrink identification markers on probe terminals.',
        'Resolved',
        now() - interval '7 days'
    ),
    -- WS-04 (5 days ago)
    (
        'e5555555-5555-5555-5555-555555555552',
        'd4444444-4444-4444-4444-444444444442',
        'Tangled 12V DC power cables on primary bench',
        'Maintenance',
        'Medium',
        0.88,
        'DC banana plug cords are crossed over active testing area.',
        'Use spiral cable wrap and secure to under-bench cable tray.',
        'Resolved',
        now() - interval '5 days'
    ),
    -- WS-04 (2 days ago)
    (
        'e5555555-5555-5555-5555-555555555553',
        'd4444444-4444-4444-4444-444444444443',
        'Recurrence of tangled wiring near heating station',
        'Safety',
        'Medium',
        0.92,
        'Previous wire tangling recommendation was not sustained; cables are back across soldering tray.',
        'Install permanent magnetic cable organizers along back wall.',
        'In Progress',
        now() - interval '2 days'
    ),
    -- WS-04 (Latest Critical Audit)
    (
        'e5555555-5555-5555-5555-555555555554',
        'd4444444-4444-4444-4444-444444444444',
        'Exposed high-voltage wire touching energized soldering iron stand',
        'Safety',
        'Critical',
        0.96,
        'Loose AC mains conductor is draped directly across the metal cradle of an active 350°C soldering iron.',
        'IMMEDIATELY disconnect power strip, quarantine faulty lead, and re-route power lines away from thermal sources.',
        'Pending',
        now() - interval '2 hours'
    ),
    (
        'e5555555-5555-5555-5555-555555555555',
        'd4444444-4444-4444-4444-444444444444',
        'Missing ESD wrist strap and eye protection',
        'Safety',
        'Medium',
        0.94,
        'Workstation operator has disassembled SMD board without grounded wrist strap or safety glasses in perimeter.',
        'Replenish safety goggles station and connect ESD grounding banana plug before next shift.',
        'Pending',
        now() - interval '2 hours'
    ),
    (
        'e5555555-5555-5555-5555-555555555556',
        'd4444444-4444-4444-4444-444444444444',
        'Isopropyl Alcohol bottle uncapped next to test bench',
        'Safety',
        'Critical',
        0.93,
        'Flammable 99% IPA solvent bottle left open within 15cm of potential spark source (relay test jig).',
        'Seal solvent dispenser and stow in designated yellow flammable chemical cabinet.',
        'Pending',
        now() - interval '2 hours'
    )
ON CONFLICT (id) DO NOTHING;
