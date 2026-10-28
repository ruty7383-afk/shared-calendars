const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized, asyncHandler } = require('../utils/errors');
const { query } = require('../db');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw unauthorized('Invalid or expired token');
  }
  const { rows } = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw unauthorized('User no longer exists');
  req.user = rows[0];
  next();
});

const signToken = (user) => jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

module.exports = { requireAuth, signToken };
