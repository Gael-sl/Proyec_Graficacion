import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';

const router = express.Router();

// Create users table if it doesn't exist - MOVED TO initializeDatabase()
// This is now handled by config/database.js

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, email, password, name);

    res.json({
      id: userId,
      email,
      name,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // In a real app, you'd use JWT tokens here
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      token: `token_${user.id}_${Date.now()}`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user (verify token)
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Simple token validation (in production, use JWT)
    const userId = token.split('_')[1];
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
