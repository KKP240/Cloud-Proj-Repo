// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const checkJwt = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

// public endpoints (later add auth middleware for protected routes)
router.get('/activities', activityController.list);
router.get('/activities/:id', activityController.detail);
router.post('/activities', checkJwt, activityController.create); // ต้อง login
router.put('/activities:id', checkJwt, activityController.update);
router.delete('/activities:id', checkJwt, activityController.remove);

module.exports = router;
