const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, badRequest, forbidden, notFound } = require('../utils/errors');
const { parseId, validateEvent, requireBodyObject, pick, parseMonthFilter } = require('../utils/validate');
const { isLeapYear } = require('../utils/hebrewDate');
const { getCalendarAccess } = require('../utils/access');
const { uploadImage, deleteImage } = require('../cloudinary');

const router = express.Router();
router.use(requireAuth);

const EVENT_FIELDS = ['title', 'description', 'type', 'visibility', 'hebrewYear', 'hebrewMonth', 'hebrewDay', 'repeatsYearly', 'gender'];

// התמונות נשמרות ב-Cloudinary. במסד נשמרת רק הכתובת (image_url) והמזהה למחיקה (image_public_id)
const SELECT_EVENT = `
  SELECT e.id, e.calendar_id, e.created_by_id, u.name AS created_by_name, e.title, e.description, e.type, e.visibility,
         e.hebrew_year, e.hebrew_month, e.hebrew_day, e.repeats_yearly, e.gender,
         (e.image_url IS NOT NULL) AS has_image, e.image_url, e.image_public_id, e.created_at
  FROM events e JOIN users u ON u.id = e.created_by_id`;

const formatEvent = (r) => ({
  id: r.id,
  calendarId: r.calendar_id,
  createdById: r.created_by_id,
  createdByName: r.created_by_name,
  title: r.title,
  description: r.description,
  type: r.type,
  visibility: r.visibility,
  hebrewYear: r.hebrew_year,
  hebrewMonth: r.hebrew_month,
  hebrewDay: r.hebrew_day,
  repeatsYearly: r.repeats_yearly,
  gender: r.gender,
  hasImage: r.has_image,
  imageUrl: r.image_url,
  createdAt: r.created_at,
});

// טוענת אירוע ובודקת שהמשתמש רשאי לראות אותו.
// לא חבר בלוח: 403. אירוע פרטי של מישהו אחר: 404 (כדי לא לחשוף שהוא קיים).
async function loadEvent(req, res, next) {
  try {
    const eventId = parseId(req.params.eventId, 'eventId');
    const { rows } = await query(`${SELECT_EVENT} WHERE e.id = $1`, [eventId]);
    const event = rows[0];
    if (!event) throw notFound('Event not found');
    const { role } = await getCalendarAccess(event.calendar_id, req.user.id);
    if (event.visibility === 'private' && event.created_by_id !== req.user.id) throw notFound('Event not found');
    req.event = event;
    req.role = role;
    next();
  } catch (err) {
    next(err);
  }
}

// יוצר האירוע, או בעל הלוח כשהאירוע משותף
const canModify = (event, user, role) =>
  event.created_by_id === user.id || (role === 'owner' && event.visibility === 'shared');

// ---------- רשימה והוספה ----------

router.get('/calendars/:id/events', asyncHandler(async (req, res) => {
  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  const filter = parseMonthFilter(req.query);

  let sql = `${SELECT_EVENT} WHERE e.calendar_id = $1 AND (e.visibility = 'shared' OR e.created_by_id = $2)`;
  const params = [calendar.id, req.user.id];

  if (filter) {
    params.push(filter.year, filter.month); // $3 = שנה, $4 = חודש
    // בשנה רגילה, אדר (12) מציג גם אירועים ששמורים באדר ב' (13)
    const monthMatch = filter.month === 12 && !isLeapYear(filter.year)
      ? 'e.hebrew_month IN ($4, 13)'
      : 'e.hebrew_month = $4';
    // אירוע חוזר: מהשנה שנשמרה בו ואילך. אירוע שלא חוזר: רק בשנה שנשמרה בו
    sql += ` AND ${monthMatch}
             AND ((e.repeats_yearly AND e.hebrew_year <= $3)
               OR (NOT e.repeats_yearly AND e.hebrew_year = $3))`;
  }

  const { rows } = await query(`${sql} ORDER BY e.id`, params);
  res.json(rows.map(formatEvent));
}));

router.post('/calendars/:id/events', asyncHandler(async (req, res) => {
  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);
  const e = validateEvent(pick(requireBodyObject(req.body), EVENT_FIELDS));
  const ins = await query(
    `INSERT INTO events (calendar_id, created_by_id, title, description, type, visibility, hebrew_year, hebrew_month, hebrew_day, repeats_yearly, gender)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [calendar.id, req.user.id, e.title, e.description, e.type, e.visibility, e.hebrewYear, e.hebrewMonth, e.hebrewDay, e.repeatsYearly, e.gender],
  );
  const { rows } = await query(`${SELECT_EVENT} WHERE e.id = $1`, [ins.rows[0].id]);
  res.status(201).json(formatEvent(rows[0]));
}));

// ---------- אירוע בודד ----------

router.get('/events/:eventId', loadEvent, (req, res) => {
  res.json(formatEvent(req.event));
});

router.patch('/events/:eventId', loadEvent, asyncHandler(async (req, res) => {
  const { event, role, user } = { event: req.event, role: req.role, user: req.user };
  if (!canModify(event, user, role)) throw forbidden('You cannot edit this event');

  const changes = pick(requireBodyObject(req.body), EVENT_FIELDS);
  if (Object.keys(changes).length === 0) throw badRequest('No fields to update');
  if (changes.visibility !== undefined && changes.visibility !== event.visibility && event.created_by_id !== user.id) {
    throw forbidden('Only the creator can change the visibility of an event');
  }

  const current = {
    title: event.title, description: event.description, type: event.type, visibility: event.visibility,
    hebrewYear: event.hebrew_year, hebrewMonth: event.hebrew_month, hebrewDay: event.hebrew_day,
    repeatsYearly: event.repeats_yearly, gender: event.gender,
  };
  const e = validateEvent({ ...current, ...changes });

  await query(
    `UPDATE events SET title=$1, description=$2, type=$3, visibility=$4, hebrew_year=$5, hebrew_month=$6, hebrew_day=$7,
                       repeats_yearly=$8, gender=$9 WHERE id=$10`,
    [e.title, e.description, e.type, e.visibility, e.hebrewYear, e.hebrewMonth, e.hebrewDay, e.repeatsYearly, e.gender, event.id],
  );
  const { rows } = await query(`${SELECT_EVENT} WHERE e.id = $1`, [event.id]);
  res.json(formatEvent(rows[0]));
}));

router.delete('/events/:eventId', loadEvent, asyncHandler(async (req, res) => {
  if (!canModify(req.event, req.user, req.role)) throw forbidden('You cannot delete this event');
  await query('DELETE FROM events WHERE id = $1', [req.event.id]);
  await deleteImage(req.event.image_public_id); // מוחק גם את התמונה מ-Cloudinary
  res.status(204).end();
}));

// ---------- תמונה ----------

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024, files: 1 } });

// זיהוי הפורמט לפי התוכן עצמו ולא לפי מה שהלקוח טוען
function detectImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

const onlyCreator = (req, res, next) => {
  if (req.event.created_by_id !== req.user.id) return next(forbidden('Only the creator can change the image'));
  next();
};

router.put('/events/:eventId/image', loadEvent, onlyCreator, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest('Send the image as multipart/form-data in a field named "image"');
  // הסוג נבדק לפי תוכן הקובץ ולא לפי מה שהלקוח טוען. Cloudinary מזהה את הפורמט בעצמו
  if (!detectImageType(req.file.buffer)) throw badRequest('Image must be JPEG, PNG or WebP');

  // מזהה אקראי בכל העלאה, כדי שהתמונה החדשה לא תתנגש בישנה
  const publicId = `shared-calendars/event-${req.event.id}-${crypto.randomBytes(6).toString('hex')}`;
  const result = await uploadImage(req.file.buffer, publicId);
  await query('UPDATE events SET image_url = $1, image_public_id = $2 WHERE id = $3', [result.secure_url, result.public_id, req.event.id]);
  await deleteImage(req.event.image_public_id); // מוחק את התמונה הקודמת, אם הייתה
  const { rows } = await query(`${SELECT_EVENT} WHERE e.id = $1`, [req.event.id]);
  res.json(formatEvent(rows[0]));
}));

router.delete('/events/:eventId/image', loadEvent, onlyCreator, asyncHandler(async (req, res) => {
  await query('UPDATE events SET image_url = NULL, image_public_id = NULL WHERE id = $1', [req.event.id]);
  await deleteImage(req.event.image_public_id);
  res.status(204).end();
}));

module.exports = router;
