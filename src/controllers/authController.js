// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const JWT_SECRET = process.env.LOCAL_JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.LOCAL_JWT_EXPIRES || '2h';

module.exports = {
  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed, role: 'user', firstName, lastName });

      // return minimal user (no password)
      return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      // sign local JWT (for dev testing)
      const payload = { sub: String(user.id), email: user.email, name: user.name, 'custom:role': user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  },

  // get current user (from req.auth set by authMiddleware)
  async me(req, res) {
    const auth = req.auth || {};
    // if local JWT, auth may contain sub/email/name already
    if (auth.sub && auth.email) {
      return res.json({ id: auth.sub, email: auth.email, name: auth.name, username : auth.username , firstName : auth.firstName, lastName: auth.lastName || null });
    }
    // fallback: try to find in DB by id
    try {
      if (!auth.sub) return res.status(401).json({ error: 'Unauthorized' });
      const user = await User.findByPk(auth.sub, { attributes: ['id', 'name', 'email'] });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
};
