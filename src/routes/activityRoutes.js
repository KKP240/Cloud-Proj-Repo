// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// public endpoints (later add auth middleware for protected routes)
router.get('/', activityController.list);
router.get('/:id', activityController.getById);
router.post('/', activityController.create);
router.put('/:id', activityController.update);
router.delete('/:id', activityController.remove);

module.exports = router;
