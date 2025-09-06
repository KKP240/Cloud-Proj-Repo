const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const checkJwt = require('../middlewares/authMiddleware');

router.post('/activities/:id/register', checkJwt, registrationController.register);
router.delete('/registrations/:id', checkJwt, registrationController.cancel);

module.exports = router;
