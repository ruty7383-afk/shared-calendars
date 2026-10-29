const { badRequest } = require('./errors');
const { validateHebrewDate, isLeapYear, MIN_YEAR, MAX_YEAR } = require('./hebrewDate');

const EVENT_TYPES = ['birthday', 'anniversary', 'memorial', 'note', 'other'];
// ברירת המחדל של repeatsYearly לפי סוג האירוע
const REPEATS_BY_DEFAULT = { birthday: true, anniversary: true, memorial: true, note: false, other: false };
const VISIBILITIES = ['shared', 'private'];
const GENDERS = ['male', 'female'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseId(value, label = 'id') {
  if (!/^\d{1,9}$/.test(String(value))) throw badRequest(`${label} must be a positive integer`);
  return Number(value);
}

function requireString(value, field, min, max) {
  if (typeof value !== 'string') throw badRequest(`${field} is required and must be a string`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw badRequest(`${field} must be between ${min} and ${max} characters`);
  }
  return trimmed;
}

function normalizeEmail(value) {
  const email = requireString(value, 'email', 3, 255).toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest('email is not valid');
  return email;
}

function requireEnum(value, field, allowed) {
  if (!allowed.includes(value)) throw badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

function checkHebrewDate(data) {
  const error = validateHebrewDate(data.hebrewYear, data.hebrewMonth, data.hebrewDay);
  if (error) throw badRequest(error);
}

// data = כל שדות האירוע (אחרי מיזוג עם האירוע הקיים בעריכה)
function validateEvent(data) {
  const out = {
    title: requireString(data.title, 'title', 1, 100),
    type: requireEnum(data.type, 'type', EVENT_TYPES),
    visibility: requireEnum(data.visibility, 'visibility', VISIBILITIES),
    hebrewYear: data.hebrewYear,
    hebrewMonth: data.hebrewMonth,
    hebrewDay: data.hebrewDay,
  };
  checkHebrewDate(out);

  // תיאור אופציונלי (למשל הטקסט של הערה). ריק או חסר נשמר כ-null
  if (data.description === undefined || data.description === null || data.description === '') {
    out.description = null;
  } else {
    out.description = requireString(data.description, 'description', 1, 500);
  }

  if (data.hasSourceYear === undefined || data.hasSourceYear === null) {
    out.hasSourceYear = true;
  } else if (typeof data.hasSourceYear === 'boolean') {
    out.hasSourceYear = data.hasSourceYear;
  } else {
    throw badRequest('hasSourceYear must be true or false');
  }

  if (data.repeatsYearly === undefined || data.repeatsYearly === null) {
    out.repeatsYearly = REPEATS_BY_DEFAULT[out.type];
  } else if (typeof data.repeatsYearly === 'boolean') {
    out.repeatsYearly = data.repeatsYearly;
  } else {
    throw badRequest('repeatsYearly must be true or false');
  }

  if (data.gender === undefined || data.gender === null) {
    out.gender = null;
  } else {
    out.gender = requireEnum(data.gender, 'gender', GENDERS);
  }
return out;
}

function validateNote(data) {
  const out = {
    text: requireString(data.text, 'text', 1, 500),
    visibility: requireEnum(data.visibility, 'visibility', VISIBILITIES),
    hebrewYear: data.hebrewYear,
    hebrewMonth: data.hebrewMonth,
    hebrewDay: data.hebrewDay,
  };
  checkHebrewDate(out);
  return out;
}

function requireBodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw badRequest('Request body must be a JSON object');
  return body;
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

// קוראת את ?hebrewYear=5787&hebrewMonth=10 מהכתובת.
// בלי שניהם: null (מחזירים הכול). אחד בלבד או ערך לא חוקי: 400.
function parseMonthFilter(query) {
  const hasYear = query.hebrewYear !== undefined;
  const hasMonth = query.hebrewMonth !== undefined;
  if (!hasYear && !hasMonth) return null;
  if (!hasYear || !hasMonth) throw badRequest('hebrewYear and hebrewMonth must be sent together');
  if (!/^\d{1,4}$/.test(String(query.hebrewYear)) || !/^\d{1,2}$/.test(String(query.hebrewMonth))) {
    throw badRequest('hebrewYear and hebrewMonth must be integers');
  }
  const year = Number(query.hebrewYear);
  const month = Number(query.hebrewMonth);
  if (year < MIN_YEAR || year > MAX_YEAR) throw badRequest(`hebrewYear must be between ${MIN_YEAR} and ${MAX_YEAR}`);
  if (month < 1 || month > 13) throw badRequest('hebrewMonth must be between 1 and 13');
  if (month === 13 && !isLeapYear(year)) {
    throw badRequest(`hebrewMonth 13 (Adar II) exists only in a leap year, and ${year} is not a leap year`);
  }
  return { year, month };
}

module.exports = {
  EVENT_TYPES, VISIBILITIES, GENDERS, REPEATS_BY_DEFAULT,
  parseId, requireString, normalizeEmail, validateEvent, validateNote, requireBodyObject, pick, parseMonthFilter,
};
