require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtLib = require('jsonwebtoken');

const REGION = process.env.AWS_REGION || '';
const USER_POOL_ID = process.env.COGNITO_POOL_ID || '';
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';
const LOCAL_JWT_SECRET = process.env.LOCAL_JWT_SECRET || null;

const isAuthDisabled = process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true';

/**
 * Safe helper to get header or fallback
 */
function getHeader(req, name) {
  // header names are case-insensitive; use req.get for safety
  return req.get(name) || req.headers[name.toLowerCase()];
}

const checkJwt = async (req, res, next) => {
  try {
    if (isAuthDisabled) {
      // use optional chaining to avoid reading undefined
      const fakeUser = {
        sub: getHeader(req, 'x-user-id') || (req.body?.userId) || 'dev-user-1',
        email: getHeader(req, 'x-user-email') || (req.body?.userEmail) || 'dev@example.com',
        name: getHeader(req, 'x-user-name') || (req.body?.userName) || 'Dev User',
        'cognito:groups': []
      };
      req.auth = fakeUser;
      return next();
    }

    const authHeader = req.headers.authorization || req.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

    // Try local JWT verify first (dev token)
    if (LOCAL_JWT_SECRET) {
      try {
        const payload = jwtLib.verify(token, LOCAL_JWT_SECRET);
        req.auth = payload;
        return next();
      } catch (e) {
        // token is not local JWT or invalid -> fallthrough to Cognito verification
      }
    }

    // Cognito verification (RS256)
    const issuer = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

    return jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}/.well-known/jwks.json`
      }),
      audience: COGNITO_CLIENT_ID || undefined,
      issuer,
      algorithms: ['RS256']
    })(req, res, (err) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized', details: err.message || err.name });
      }
      next();
    });
  } catch (topErr) {
    console.error('authMiddleware top-level error:', topErr);
    return res.status(500).json({ error: 'Auth middleware error' });
  }
};

module.exports = checkJwt;