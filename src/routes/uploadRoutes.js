// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const checkJwt = require('../middlewares/authMiddleware');
const uploadController = require('../controllers/uploadController');

// 👇 เพิ่ม Route นี้เข้าไป
router.post('/upload/presigned-url', checkJwt, uploadController.getPresignedUrl);

module.exports = router;