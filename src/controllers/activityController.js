// src/controllers/activityController.js
const { Activity, ActivityImage, Tag, Comment, Registration, User } = require('../../models');
const { sequelize } = require('../../models');

module.exports = {

  // ========================= DETAIL =========================
  async detail(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid activity id' });

      // โหลด activity พร้อม relations (Tags, Images, Comments (+User))
      const activity = await Activity.findByPk(id, {
        include: [
          { model: Tag, through: { attributes: [] } },
          { model: ActivityImage },
          { model: Comment, include: [{ model: User, attributes: ['id','username','firstName','lastName'] }] }
        ]
      });

      if (!activity) return res.status(404).json({ error: 'Activity not found' });

      // นับผู้เข้าร่วมสถานะ registered
      const participantCount = await Registration.count({
        where: { activityId: id, status: 'registered' }
      });

      // Initialize registration status
    let isRegistered = false;
    let myRegistrationId = null;

    // Extract userId from req.auth
    const userId = req.auth?.sub ? Number(req.auth.sub) : null;
    console.log('req.auth:', req.auth);
    console.log('detail userId:', userId);

    if (userId) {
      // Check if user is registered for this activity
      const reg = await Registration.findOne({
        where: { activityId: id, userId, status: 'registered' }
      });

      // Set initial isRegistered based on registration check
      isRegistered = !!reg; // true if registration exists, false otherwise
      myRegistrationId = reg ? reg.id : null;

    } else {
      console.log('No authenticated user, setting isRegistered to false');
    }

    return res.json({
      activity,
      participantCount,
      isRegistered,
      myRegistrationId
    });
  } catch (err) {
    console.error('activity detail error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
  },

  // ========================= LIST =========================
  async list(req, res) {
    try {
      const activities = await Activity.findAll({
        include: [
          { model: Tag, through: { attributes: [] } },    // include Tags
          { model: ActivityImage }                        // include Images
        ]
      });
      res.json(activities);
    } catch (err) {
      console.error('ActivityController Error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ========================= GET BY ID =========================
  async getById(req, res) {
    try {
      const activity = await Activity.findByPk(req.params.id, {
        include: [
          { model: Tag, through: { attributes: [] } },
          { model: ActivityImage }
        ]
      });
      if (!activity) return res.status(404).json({ error: 'Not found' });
      res.json(activity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ========================= CREATE =========================
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const creatorId = req.auth && (req.auth.sub || req.auth['cognito:username'] || req.auth.username) ? Number(req.auth.sub || req.auth['cognito:username'] || req.auth.username) : null;

      const {
        title, description, location, country, province,
        startDate, endDate, capacity,
        tags = [], images = []
      } = req.body;

      if (!title) {
        await t.rollback();
        return res.status(400).json({ error: 'title is required' });
      }

      // create activity
      const activity = await Activity.create({
        title,
        description,
        location,
        country,
        province,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity ? Number(capacity) : null,
        creatorId: creatorId || null,
        posterUrl: images.length ? images[0] : null
      }, { transaction: t });

      // handle tags
      if (Array.isArray(tags) && tags.length) {
        const normalized = tags.map(s => String(s).trim().toLowerCase()).filter(Boolean);
        const tagRecords = [];
        for (const tn of normalized) {
          const [tag] = await Tag.findOrCreate({
            where: { name: tn },
            defaults: { name: tn },
            transaction: t
          });
          tagRecords.push(tag);
        }
        if (tagRecords.length) {
          await activity.setTags(tagRecords, { transaction: t });
        }
      }

      // handle images
      if (Array.isArray(images) && images.length) {
        const imageCreates = images.map((url, idx) => ({
          activityId: activity.id,
          url,
          alt: '',
          order: idx
        }));
        await ActivityImage.bulkCreate(imageCreates, { transaction: t });
      }

      await t.commit();

      // reload activity with associations to return
      const result = await Activity.findByPk(activity.id, {
        include: [
          { model: Tag, through: { attributes: [] } },
          { model: ActivityImage }
        ]
      });

      return res.status(201).json({ activity: result });
    } catch (err) {
      console.error('create activity error', err);
      try { await t.rollback(); } catch(e){/* ignore */ }
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  // ========================= UPDATE =========================
  async update(req, res) {
    try {
      const activity = await Activity.findByPk(req.params.id);
      if (!activity) return res.status(404).json({ error: 'Not found' });
      await activity.update(req.body);
      res.json(activity);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Bad request', details: err.message });
    }
  },

  // ========================= DELETE =========================
  async remove(req, res) {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Not found' });
    await activity.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
},
// ========================= LIST MY ACTIVITIES =========================
async myActivities(req, res) {
  try {
    const userId = req.auth?.sub ? Number(req.auth.sub) : null;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activities = await Activity.findAll({
      where: { creatorId: userId },
      include: [
        { model: Tag, through: { attributes: [] } },
        { model: ActivityImage }
      ]
    });

    res.json(activities);
  } catch (err) {
    console.error('myActivities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
},


};
