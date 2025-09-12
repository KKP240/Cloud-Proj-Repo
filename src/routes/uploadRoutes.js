// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { getPresignedUploadUrl } = require('../services/s3Service');
const checkJwt = require('../middlewares/authMiddleware');

router.post('/upload-url', checkJwt, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });
    const key = `posters/${Date.now()}_${filename}`;
    const url = await getPresignedUploadUrl(key, contentType || 'image/jpeg');
    return res.json({ url, key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
