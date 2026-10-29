// Adds the field hasSourceYear (boolean) to events on the server.
// Run from the server project folder (the one with package.json):
//   node add-has-source-year.js
//
// - hasSourceYear = true  : a source year (hebrewYear) was entered. Default, and the value of all existing events.
// - hasSourceYear = false : no source year was entered.
// - It is separate from repeatsYearly (repeatsYearly behaves exactly as before).
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const need = ['package.json', 'src/routes/events.js', 'src/utils/validate.js', 'sql/schema.sql', 'src/docs/openapi.js'];
const missing = need.filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) {
  console.error('This is not the server project folder (missing: ' + missing.join(', ') + ').');
  console.error('Run the script from the folder that contains package.json and src.');
  process.exit(1);
}

// Each file: a marker (means "already updated") and a list of [anchor, replacement] edits.
// An anchor must appear exactly once, otherwise nothing is changed at all.
const FILES = [
  {
    file: 'src/utils/validate.js',
    marker: 'hasSourceYear',
    edits: [
      [
        "  if (data.repeatsYearly === undefined || data.repeatsYearly === null) {",
        "  if (data.hasSourceYear === undefined || data.hasSourceYear === null) {\n" +
          "    out.hasSourceYear = true;\n" +
          "  } else if (typeof data.hasSourceYear === 'boolean') {\n" +
          "    out.hasSourceYear = data.hasSourceYear;\n" +
          "  } else {\n" +
          "    throw badRequest('hasSourceYear must be true or false');\n" +
          "  }\n\n" +
          "  if (data.repeatsYearly === undefined || data.repeatsYearly === null) {",
      ],
    ],
  },
  {
    file: 'src/routes/events.js',
    marker: 'has_source_year',
    edits: [
      ["'repeatsYearly', 'gender'];", "'repeatsYearly', 'gender', 'hasSourceYear'];"],
      ['e.repeats_yearly, e.gender,', 'e.repeats_yearly, e.gender, e.has_source_year,'],
      ['  repeatsYearly: r.repeats_yearly,\n', '  repeatsYearly: r.repeats_yearly,\n  hasSourceYear: r.has_source_year,\n'],
      [
        'repeatsYearly: event.repeats_yearly, gender: event.gender,',
        'repeatsYearly: event.repeats_yearly, gender: event.gender, hasSourceYear: event.has_source_year,',
      ],
      ['repeats_yearly, gender)', 'repeats_yearly, gender, has_source_year)'],
      ['$10,$11) RETURNING id', '$10,$11,$12) RETURNING id'],
      ['e.repeatsYearly, e.gender],', 'e.repeatsYearly, e.gender, e.hasSourceYear],'],
      ['repeats_yearly=$8, gender=$9 WHERE id=$10`', 'repeats_yearly=$8, gender=$9, has_source_year=$10 WHERE id=$11`'],
      ['e.repeatsYearly, e.gender, event.id],', 'e.repeatsYearly, e.gender, e.hasSourceYear, event.id],'],
      // monthly filter: a repeating event without a source year appears in every year
      [
        '(e.repeats_yearly AND e.hebrew_year <= $3)',
        '(e.repeats_yearly AND (NOT e.has_source_year OR e.hebrew_year <= $3))',
      ],
    ],
  },
  {
    file: 'src/docs/openapi.js',
    marker: 'hasSourceYear',
    edits: [
      [
        "  repeatsYearly: {\n    type: 'boolean',",
        "  hasSourceYear: { type: 'boolean', description: 'true if hebrewYear is a real source year (default true). false when no source year was entered' },\n" +
          "  repeatsYearly: {\n    type: 'boolean',",
      ],
      [
        "      repeatsYearly: { type: 'boolean' },",
        "      repeatsYearly: { type: 'boolean' },\n      hasSourceYear: { type: 'boolean' },",
      ],
    ],
  },
];

const SCHEMA_FILE = 'sql/schema.sql';
const SCHEMA_MARKER = 'has_source_year';
const SCHEMA_SQL =
  '-- hasSourceYear: true when a source year was entered. Existing events get true\n' +
  'ALTER TABLE events ADD COLUMN IF NOT EXISTS has_source_year BOOLEAN NOT NULL DEFAULT TRUE;\n';

const out = []; // { file, text, crlf }
const errors = [];
const already = [];

for (const { file, marker, edits } of FILES) {
  const raw = fs.readFileSync(path.join(root, file), 'utf8');
  const crlf = raw.includes('\r\n');
  let text = raw.replace(/\r\n/g, '\n');
  if (text.includes(marker)) {
    already.push(file);
    continue;
  }
  let ok = true;
  for (const [anchor, replacement] of edits) {
    const count = text.split(anchor).length - 1;
    if (count !== 1) {
      errors.push(`${file}: expected text found ${count} times (should be 1): ${anchor.trim().slice(0, 70)}`);
      ok = false;
      break;
    }
    text = text.replace(anchor, () => replacement);
  }
  if (ok) out.push({ file, text, crlf });
}

{
  const raw = fs.readFileSync(path.join(root, SCHEMA_FILE), 'utf8');
  const crlf = raw.includes('\r\n');
  const text = raw.replace(/\r\n/g, '\n');
  if (text.includes(SCHEMA_MARKER)) already.push(SCHEMA_FILE);
  else out.push({ file: SCHEMA_FILE, text: text.replace(/\s*$/, '\n') + '\n' + SCHEMA_SQL, crlf });
}

if (errors.length) {
  console.error('Nothing was changed. Some files differ from what this script expects:');
  for (const e of errors) console.error(' - ' + e);
  console.error('Send me this message and I will adjust the script.');
  process.exit(1);
}

// backup (first run only), then write
const backupDir = path.join(root, 'backup-before-has-source-year');
if (out.length && !fs.existsSync(backupDir)) {
  for (const { file } of out) {
    const dest = path.join(backupDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(root, file), dest);
  }
  console.log('Backup saved in: backup-before-has-source-year');
}

for (const { file, text, crlf } of out) {
  fs.writeFileSync(path.join(root, file), crlf ? text.replace(/\n/g, '\r\n') : text, 'utf8');
  console.log('updated:         ' + file);
}
for (const file of already) console.log('already updated: ' + file);

console.log('\nDone. Next: start the server (npm start). On startup the server adds the column to the database;');
console.log('existing events get hasSourceYear = true.');
