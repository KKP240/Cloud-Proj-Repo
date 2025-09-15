// src/controllers/activityController.js
const { Activity, ActivityImage, Tag, Comment, Registration, User } = require('../../models');

module.exports = {

  async detail(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid activity id' });

      // โหลด activity พร้อม relations (tags, images, comments (+ user))
      const activity = await Activity.findByPk(id, {
        include: [
          { model: Tag, through: { attributes: [] } },
          { model: ActivityImage },
          { model: Comment, include: [{ model: User, attributes: ['id','username','firstName','lastName'] } ] }
        ]
      });

      if (!activity) return res.status(404).json({ error: 'Activity not found' });

      // นับผู้เข้าร่วมสถานะ registered
      const participantCount = await Registration.count({
        where: { activityId: id, status: 'registered' }
      });

      // ตรวจว่า request มีผู้ใช้ล็อกอินแล้วหรือไม่ และผู้ใช้นั้นลงทะเบียนไว้หรือยัง
      let isRegistered = false;
      let myRegistrationId = null;
      // req.auth อาจมีหลายรูปแบบ ขึ้นกับ middleware ของคุณ
      const userId = req.auth && (req.auth.sub || req.auth.userId || req.auth.id || req.auth.username) ? Number(req.auth.sub || req.auth.userId || req.auth.id) : null;
      if (userId) {
        const reg = await Registration.findOne({
          where: { activityId: id, userId, status: 'registered' }
        });
        if (reg) { isRegistered = true; myRegistrationId = reg.id; }
      }

      // ส่ง response
      return res.json({
        activity,
        participantCount,
        isRegistered,
        myRegistrationId
      });
    } catch (err) {
      console.error('activity detail error', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  },

  async list(req, res) {
    try {
      if (!Activity) {
        console.error('Activity model is NOT defined. models object keys:', Object.keys(models || {}));
        return res.status(500).json({ error: 'Server error: Activity model not found' });
      }
      const activities = await Activity.findAll();
      res.json(activities);
    } catch (err) {
      console.error('ActivityController Error:', err && err.stack ? err.stack : err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getById(req, res) {
    try {
      const activity = await Activity.findByPk(req.params.id);
      if (!activity) return res.status(404).json({ error: 'Not found' });
      res.json(activity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      // get creator user id from auth middleware (req.auth.sub) if exists
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

      // handle tags: find or create, then associate
      if (Array.isArray(tags) && tags.length) {
        // normalize tag names
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

      // handle images: create ActivityImage entries
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
  }
};
