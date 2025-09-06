// src/middlewares/authCognito.js
require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const REGION = process.env.AWS_REGION;
const USER_POOL_ID = process.env.COGNITO_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const issuer = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const jwtMiddleware = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}/.well-known/jwks.json`
  }),
  audience: CLIENT_ID,
  issuer: issuer,
  algorithms: ['RS256'],
  credentialsRequired: true, // ถ้าบาง route public ให้ใส่ false ในการเรียกใช้แบบ route-level
});

module.exports = jwtMiddleware;
