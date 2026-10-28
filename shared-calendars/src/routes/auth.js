const express = require('express');
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../db');
const { asyncHandler, badRequest, unauthorized, conflict } = require('../utils/errors');
const { requireString, normalizeEmail, requireBodyObject } = require('../utils/validate');
const { requireAuth, signToken } = require('../middleware/auth');

const router = express.Router();

const formatUser = (u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at });

router.post('/register', asyncHandler(async (req, res) => {
  const body = requireBodyObject(req.body);
  const name = requireString(body.name, 'name', 2, 50);
  const email = normalizeEmail(body.email);
  const password = requireString(body.password, 'password', 6, 100);
  if (password !== body.password) throw badRequest('password must not start or end with spaces');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await withTransaction(async (client) => {
    const exists = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rows[0]) throw conflict('A user with this email already exists');

    const created = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash],
    );
    const u = created.rows[0];

    // הזמנות ממתינות לאימייל הזה הופכות לחברות, ואז נמחקות
    await client.query(
      `INSERT INTO calendar_members (calendar_id, user_id)
       SELECT i.calendar_id, $1 FROM invitations i
       JOIN calendars c ON c.id = i.calendar_id
       WHERE i.email = $2 AND c.owner_id <> $1
       ON CONFLICT DO NOTHING`,
      [u.id, email],
    );
    await client.query('DELETE FROM invitations WHERE email = $1', [email]);
    return u;
  });

  res.status(201).json({ user: formatUser(user), token: signToken(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const body = requireBodyObject(req.body);
  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    throw badRequest('email and password are required');
  }
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [body.email.trim().toLowerCase()]);
  const user = rows[0];
  const ok = user && (await bcrypt.compare(body.password, user.password_hash));
  if (!ok) throw unauthorized('Wrong email or password');
  res.json({ token: signToken(user), user: formatUser(user) });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json(formatUser(req.user));
});

module.exports = router;
