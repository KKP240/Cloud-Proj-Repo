// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkJwt = require('../middlewares/authMiddleware');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', checkJwt, authController.me);
router.put('/auth/profile', checkJwt, authController.updateProfile); // แก้ไข 2 จุด

module.exports = router;