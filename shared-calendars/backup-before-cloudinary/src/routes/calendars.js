const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, forbidden, notFound, conflict } = require('../utils/errors');
const { parseId, requireString, normalizeEmail, requireBodyObject } = require('../utils/validate');
const { getCalendarAccess, formatCalendar } = require('../utils/access');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.name, c.owner_id, c.created_at,
            CASE WHEN c.owner_id = $1 THEN 'owner' ELSE 'member' END AS role
     FROM calendars c
     WHERE c.owner_id = $1
        OR EXISTS (SELECT 1 FROM calendar_members m WHERE m.calendar_id = c.id AND m.user_id = $1)
     ORDER BY c.created_at DESC, c.id DESC`,
    [req.user.id],
  );
  res.json(rows.map((r) => formatCalendar(r, r.role)));
}));

router.post('/', asyncHandler(async (req, res) => {
  const body = requireBodyObject(req.body);
  const name = requireString(body.name, 'name', 2, 60);
  const { rows } = await query(
    'INSERT INTO calendars (name, owner_id) VALUES ($1, $2) RETURNING id, name, owner_id, created_at',
    [name, req.user.id],
  );
  res.status(201).json(formatCalendar(rows[0], 'owner'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  res.json(formatCalendar(calendar, role));
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role !== 'owner') throw forbidden('Only the calendar owner can rename it');
  const name = requireString(requireBodyObject(req.body).name, 'name', 2, 60);
  const { rows } = await query(
    'UPDATE calendars SET name = $1 WHERE id = $2 RETURNING id, name, owner_id, created_at',
    [name, calendar.id],
  );
  res.json(formatCalendar(rows[0], 'owner'));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role !== 'owner') throw forbidden('Only the calendar owner can delete it');
  await query('DELETE FROM calendars WHERE id = $1', [calendar.id]); // מחיקה מדורגת של אירועים, הערות, חברים והזמנות
  res.status(204).end();
}));

// ---------- חברים והזמנות ----------

router.get('/:id/members', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);

  const owner = await query('SELECT id, name, email FROM users WHERE id = $1', [calendar.owner_id]);
  const members = await query(
    `SELECT u.id, u.name, u.email, m.joined_at
     FROM calendar_members m JOIN users u ON u.id = m.user_id
     WHERE m.calendar_id = $1 ORDER BY m.joined_at, m.id`,
    [calendar.id],
  );
  const result = {
    members: [
      { userId: owner.rows[0].id, name: owner.rows[0].name, email: owner.rows[0].email, role: 'owner', joinedAt: calendar.created_at },
      ...members.rows.map((r) => ({ userId: r.id, name: r.name, email: r.email, role: 'member', joinedAt: r.joined_at })),
    ],
  };
  if (role === 'owner') {
    const inv = await query(
      'SELECT id, email, invited_by_id, created_at FROM invitations WHERE calendar_id = $1 ORDER BY created_at, id',
      [calendar.id],
    );
    result.invitations = inv.rows.map((r) => ({
      id: r.id, email: r.email, invitedById: r.invited_by_id, createdAt: r.created_at,
    }));
  }
  res.json(result);
}));

router.post('/:id/members', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role !== 'owner') throw forbidden('Only the calendar owner can add members');
  const email = normalizeEmail(requireBodyObject(req.body).email);

  const found = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
  const user = found.rows[0];

  if (user) {
    if (user.id === calendar.owner_id) throw conflict('This user is already the owner of the calendar');
    const dup = await query('SELECT 1 FROM calendar_members WHERE calendar_id = $1 AND user_id = $2', [calendar.id, user.id]);
    if (dup.rows[0]) throw conflict('This user is already a member of the calendar');
    const { rows } = await query(
      'INSERT INTO calendar_members (calendar_id, user_id) VALUES ($1, $2) RETURNING joined_at',
      [calendar.id, user.id],
    );
    return res.status(201).json({
      status: 'added',
      member: { userId: user.id, name: user.name, email: user.email, role: 'member', joinedAt: rows[0].joined_at },
    });
  }

  const dup = await query('SELECT 1 FROM invitations WHERE calendar_id = $1 AND email = $2', [calendar.id, email]);
  if (dup.rows[0]) throw conflict('This email was already invited to the calendar');
  const { rows } = await query(
    'INSERT INTO invitations (calendar_id, email, invited_by_id) VALUES ($1, $2, $3) RETURNING id, email, invited_by_id, created_at',
    [calendar.id, email, req.user.id],
  );
  res.status(201).json({
    status: 'invited',
    invitation: { id: rows[0].id, email: rows[0].email, invitedById: rows[0].invited_by_id, createdAt: rows[0].created_at },
  });
}));

router.delete('/:id/members/:userId', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role !== 'owner') throw forbidden('Only the calendar owner can remove members');
  const userId = parseId(req.params.userId, 'userId');
  if (userId === calendar.owner_id) throw forbidden('The owner cannot be removed. Delete the calendar instead');
  const { rowCount } = await query('DELETE FROM calendar_members WHERE calendar_id = $1 AND user_id = $2', [calendar.id, userId]);
  if (!rowCount) throw notFound('Member not found');
  res.status(204).end();
}));

router.delete('/:id/invitations/:invitationId', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role !== 'owner') throw forbidden('Only the calendar owner can cancel invitations');
  const invitationId = parseId(req.params.invitationId, 'invitationId');
  const { rowCount } = await query('DELETE FROM invitations WHERE id = $1 AND calendar_id = $2', [invitationId, calendar.id]);
  if (!rowCount) throw notFound('Invitation not found');
  res.status(204).end();
}));

router.post('/:id/leave', asyncHandler(async (req, res) => {
  const { calendar, role } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  if (role === 'owner') throw forbidden('The owner cannot leave the calendar. Delete it instead');
  await query('DELETE FROM calendar_members WHERE calendar_id = $1 AND user_id = $2', [calendar.id, req.user.id]);
  res.status(204).end();
}));

module.exports = router;
