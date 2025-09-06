// src/controllers/activityController.js
const { Activity } = require('../../models');

module.exports = {
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
    try {
      const data = req.body;
      const activity = await Activity.create(data);
      res.status(201).json(activity);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Bad request', details: err.message });
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
