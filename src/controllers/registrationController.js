// src/controllers/registrationController.js
const { Activity, Registration, sequelize } = require('../../models');

module.exports = {
  // POST /api/activities/:id/register
  async register(req, res) {
    const activityId = Number(req.params.id);
    // get userId from token (req.auth.sub) or from body (dev)
    const userId = req.auth ? req.auth.sub : (req.body.userId || null);

    if (!userId) return res.status(400).json({ error: 'No userId found (authentication required)' });

    const t = await sequelize.transaction();
    try {
      const activity = await Activity.findByPk(activityId, { transaction: t });
      if (!activity) {
        await t.rollback();
        return res.status(404).json({ error: 'Activity not found' });
      }

      // count existing registrations with status = 'registered'
      const currentCount = await Registration.count({
        where: { activityId, status: 'registered' },
        transaction: t
      });

      if (activity.capacity !== null && activity.capacity <= currentCount) {
        await t.rollback();
        return res.status(400).json({ error: 'Activity is full' });
      }

      // check duplicate registration
      const existing = await Registration.findOne({
        where: { activityId, userId },
        transaction: t
      });

      if (existing) {
        await t.rollback();
        return res.status(409).json({ error: 'User already registered' });
      }

      const registration = await Registration.create({
        userId,
        activityId,
        status: 'registered',
        registeredAt: new Date()
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ registration });
    } catch (err) {
      await t.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  // DELETE /api/registrations/:id  (cancel registration)
  async cancel(req, res) {
    const regId = Number(req.params.id);
    // For safety: ensure user owns registration OR admin
    const userId = req.auth ? req.auth.sub : (req.body.userId || null);

    try {
      const reg = await Registration.findByPk(regId);
      if (!reg) return res.status(404).json({ error: 'Registration not found' });

      // if not owner and not admin -> forbid (assume req.auth['cognito:groups'] contains 'admin')
      const groups = (req.auth && req.auth['cognito:groups']) || [];
      const isAdmin = groups.includes('admin');

      if (!isAdmin && String(reg.userId) !== String(userId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await reg.update({ status: 'cancelled' });
      return res.json({ message: 'Cancelled', registration: reg });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
};
