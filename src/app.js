// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// mount routes later
// const activityRoutes = require('./routes/activityRoutes');
// app.use('/api/activities', activityRoutes);

module.exports = app;
