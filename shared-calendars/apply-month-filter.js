// מוסיף ל-API סינון לפי החודש העברי המוצג (hebrewYear + hebrewMonth).
// הרצה: node apply-month-filter.js  (מתוך תיקיית הפרויקט, זו שבה package.json)
const fs = require('fs');
const path = require('path');

const B = {
  "PARSE_FN": "// קוראת את ?hebrewYear=5787&hebrewMonth=10 מהכתובת.\n// בלי שניהם: null (מחזירים הכול). אחד בלבד או ערך לא חוקי: 400.\nfunction parseMonthFilter(query) {\n  const hasYear = query.hebrewYear !== undefined;\n  const hasMonth = query.hebrewMonth !== undefined;\n  if (!hasYear && !hasMonth) return null;\n  if (!hasYear || !hasMonth) throw badRequest('hebrewYear and hebrewMonth must be sent together');\n  if (!/^\\d{1,4}$/.test(String(query.hebrewYear)) || !/^\\d{1,2}$/.test(String(query.hebrewMonth))) {\n    throw badRequest('hebrewYear and hebrewMonth must be integers');\n  }\n  const year = Number(query.hebrewYear);\n  const month = Number(query.hebrewMonth);\n  if (year < MIN_YEAR || year > MAX_YEAR) throw badRequest(`hebrewYear must be between ${MIN_YEAR} and ${MAX_YEAR}`);\n  if (month < 1 || month > 13) throw badRequest('hebrewMonth must be between 1 and 13');\n  if (month === 13 && !isLeapYear(year)) {\n    throw badRequest(`hebrewMonth 13 (Adar II) exists only in a leap year, and ${year} is not a leap year`);\n  }\n  return { year, month };\n}\n\n",
  "EVENTS_HANDLER": "router.get('/calendars/:id/events', asyncHandler(async (req, res) => {\n  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);\n  const filter = parseMonthFilter(req.query);\n\n  let sql = `${SELECT_EVENT} WHERE e.calendar_id = $1 AND (e.visibility = 'shared' OR e.created_by_id = $2)`;\n  const params = [calendar.id, req.user.id];\n\n  if (filter) {\n    params.push(filter.year, filter.month); // $3 = שנה, $4 = חודש\n    // בשנה רגילה, אדר (12) מציג גם אירועים ששמורים באדר ב' (13)\n    const monthMatch = filter.month === 12 && !isLeapYear(filter.year)\n      ? 'e.hebrew_month IN ($4, 13)'\n      : 'e.hebrew_month = $4';\n    // אירוע חוזר: מהשנה שנשמרה בו ואילך. אירוע שלא חוזר: רק בשנה שנשמרה בו\n    sql += ` AND ${monthMatch}\n             AND ((e.repeats_yearly AND e.hebrew_year <= $3)\n               OR (NOT e.repeats_yearly AND e.hebrew_year = $3))`;\n  }\n\n  const { rows } = await query(`${sql} ORDER BY e.id`, params);\n  res.json(rows.map(formatEvent));\n}));\n",
  "NOTES_HANDLER": "router.get('/calendars/:id/notes', asyncHandler(async (req, res) => {\n  const { calendar } = await getCalendarAccess(parseId(req.params.id), req.user.id);\n  const filter = parseMonthFilter(req.query);\n\n  let sql = `${SELECT_NOTE} WHERE n.calendar_id = $1 AND (n.visibility = 'shared' OR n.created_by_id = $2)`;\n  const params = [calendar.id, req.user.id];\n  if (filter) {\n    params.push(filter.year, filter.month);\n    sql += ' AND n.hebrew_year = $3 AND n.hebrew_month = $4';\n  }\n\n  const { rows } = await query(`${sql} ORDER BY n.id`, params);\n  res.json(rows.map(formatNote));\n}));\n",
  "MONTH_PARAMS": "// פרמטרים אופציונליים: מחזירים רק את החודש העברי המוצג. בלי פרמטרים חוזר הכול.\nconst monthParams = [\n  { name: 'hebrewYear', in: 'query', required: false, description: 'שנה עברית של החודש המוצג. נשלח יחד עם hebrewMonth', schema: { type: 'integer', example: 5787 } },\n  { name: 'hebrewMonth', in: 'query', required: false, description: hebrewMonthsDescription, schema: { type: 'integer', example: 10 } },\n];\n\n"
};

const root = process.cwd();
if (!fs.existsSync(path.join(root, 'package.json')) || !fs.existsSync(path.join(root, 'src', 'routes', 'events.js'))) {
  console.error('לא נמצא הפרויקט. הריצי את הסקריפט מתוך תיקיית הפרויקט (זו שבה נמצא package.json).');
  process.exit(1);
}

function replaceHandler(text, startMarker, block) {
  const start = text.indexOf(startMarker);
  if (start === -1) return null;
  const endMatch = /\n\}\)\);\n/.exec(text.slice(start));
  if (!endMatch) return null;
  const end = start + endMatch.index + endMatch[0].length;
  return text.slice(0, start) + block + text.slice(end);
}

function replaceOnce(text, from, to) {
  const i = text.indexOf(from);
  if (i === -1 || text.indexOf(from, i + 1) !== -1) return null;
  return text.slice(0, i) + to + text.slice(i + from.length);
}

const edits = {
  'src/utils/validate.js': (t) => {
    t = replaceOnce(t, "const { validateHebrewDate } = require('./hebrewDate');",
      "const { validateHebrewDate, isLeapYear, MIN_YEAR, MAX_YEAR } = require('./hebrewDate');");
    if (t === null) return null;
    t = replaceOnce(t, 'module.exports = {', B.PARSE_FN + 'module.exports = {');
    if (t === null) return null;
    return replaceOnce(t, 'requireBodyObject, pick,\n};', 'requireBodyObject, pick, parseMonthFilter,\n};');
  },
  'src/routes/events.js': (t) => {
    t = replaceOnce(t, "const { parseId, validateEvent, requireBodyObject, pick } = require('../utils/validate');",
      "const { parseId, validateEvent, requireBodyObject, pick, parseMonthFilter } = require('../utils/validate');\nconst { isLeapYear } = require('../utils/hebrewDate');");
    if (t === null) return null;
    return replaceHandler(t, "router.get('/calendars/:id/events'", B.EVENTS_HANDLER);
  },
  'src/routes/notes.js': (t) => {
    t = replaceOnce(t, "const { parseId, validateNote, requireBodyObject, pick } = require('../utils/validate');",
      "const { parseId, validateNote, requireBodyObject, pick, parseMonthFilter } = require('../utils/validate');");
    if (t === null) return null;
    return replaceHandler(t, "router.get('/calendars/:id/notes'", B.NOTES_HANDLER);
  },
  // תיעוד Swagger. אם נכשל, לא קריטי
  'src/docs/openapi.js': (t) => {
    t = replaceOnce(t, 'const paths = {', B.MONTH_PARAMS + 'const paths = {');
    if (t === null) return null;
    t = replaceOnce(t,
      "description: 'אין פרמטרים. חיפוש, סינון ומיון נעשים ב-React על הרשימה שחוזרת.',\n      security: secured, parameters: [calId],",
      "description: 'אפשר לשלוח hebrewYear ו-hebrewMonth כדי לקבל רק את החודש המוצג, כולל אירועים שחוזרים כל שנה. בלי פרמטרים חוזרים כל האירועים. חיפוש, סינון ומיון נעשים ב-React.',\n      security: secured, parameters: [calId, ...monthParams],");
    if (t === null) return null;
    return replaceOnce(t,
      "description: 'אין פרמטרים. חיפוש, סינון ומיון נעשים ב-React.', security: secured, parameters: [calId],",
      "description: 'אפשר לשלוח hebrewYear ו-hebrewMonth כדי לקבל רק את החודש המוצג. בלי פרמטרים חוזרות כל ההערות. חיפוש, סינון ומיון נעשים ב-React.', security: secured, parameters: [calId, ...monthParams],");
  },
};

const results = {};
for (const [file, edit] of Object.entries(edits)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { results[file] = 'missing'; continue; }
  const raw = fs.readFileSync(full, 'utf8');
  if (raw.includes('parseMonthFilter') || (file.endsWith('openapi.js') && raw.includes('monthParams'))) { results[file] = 'already'; continue; }
  const crlf = raw.includes('\r\n');
  const out = edit(raw.replace(/\r\n/g, '\n'));
  results[file] = out === null ? 'failed' : { text: crlf ? out.replace(/\n/g, '\r\n') : out, full };
}

const critical = ['src/utils/validate.js', 'src/routes/events.js', 'src/routes/notes.js'];
if (critical.some((f) => results[f] === 'failed' || results[f] === 'missing')) {
  console.error('לא ביצעתי שום שינוי: חלק מהקבצים שונו ביחס למקור ולא ניתן לעדכן אותם אוטומטית.');
  for (const f of critical) if (results[f] === 'failed' || results[f] === 'missing') console.error(' - ' + f);
  console.error('שלחי לי את ההודעה הזו ואעזור.');
  process.exit(1);
}

for (const [file, r] of Object.entries(results)) {
  if (typeof r === 'object') { fs.writeFileSync(r.full, r.text, 'utf8'); console.log('עודכן:    ' + file); }
  else if (r === 'already') console.log('כבר מעודכן: ' + file);
  else console.log('דולג (לא קריטי, רק התיעוד ב-Swagger): ' + file);
}
console.log('\nסיימתי. עכשיו מפעילים מחדש את השרת: npm start');
