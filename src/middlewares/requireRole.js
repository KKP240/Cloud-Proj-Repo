// src/middlewares/requireRole.js
module.exports = (role) => {
  return (req, res, next) => {
    // req.auth มาจาก authMiddleware
    const auth = req.auth || {};
    const groups = auth['cognito:groups'] || [];
    // หากใช้ custom claim เช่น 'custom:role' เปลี่ยนตามจริง
    const customRole = auth['custom:role'];

    if (groups.includes(role) || customRole === role) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  };
};
