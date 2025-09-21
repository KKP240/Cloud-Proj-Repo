// src/controllers/registrationController.js
const { sequelize, Registration, Activity, User } = require('../../models');

module.exports = {
  // POST /api/activities/:id/register
  async register(req, res) {
    const activityId = Number(req.params.id);
    // get user id from req.auth
    const userId = req.auth && (req.auth.sub || req.auth.userId || req.auth.id) ? Number(req.auth.sub || req.auth.userId || req.auth.id) : null;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!activityId) return res.status(400).json({ error: 'Invalid activity id' });

    const t = await sequelize.transaction();
    try {
      // lock activity row to avoid race conditions
      const activity = await Activity.findByPk(activityId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!activity) { await t.rollback(); return res.status(404).json({ error: 'Activity not found' }); }

      // count current registered
      const current = await Registration.count({ where: { activityId, status: 'registered' }, transaction: t });

      if (activity.capacity && Number(activity.capacity) > 0 && current >= Number(activity.capacity)) {
        await t.rollback();
        return res.status(400).json({ error: 'Event is full' });
      }

      // check already registered
      const existing = await Registration.findOne({ where: { activityId, userId, status: 'registered' }, transaction: t });
      if (existing) {
        await t.rollback();
        return res.status(400).json({ error: 'Already registered' });
      }

      const reg = await Registration.create({
        activityId,
        userId,
        status: 'registered',
        registeredAt: new Date()
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ registration: reg });
    } catch (err) {
      await t.rollback().catch(()=>{});
      console.error('register error', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  // POST /api/activities/:id/cancel
  async cancel(req, res) {
    const activityId = Number(req.params.id);
    const userId = req.auth && (req.auth.sub || req.auth.userId || req.auth.id) ? Number(req.auth.sub || req.auth.userId || req.auth.id) : null;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!activityId) return res.status(400).json({ error: 'Invalid activity id' });

    try {
      const reg = await Registration.findOne({ where: { activityId, userId, status: 'registered' } });
      if (!reg) return res.status(404).json({ error: 'Registration not found' });

      reg.status = 'cancelled';
      await reg.save();
      return res.json({ success: true, registration: reg });
    } catch (err) {
      console.error('cancel error', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  // GET /api/activities/:id/participants
  // optional query: ?limit=100&offset=0
  async participants(req, res) {
    const activityId = Number(req.params.id);
    if (!activityId) return res.status(400).json({ error: 'Invalid activity id' });

    const limit = Math.min(200, Number(req.query.limit) || 100);
    const offset = Math.max(0, Number(req.query.offset) || 0);

    try {
      // join Registration + User
      const regs = await Registration.findAll({
        where: { activityId, status: 'registered' },
        include: [{ model: User, attributes: ['id', 'username', 'firstName', 'lastName', 'email'] }],
        order: [['registeredAt', 'ASC']],
        limit,
        offset
      });

      // map to user list
      const users = regs.map(r => ({
        registrationId: r.id,
        registeredAt: r.registeredAt,
        user: r.User ? {
          id: r.User.id,
          username: r.User.username,
          firstName: r.User.firstName,
          lastName: r.User.lastName,
          email: r.User.email
        } : null
      }));

      return res.json({ participants: users, count: users.length });
    } catch (err) {
      console.error('participants error', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  // ✨ GET /api/user/activity-ids - ดึงรายการ activity IDs ที่ผู้ใช้ join แล้ว
  async getUserActivityIds(req, res) {
    try {
      const userId = req.auth && (req.auth.sub || req.auth.userId || req.auth.id) ? 
                    Number(req.auth.sub || req.auth.userId || req.auth.id) : null;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const userRegistrations = await Registration.findAll({
        where: { 
          userId: userId,
          status: 'registered'
        },
        attributes: ['activityId']
      });

      const activityIds = userRegistrations.map(reg => reg.activityId);
      
      res.json(activityIds);
    } catch (error) {
      console.error('Error fetching user activity IDs:', error);
      res.status(500).json({ error: 'Failed to fetch user activity IDs' });
    }
  }
};