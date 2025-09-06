// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const checkJwt = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

// public endpoints (later add auth middleware for protected routes)
router.get('/', activityController.list);
router.get('/:id', activityController.getById);
router.post('/', checkJwt, activityController.create); // ต้อง login
router.put('/:id', checkJwt, activityController.update);
router.delete('/:id', checkJwt, activityController.remove);

module.exports = router;
