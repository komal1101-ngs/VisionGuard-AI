import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { config } from './env.js';

const isPlaceholder = (val) => !val || val.includes('placeholder') || val.includes('your-supabase');

export const isSupabaseConfigured = () => {
  return !isPlaceholder(config.supabase.url) && 
         (!isPlaceholder(config.supabase.serviceRoleKey) || !isPlaceholder(config.supabase.anonKey));
};

// Initialize Supabase Client
let supabase = null;
let supabaseAdmin = null;

if (isSupabaseConfigured()) {
  const keyToUse = !isPlaceholder(config.supabase.serviceRoleKey) 
    ? config.supabase.serviceRoleKey 
    : config.supabase.anonKey;

  const clientOptions = {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: {
      transport: WebSocket
    }
  };

  supabase = createClient(config.supabase.url, keyToUse, clientOptions);

  supabaseAdmin = createClient(
    config.supabase.url, 
    !isPlaceholder(config.supabase.serviceRoleKey) ? config.supabase.serviceRoleKey : keyToUse, 
    clientOptions
  );

  console.log('✅ Supabase Client initialized with URL:', config.supabase.url);
} else {
  console.warn('⚠️ Supabase credentials not set or using placeholder. Running in High-Fidelity Local Database Fallback mode.');
}

// ---------------------------------------------------------------------------------
// Fallback In-Memory Storage Seed Data (Matches 001_initial_schema.sql perfectly)
// ---------------------------------------------------------------------------------
const inMemoryStore = {
  users: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@visionguard.edu',
      password_hash: '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', // 'Password@123'
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      name: 'Marcus Vance (Lab Staff)',
      email: 'staff@visionguard.edu',
      password_hash: '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', // 'Password@123'
      role: 'lab_staff',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Elena Rostova (Inspector)',
      email: 'inspector@visionguard.edu',
      password_hash: '$2a$10$7zBv4R3f35Kz7qjO6qO0xeX4p4Yx6oFj4I8wB.zB9q8cR6jEsqvG6', // 'Password@123'
      role: 'inspector',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  inspections: [
    {
      id: 'd4444444-4444-4444-4444-444444444441',
      lab_name: 'Robotics & Embedded Systems Lab',
      workstation_id: 'WS-01',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      overall_condition: 'Good',
      is_recurring: false,
      recurring_details: null,
      inspected_by: 'c3333333-3333-3333-3333-333333333333',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'd4444444-4444-4444-4444-444444444442',
      lab_name: 'VLSI & Hardware Testing Lab',
      workstation_id: 'WS-04',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      overall_condition: 'Needs Attention',
      is_recurring: false,
      recurring_details: null,
      inspected_by: 'c3333333-3333-3333-3333-333333333333',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'd4444444-4444-4444-4444-444444444443',
      lab_name: 'VLSI & Hardware Testing Lab',
      workstation_id: 'WS-04',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      overall_condition: 'Needs Attention',
      is_recurring: true,
      recurring_details: 'Workstation WS-04 has shown repeated wire clutter and missing ESD protection in 2 consecutive audits.',
      inspected_by: 'b2222222-2222-2222-2222-222222222222',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'd4444444-4444-4444-4444-444444444444',
      lab_name: 'VLSI & Hardware Testing Lab',
      workstation_id: 'WS-04',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      overall_condition: 'Critical Risk',
      is_recurring: true,
      recurring_details: 'Workstation WS-04 has experienced repeated wire clutter and missing safety gear across 3 consecutive audits.',
      inspected_by: 'c3333333-3333-3333-3333-333333333333',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  ],
  detected_issues: [
    {
      id: 'e5555555-5555-5555-5555-555555555551',
      inspection_id: 'd4444444-4444-4444-4444-444444444441',
      issue: 'Unlabeled oscilloscope probe leads',
      category: 'Organization',
      severity: 'Low',
      confidence: 0.91,
      explanation: 'Oscilloscope probes are properly coiled but lack workstation channel labeling tags.',
      recommended_action: 'Affix color-coded heat-shrink identification markers on probe terminals.',
      status: 'Resolved',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'e5555555-5555-5555-5555-555555555552',
      inspection_id: 'd4444444-4444-4444-4444-444444444442',
      issue: 'Tangled 12V DC power cables on primary bench',
      category: 'Maintenance',
      severity: 'Medium',
      confidence: 0.88,
      explanation: 'DC banana plug cords are crossed over active testing area.',
      recommended_action: 'Use spiral cable wrap and secure to under-bench cable tray.',
      status: 'Resolved',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'e5555555-5555-5555-5555-555555555553',
      inspection_id: 'd4444444-4444-4444-4444-444444444443',
      issue: 'Recurrence of tangled wiring near heating station',
      category: 'Safety',
      severity: 'Medium',
      confidence: 0.92,
      explanation: 'Previous wire tangling recommendation was not sustained; cables are back across soldering tray.',
      recommended_action: 'Install permanent magnetic cable organizers along back wall.',
      status: 'In Progress',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'e5555555-5555-5555-5555-555555555554',
      inspection_id: 'd4444444-4444-4444-4444-444444444444',
      issue: 'Exposed high-voltage wire touching energized soldering iron stand',
      category: 'Safety',
      severity: 'Critical',
      confidence: 0.96,
      explanation: 'Loose AC mains conductor is draped directly across the metal cradle of an active 350°C soldering iron.',
      recommended_action: 'IMMEDIATELY disconnect power strip, quarantine faulty lead, and re-route power lines away from thermal sources.',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'e5555555-5555-5555-5555-555555555555',
      inspection_id: 'd4444444-4444-4444-4444-444444444444',
      issue: 'Missing ESD wrist strap and eye protection',
      category: 'Safety',
      severity: 'Medium',
      confidence: 0.94,
      explanation: 'Workstation operator has disassembled SMD board without grounded wrist strap or safety glasses in perimeter.',
      recommended_action: 'Replenish safety goggles station and connect ESD grounding banana plug before next shift.',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'e5555555-5555-5555-5555-555555555556',
      inspection_id: 'd4444444-4444-4444-4444-444444444444',
      issue: 'Isopropyl Alcohol bottle uncapped next to test bench',
      category: 'Safety',
      severity: 'Critical',
      confidence: 0.93,
      explanation: 'Flammable 99% IPA solvent bottle left open within 15cm of potential spark source (relay test jig).',
      recommended_action: 'Seal solvent dispenser and stow in designated yellow flammable chemical cabinet.',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  ]
};

export { supabase, supabaseAdmin, inMemoryStore };
