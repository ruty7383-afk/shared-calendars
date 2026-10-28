const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, badRequest, forbidden, notFound } = require('../utils/errors');
const { parseId, validateNote, requireBodyObject, pick, parseMonthFilter } = require('../utils/validate');
const { getCalendarAccess } = require('../utils/access');

const router = express.Router();
router.use(requireAuth);

const NOTE_FIELDS = ['text', 'visibility', 'hebrewYear', 'hebrewMonth', 'hebrewDay'];

const SELECT_NOTE = `
  SELECT n.id, n.calendar_id, n.created_by_id, u.name AS created_by_name, n.text, n.visibility,
         n.hebrew_year, n.hebrew_month, n.hebrew_day, n.created_at
  FROM notes n JOIN users u ON u.id = n.created_by_id`;

const formatNote = (r) => ({
  id: r.id,
  calendarId: r.calendar_id,
  createdById: r.created_by_id,
  createdByName: r.created_by_name,
  text: r.text,
  visibility: r.visibility,
  hebrewYear: r.hebrew_year,
  hebrewMonth: r.hebrew_month,
  hebrewDay: r.hebrew_day,
  createdAt: r.created_at,
});

async function loadNote(req, res, next) {
  try {
    const noteId = parseId(req.params.noteId, 'noteId');
    const { rows } = await query(`${SELECT_NOTE} WHERE n.id = $1`, [noteId]);
    const note = rows[0];
    if (!note) throw notFound('Note not found');
    const { role } = await getCalendarAccess(note.calendar_id, req.user.id);
    if (note.visibility === 'private' && note.created_by_id !== req.user.id) throw notFound('Note not found');
    req.note = note;
    req.role = role;
    next();
  } catch (err) {
    next(err);
  }
}

const canModify = (note, user, role) =>
  note.created_by_id === user.id || (role === 'owner' && note.visibility === 'shared');

router.get('/calendars/:id/notes', asyncHandler(async (req, res) => {
  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  const filter = parseMonthFilter(req.query);

  let sql = `${SELECT_NOTE} WHERE n.calendar_id = $1 AND (n.visibility = 'shared' OR n.created_by_id = $2)`;
  const params = [calendar.id, req.user.id];
  if (filter) {
    params.push(filter.year, filter.month);
    sql += ' AND n.hebrew_year = $3 AND n.hebrew_month = $4';
  }

  const { rows } = await query(`${sql} ORDER BY n.id`, params);
  res.json(rows.map(formatNote));
}));

router.post('/calendars/:id/notes', asyncHandler(async (req, res) => {
  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  const n = validateNote(pick(requireBodyObject(req.body), NOTE_FIELDS));
  const ins = await query(
    `INSERT INTO notes (calendar_id, created_by_id, text, visibility, hebrew_year, hebrew_month, hebrew_day)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [calendar.id, req.user.id, n.text, n.visibility, n.hebrewYear, n.hebrewMonth, n.hebrewDay],
  );
  const { rows } = await query(`${SELECT_NOTE} WHERE n.id = $1`, [ins.rows[0].id]);
  res.status(201).json(formatNote(rows[0]));
}));

router.patch('/notes/:noteId', loadNote, asyncHandler(async (req, res) => {
  const { note, role, user } = { note: req.note, role: req.role, user: req.user };
  if (!canModify(note, user, role)) throw forbidden('You cannot edit this note');

  const changes = pick(requireBodyObject(req.body), NOTE_FIELDS);
  if (Object.keys(changes).length === 0) throw badRequest('No fields to update');
  if (changes.visibility !== undefined && changes.visibility !== note.visibility && note.created_by_id !== user.id) {
    throw forbidden('Only the creator can change the visibility of a note');
  }

  const current = {
    text: note.text, visibility: note.visibility,
    hebrewYear: note.hebrew_year, hebrewMonth: note.hebrew_month, hebrewDay: note.hebrew_day,
  };
  const n = validateNote({ ...current, ...changes });

  await query(
    'UPDATE notes SET text=$1, visibility=$2, hebrew_year=$3, hebrew_month=$4, hebrew_day=$5 WHERE id=$6',
    [n.text, n.visibility, n.hebrewYear, n.hebrewMonth, n.hebrewDay, note.id],
  );
  const { rows } = await query(`${SELECT_NOTE} WHERE n.id = $1`, [note.id]);
  res.json(formatNote(rows[0]));
}));

router.delete('/notes/:noteId', loadNote, asyncHandler(async (req, res) => {
  if (!canModify(req.note, req.user, req.role)) throw forbidden('You cannot delete this note');
  await query('DELETE FROM notes WHERE id = $1', [req.note.id]);
  res.status(204).end();
}));

module.exports = router;
