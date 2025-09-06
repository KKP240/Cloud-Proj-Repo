// src/middlewares/authMiddleware.js
require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const REGION = process.env.AWS_REGION;
const USER_POOL_ID = process.env.COGNITO_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || ''; // audience

// if dev and DISABLE_AUTH=true, middleware will bypass
const isAuthDisabled = process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true';

const checkJwt = (req, res, next) => {
  if (isAuthDisabled) {
    // for local dev: allow setting a fake user (via header X-User-Id or body.userId)
    const fakeUser = {
      sub: req.headers['x-user-id'] || req.body.userId || 'dev-user-1',
      email: req.headers['x-user-email'] || 'dev@example.com',
      'cognito:groups': []
    };
    req.auth = fakeUser;
    return next();
  }

  const issuer = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

  // express-jwt returns middleware; call it to process the request
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}/.well-known/jwks.json`
    }),
    audience: COGNITO_CLIENT_ID, // client id (app client)
    issuer,
    algorithms: ['RS256']
  })(req, res, (err) => {
    if (err) {
      // err.name === 'UnauthorizedError' when token invalid
      return res.status(401).json({ error: 'Unauthorized', details: err.message || err.name });
    }
    next();
  });
};

module.exports = checkJwt;
