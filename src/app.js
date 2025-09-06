// src/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activities', activityRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
