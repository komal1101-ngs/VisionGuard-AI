import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env.js';
import { supabase, isSupabaseConfigured, inMemoryStore } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'lab_staff', 'inspector']).default('inspector')
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// ------------------------------------------------------------------------------
// POST /api/auth/register
// ------------------------------------------------------------------------------
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    if (isSupabaseConfigured()) {
      // Check existing email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .single();

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email is already registered.' });
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            name: validatedData.name,
            email: validatedData.email,
            password_hash: passwordHash,
            role: validatedData.role
          }
        ])
        .select('id, name, email, role, created_at')
        .single();

      if (error) throw error;

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: newUser
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryStore.users.find(u => u.email.toLowerCase() === validatedData.email.toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email is already registered.' });
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        role: validatedData.role,
        created_at: new Date().toISOString()
      };
      inMemoryStore.users.push(newUser);

      const { password_hash, ...safeUser } = newUser;
      const token = generateToken(safeUser);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: safeUser
      });
    }
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// POST /api/auth/login
// ------------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    let userRecord = null;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      userRecord = data;
    } else {
      userRecord = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userRecord) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = userRecord;
    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/auth/me
// ------------------------------------------------------------------------------
router.get('/me', authenticate, async (req, res, next) => {
  try {
    let user = null;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('id', req.user.id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      user = data;
    } else {
      const found = inMemoryStore.users.find(u => u.id === req.user.id);
      if (!found) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const { password_hash, ...safeUser } = found;
      user = safeUser;
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------------------
// GET /api/auth/demo-users (For quick UI switcher)
// ------------------------------------------------------------------------------
router.get('/demo-users', (req, res) => {
  res.json({
    success: true,
    users: [
      { email: 'admin@visionguard.edu', role: 'admin', name: 'Dr. Sarah Connor (Admin)' },
      { email: 'staff@visionguard.edu', role: 'lab_staff', name: 'Marcus Vance (Lab Staff)' },
      { email: 'inspector@visionguard.edu', role: 'inspector', name: 'Elena Rostova (Inspector)' }
    ],
    defaultPassword: 'Password@123'
  });
});

export default router;
