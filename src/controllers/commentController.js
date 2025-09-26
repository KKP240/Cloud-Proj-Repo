// src/controllers/commentController.js
const { Comment, User } = require('../../models');

module.exports = {
  // POST /api/activities/:id/comments
  async create(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content is required' });
      // ดึง userId จาก req.auth (middleware จะเซ็ตไว้หลังตรวจสอบ JWT)
      const userId = req.auth?.sub ? Number(req.auth.sub) : null;
      if (!userId) return res.status(401).json({ error: 'Unauthorized: userId not found' });
      const comment = await Comment.create({ activityId: id, userId, content });
      // include user info for immediate display
      const commentWithUser = await Comment.findByPk(comment.id, { include: User });
      res.status(201).json(commentWithUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /api/comments/:commentId
  async remove(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findByPk(commentId);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
      await comment.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
