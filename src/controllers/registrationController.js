// src/controllers/registrationController.js
const { sequelize, User, Activity, Registration } = require('../../models');

async function findOrCreateUserFromCognito(payload) {
  // payload: req.auth
  const cognitoSub = payload.sub;
  const email = payload.email || null;
  const name = payload.name || payload['cognito:username'] || null;

  let user = await User.findOne({ where: { cognitoSub } });
  if (!user) {
    // ถ้าไม่มี ให้สร้าง user เบื้องต้น (หรือ map by email ถาต้องการ)
    user = await User.create({ name, email, cognitoSub });
  }
  return user;
}

module.exports = {
  async register(req, res) {
    const activityId = parseInt(req.params.id, 10);
    if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });

    const t = await sequelize.transaction();
    try {
      const payload = req.auth;
      const user = await findOrCreateUserFromCognito(payload);

      const activity = await Activity.findByPk(activityId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!activity) {
        await t.rollback();
        return res.status(404).json({ error: 'Activity not found' });
      }

      // count current registrations
      const count = await Registration.count({ where: { activityId }, transaction: t });

      if (count >= activity.capacity) {
        await t.rollback();
        return res.status(409).json({ error: 'Activity full' });
      }

      // check duplicate
      const existed = await Registration.findOne({
        where: { userId: user.id, activityId },
        transaction: t
      });
      if (existed) {
        await t.rollback();
        return res.status(409).json({ error: 'Already registered' });
      }

      // create registration
      const registration = await Registration.create({
        userId: user.id,
        activityId,
        status: 'registered',
        registeredAt: new Date()
      }, { transaction: t });

      await t.commit();

      // (optional) trigger Lambda or background job to send email — can call async here
      res.status(201).json(registration);
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
};
