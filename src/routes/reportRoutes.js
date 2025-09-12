// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const checkJwt = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

// ให้เฉพาะผู้ดูแล (admin) ดาวน์โหลด หรือ ถ้าต้องการเปิดให้เจ้าของ activity ก็แก้ requireRole
router.get('/activities/:id/registrations/export', checkJwt, reportController.exportRegistrations);

module.exports = router;
