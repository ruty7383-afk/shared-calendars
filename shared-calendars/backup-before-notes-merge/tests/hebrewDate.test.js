const test = require('node:test');
const assert = require('node:assert/strict');
const { isLeapYear, daysInYear, daysInMonth, validateHebrewDate } = require('../src/utils/hebrewDate');
const { validateEvent, validateNote } = require('../src/utils/validate');

test('leap years', () => {
  assert.equal(isLeapYear(5784), true);
  assert.equal(isLeapYear(5785), false);
  assert.equal(isLeapYear(5786), false);
  assert.equal(isLeapYear(5787), true);
});

test('year lengths match the real calendar', () => {
  assert.equal(daysInYear(5784), 383);
  assert.equal(daysInYear(5785), 355);
  assert.equal(daysInYear(5786), 354);
  assert.equal(daysInYear(5787), 385);
  assert.equal(daysInYear(5788), 355);
});

test('variable months (Cheshvan and Kislev)', () => {
  assert.equal(daysInMonth(8, 5785), 30); // שנה שלמה
  assert.equal(daysInMonth(8, 5786), 29); // שנה כסדרה
  assert.equal(daysInMonth(9, 5784), 29); // שנה חסרה
  assert.equal(daysInMonth(9, 5786), 30);
});

test('Adar months', () => {
  assert.equal(daysInMonth(12, 5786), 29); // אדר בשנה רגילה
  assert.equal(daysInMonth(12, 5787), 30); // אדר א' בשנה מעוברת
  assert.equal(daysInMonth(13, 5787), 29); // אדר ב'
});

test('validateHebrewDate accepts valid dates', () => {
  assert.equal(validateHebrewDate(5786, 10, 25), null);
  assert.equal(validateHebrewDate(5787, 13, 29), null);
  assert.equal(validateHebrewDate(5785, 8, 30), null);
});

test('validateHebrewDate rejects invalid dates', () => {
  assert.match(validateHebrewDate(5786, 13, 1), /leap year/); // אדר ב' בשנה רגילה
  assert.ok(validateHebrewDate(5786, 8, 30)); // חשוון 5786 הוא בן 29 ימים
  assert.ok(validateHebrewDate(5786, 14, 1));
  assert.ok(validateHebrewDate(5786, 0, 1));
  assert.ok(validateHebrewDate(5786, 10, 0));
  assert.ok(validateHebrewDate(5786, 10, 30)); // טבת בן 29
  assert.ok(validateHebrewDate(2000, 1, 1));
  assert.ok(validateHebrewDate('5786', 10, 25));
  assert.ok(validateHebrewDate(5786, 10.5, 25));
});

const baseEvent = { title: 'אירוע', type: 'other', visibility: 'shared', hebrewYear: 5786, hebrewMonth: 10, hebrewDay: 25 };

test('repeatsYearly defaults by type (memorial repeats too)', () => {
  assert.equal(validateEvent({ ...baseEvent, type: 'birthday', gender: 'male' }).repeatsYearly, true);
  assert.equal(validateEvent({ ...baseEvent, type: 'anniversary' }).repeatsYearly, true);
  assert.equal(validateEvent({ ...baseEvent, type: 'memorial' }).repeatsYearly, true);
  assert.equal(validateEvent({ ...baseEvent, type: 'other' }).repeatsYearly, false);
  assert.equal(validateEvent({ ...baseEvent, type: 'other', repeatsYearly: true }).repeatsYearly, true);
  assert.equal(validateEvent({ ...baseEvent, type: 'memorial', repeatsYearly: false }).repeatsYearly, false);
});

test('gender is required only for birthdays', () => {
  assert.throws(() => validateEvent({ ...baseEvent, type: 'birthday' }), /gender is required/);
  assert.doesNotThrow(() => validateEvent({ ...baseEvent, type: 'anniversary' }));
  assert.doesNotThrow(() => validateEvent({ ...baseEvent, type: 'memorial', gender: 'female' }));
  assert.throws(() => validateEvent({ ...baseEvent, gender: 'x' }), /gender/);
});

test('event and note field validation', () => {
  assert.throws(() => validateEvent({ ...baseEvent, title: '   ' }), /title/);
  assert.throws(() => validateEvent({ ...baseEvent, type: 'party' }), /type/);
  assert.throws(() => validateEvent({ ...baseEvent, visibility: 'public' }), /visibility/);
  assert.throws(() => validateEvent({ ...baseEvent, repeatsYearly: 'yes' }), /repeatsYearly/);
  assert.throws(() => validateEvent({ ...baseEvent, hebrewMonth: 13 }), /leap/);
  assert.throws(() => validateNote({ text: 'x'.repeat(501), visibility: 'shared', hebrewYear: 5786, hebrewMonth: 1, hebrewDay: 1 }), /text/);
  assert.doesNotThrow(() => validateNote({ text: 'שלום', visibility: 'private', hebrewYear: 5786, hebrewMonth: 1, hebrewDay: 1 }));
});
