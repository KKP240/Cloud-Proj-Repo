// src/middlewares/optionalJwt.js
require('dotenv').config();
const jwtLib = require('jsonwebtoken');

const LOCAL_JWT_SECRET = process.env.LOCAL_JWT_SECRET || null;

function optionalJwt(req, res, next) {
  const authHeader = req.headers.authorization || req.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    req.auth = null;
    return next();
  }
  if (LOCAL_JWT_SECRET) {
    try {
      const payload = jwtLib.verify(token, LOCAL_JWT_SECRET);
      req.auth = payload;
      return next();
    } catch (e) {
      req.auth = null;
      return next();
    }
  }
  // TODO: Add Cognito/JWKS verification if needed
  req.auth = null;
  next();
}

module.exports = optionalJwt;
