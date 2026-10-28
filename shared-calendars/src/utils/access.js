const { query } = require('../db');
const { forbidden, notFound } = require('./errors');

// מחזירה את הלוח ואת התפקיד של המשתמש בו: 'owner' או 'member'.
// 404 אם הלוח לא קיים, 403 אם המשתמש לא בעלים ולא חבר.
async function getCalendarAccess(calendarId, userId) {
  const { rows } = await query('SELECT id, name, owner_id, created_at FROM calendars WHERE id = $1', [calendarId]);
  const calendar = rows[0];
  if (!calendar) throw notFound('Calendar not found');
  if (calendar.owner_id === userId) return { calendar, role: 'owner' };
  const m = await query('SELECT 1 FROM calendar_members WHERE calendar_id = $1 AND user_id = $2', [calendarId, userId]);
  if (!m.rows[0]) throw forbidden('You are not part of this calendar');
  return { calendar, role: 'member' };
}

const formatCalendar = (c, role) => ({
  id: c.id,
  name: c.name,
  ownerId: c.owner_id,
  createdAt: c.created_at,
  ...(role ? { role } : {}),
});

module.exports = { getCalendarAccess, formatCalendar };
