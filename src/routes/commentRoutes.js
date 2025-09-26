// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const checkJwt = require('../middlewares/authMiddleware');

// Add comment to activity
router.post('/activities/:id/comments', checkJwt, commentController.create);
// Delete comment
router.delete('/comments/:commentId', checkJwt, commentController.remove);

module.exports = router;
