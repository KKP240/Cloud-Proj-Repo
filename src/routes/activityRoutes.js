// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const checkJwt = require('../middlewares/authMiddleware');
const optionalJwt = require('../middlewares/optionalJwt');
const requireRole = require('../middlewares/requireRole');
const registrationController = require('../controllers/registrationController');

// public endpoints
router.get('/activities', activityController.list);
router.get('/activities/:id', optionalJwt, activityController.detail);
router.get('/activitiesEdit', checkJwt, activityController.list);
router.get('/activitiesEdit/:id', checkJwt, activityController.detail);
router.post('/activities', checkJwt, activityController.create);
router.put('/activities/:id', checkJwt, activityController.update);
router.delete('/activities/:id', checkJwt, activityController.remove);

// registration endpoints
router.post('/activities/:id/register', checkJwt, registrationController.register);
router.post('/activities/:id/cancel', checkJwt, registrationController.cancel);
router.get('/activities/:id/participants', registrationController.participants);

// ✅ แก้ไข: ใช้ controller ที่ถูกต้อง
router.get('/user/activity-ids', checkJwt, registrationController.getUserActivityIds);

// ✅ เพิ่ม route ใหม่สำหรับกิจกรรมที่ user สร้าง
router.get('/user/my-activities', checkJwt, activityController.myActivities);

module.exports = router;