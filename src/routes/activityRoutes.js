// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const checkJwt = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');
const registrationController = require('../controllers/registrationController');

// public endpoints (later add auth middleware for protected routes)
router.get('/activities', activityController.list);
router.get('/activities/:id', activityController.detail);
router.post('/activities', checkJwt, activityController.create); // ต้อง login
router.put('/activities/:id', checkJwt, activityController.update);
router.delete('/activities/:id', checkJwt, activityController.remove);

// registration endpoints
router.post('/activities/:id/register', checkJwt, registrationController.register);
router.post('/activities/:id/cancel', checkJwt, registrationController.cancel);
router.get('/activities/:id/participants', checkJwt, registrationController.participants);

// ✨ เพิ่ม route สำหรับดึงกิจกรรมที่ผู้ใช้ join แล้ว
router.get('/user/activity-ids', checkJwt, registrationController.getUserActivityIds);

module.exports = router;