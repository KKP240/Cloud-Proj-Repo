// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { Op } = require('sequelize');

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
      const user = await User.create({ 
        username, 
        email, 
        password: hashed, 
        role: 'user', 
        firstName, 
        lastName 
      });

      // return minimal user (no password)
      return res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
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
      const payload = {
        sub: String(user.id),
        email: user.email,
        name: user.name,
        username: user.username,
        firstname: user.firstName, // ใช้ firstname แทน firstName ใน JWT
        lastname: user.lastName,   // ใช้ lastname แทน lastName ใน JWT
        'custom:role': user.role
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
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
      return res.json({ 
        user: {
          id: auth.sub, 
          email: auth.email, 
          name: auth.name, 
          username: auth.username, 
          firstName: auth.firstname || auth.firstName, // รองรับทั้ง 2 แบบ
          lastName: auth.lastname || auth.lastName
        }
      });
    }
    
    // fallback: try to find in DB by id
    try {
      if (!auth.sub) return res.status(401).json({ error: 'Unauthorized' });
      
      const user = await User.findByPk(auth.sub, { 
        attributes: ['id', 'username', 'email', 'firstName', 'lastName'] 
      });
      
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      return res.json({ user });
    } catch (err) {
      console.error('me error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/auth/profile - Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.auth && (req.auth.sub || req.auth.userId || req.auth.id) ? 
                     Number(req.auth.sub || req.auth.userId || req.auth.id) : null;
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { firstName, lastName, username, email } = req.body;

      // Validation
      if (!firstName && !lastName && !username && !email) {
        return res.status(400).json({ error: 'At least one field is required' });
      }

      // ตรวจสอบว่า email ซ้ำกับคนอื่นหรือไม่ (ถ้าเปลี่ยน email)
      if (email) {
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: userId } // ไม่รวมตัวเอง
          } 
        });
        if (existingUser) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      // ตรวจสอบว่า username ซ้ำกับคนอื่นหรือไม่ (ถ้าเปลี่ยน username)
      if (username) {
        const existingUser = await User.findOne({ 
          where: { 
            username,
            id: { [Op.ne]: userId }
          } 
        });
        if (existingUser) {
          return res.status(409).json({ error: 'Username already exists' });
        }
      }

      // สร้าง object สำหรับ update (เฉพาะ field ที่มีค่า)
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;

      // อัปเดตข้อมูล
      const [updatedRows] = await User.update(updateData, { 
        where: { id: userId } 
      });

      if (updatedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // ดึงข้อมูลที่อัปเดตแล้ว
      const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
      });

      // สร้าง JWT token ใหม่ด้วยข้อมูลที่อัปเดต
      const payload = {
        sub: String(updatedUser.id),
        email: updatedUser.email,
        username: updatedUser.username,
        firstname: updatedUser.firstName,
        lastname: updatedUser.lastName,
        'custom:role': 'user' // หรือดึงจาก user.role ถ้ามี
      };
      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      return res.json({ 
        success: true, 
        user: updatedUser,
        token: newToken // ส่ง token ใหม่กลับไปด้วย
      });

    } catch (err) {
      console.error('updateProfile error:', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
};