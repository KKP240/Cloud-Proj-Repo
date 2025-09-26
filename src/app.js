// src/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/api', activityRoutes);

const registrationRoutes = require('./routes/registrationRoutes');
app.use('/api', registrationRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api', uploadRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api', reportRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api', commentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
