// בדיקות אינטגרציה מול PostgreSQL אמיתי.
// דורשות TEST_DATABASE_URL. אזהרה: הבדיקות מוחקות את כל הנתונים במסד הזה!
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');

const TEST_DB = process.env.TEST_DATABASE_URL;

if (!TEST_DB) {
  test('API integration tests', { skip: 'TEST_DATABASE_URL is not set' }, () => {});
} else {
  process.env.DATABASE_URL = TEST_DB;
  const db = require('../src/db');
  const app = require('../src/app');

  let server;
  let base;

  async function api(method, path, { token, body, form } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (form) {
      payload = form;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(base + path, { method, headers, body: payload });
    const type = res.headers.get('content-type') || '';
    const data = type.includes('application/json') ? await res.json() : null;
    return { status: res.status, data, res };
  }

  async function register(name, email) {
    const r = await api('POST', '/api/auth/register', { body: { name, email, password: 'secret123' } });
    assert.equal(r.status, 201);
    return { token: r.data.token, id: r.data.user.id };
  }

  const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );
  const imageForm = (buf, type, name) => {
    const f = new FormData();
    f.append('image', new Blob([buf], { type }), name);
    return f;
  };

  const ev = (over = {}) => ({
    title: 'יום הולדת', type: 'birthday', visibility: 'shared',
    hebrewYear: 5720, hebrewMonth: 10, hebrewDay: 25, gender: 'female', ...over,
  });

  test.before(async () => {
    await db.initSchema();
    await db.query('TRUNCATE users, calendars, calendar_members, invitations, events, notes RESTART IDENTITY CASCADE');
    await new Promise((resolve) => { server = app.listen(0, resolve); });
    base = `http://127.0.0.1:${server.address().port}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.closePool();
  });

  test('health and auth', async () => {
    assert.equal((await api('GET', '/api/health')).data.status, 'ok');

    assert.equal((await api('POST', '/api/auth/register', { body: { name: 'א', email: 'bad', password: '1' } })).status, 400);
    const owner = await register('Dana Owner', 'Owner@Example.com');
    const dup = await api('POST', '/api/auth/register', { body: { name: 'Other', email: 'owner@example.com', password: 'secret123' } });
    assert.equal(dup.status, 409);

    assert.equal((await api('POST', '/api/auth/login', { body: { email: 'owner@example.com', password: 'wrong-pass' } })).status, 401);
    const login = await api('POST', '/api/auth/login', { body: { email: 'owner@example.com', password: 'secret123' } });
    assert.equal(login.status, 200);
    assert.ok(login.data.token);

    assert.equal((await api('GET', '/api/auth/me')).status, 401);
    const me = await api('GET', '/api/auth/me', { token: owner.token });
    assert.equal(me.data.email, 'owner@example.com');
    assert.equal(me.data.passwordHash, undefined);
  });

  test('full flow: members, invitations, permissions, hebrew dates, images, month filter', async () => {
    const owner = await register('Owner', 'o@example.com');
    const member = await register('Member', 'm@example.com');
    const stranger = await register('Stranger', 's@example.com');

    // לוחות
    assert.equal((await api('POST', '/api/calendars', { token: owner.token, body: { name: 'x' } })).status, 400);
    const cal = (await api('POST', '/api/calendars', { token: owner.token, body: { name: 'המשפחה' } })).data;
    assert.equal(cal.role, 'owner');
    const calId = cal.id;

    // מי שלא בלוח לא רואה כלום
    assert.equal((await api('GET', `/api/calendars/${calId}`, { token: stranger.token })).status, 403);
    assert.equal((await api('GET', `/api/calendars/${calId}/events`, { token: stranger.token })).status, 403);
    assert.equal((await api('GET', '/api/calendars/99999', { token: owner.token })).status, 404);

    // הוספת חבר רשום, והזמנה למי שלא רשום
    const added = await api('POST', `/api/calendars/${calId}/members`, { token: owner.token, body: { email: 'M@example.com' } });
    assert.equal(added.status, 201);
    assert.equal(added.data.status, 'added');
    assert.equal((await api('POST', `/api/calendars/${calId}/members`, { token: owner.token, body: { email: 'm@example.com' } })).status, 409);
    assert.equal((await api('POST', `/api/calendars/${calId}/members`, { token: member.token, body: { email: 'x@example.com' } })).status, 403);

    const invited = await api('POST', `/api/calendars/${calId}/members`, { token: owner.token, body: { email: 'late@example.com' } });
    assert.equal(invited.data.status, 'invited');
    assert.equal((await api('POST', `/api/calendars/${calId}/members`, { token: owner.token, body: { email: 'late@example.com' } })).status, 409);

    const membersView = await api('GET', `/api/calendars/${calId}/members`, { token: owner.token });
    assert.equal(membersView.data.invitations.length, 1);
    const memberView = await api('GET', `/api/calendars/${calId}/members`, { token: member.token });
    assert.equal(memberView.data.invitations, undefined);

    // נרשם מי שהוזמן: ההזמנה הופכת לחברות
    const late = await register('Late', 'late@example.com');
    const lateCals = await api('GET', '/api/calendars', { token: late.token });
    assert.equal(lateCals.data.length, 1);
    assert.equal(lateCals.data[0].role, 'member');
    const after = await api('GET', `/api/calendars/${calId}/members`, { token: owner.token });
    assert.equal(after.data.invitations.length, 0);
    assert.equal(after.data.members.length, 3);

    // ביטול הזמנה
    const inv2 = await api('POST', `/api/calendars/${calId}/members`, { token: owner.token, body: { email: 'cancel@example.com' } });
    assert.equal((await api('DELETE', `/api/calendars/${calId}/invitations/${inv2.data.invitation.id}`, { token: owner.token })).status, 204);

    // אירועים: בדיקת תאריכים עבריים וכללי gender
    const post = (token, body) => api('POST', `/api/calendars/${calId}/events`, { token, body });
    assert.equal((await post(owner.token, ev({ gender: undefined }))).status, 400); // gender חובה ביום הולדת
    assert.equal((await post(owner.token, ev({ hebrewYear: 5786, hebrewMonth: 13 }))).status, 400); // אדר ב' בשנה רגילה
    assert.equal((await post(owner.token, ev({ hebrewYear: 5786, hebrewMonth: 8, hebrewDay: 30 }))).status, 400); // חשוון בן 29
    assert.equal((await post(owner.token, ev({ type: 'party' }))).status, 400);
    assert.equal((await post(owner.token, ev({ hebrewMonth: '10' }))).status, 400);
    assert.equal((await post(stranger.token, ev())).status, 403);

    const birthday = (await post(owner.token, ev())).data;
    assert.equal(birthday.repeatsYearly, true);
    assert.equal(birthday.gender, 'female');
    assert.equal(birthday.hasImage, false);
    assert.equal(birthday.date, undefined); // אין תאריך לועזי בשרת

    const memorial = (await post(owner.token, ev({ type: 'memorial', gender: undefined, title: 'יום זיכרון' }))).data;
    assert.equal(memorial.repeatsYearly, true); // יום זיכרון חוזר כל שנה
    const other = (await post(owner.token, ev({ type: 'other', gender: undefined, title: 'אחר' }))).data;
    assert.equal(other.repeatsYearly, false);
    const leapAdar = await post(owner.token, ev({ type: 'anniversary', gender: undefined, hebrewYear: 5787, hebrewMonth: 13, hebrewDay: 29 }));
    assert.equal(leapAdar.status, 201);

    // עריכה: השרת בודק את האירוע המלא אחרי המיזוג
    const patched = await api('PATCH', `/api/events/${other.id}`, { token: owner.token, body: { hebrewMonth: 11, hebrewDay: 3 } });
    assert.equal(patched.status, 200);
    assert.equal(patched.data.hebrewMonth, 11);
    assert.equal((await api('PATCH', `/api/events/${other.id}`, { token: owner.token, body: { type: 'birthday' } })).status, 400);
    assert.equal((await api('PATCH', `/api/events/${other.id}`, { token: owner.token, body: {} })).status, 400);
    assert.equal((await api('PATCH', `/api/events/${other.id}`, { token: owner.token, body: { hebrewYear: 5786, hebrewMonth: 13, hebrewDay: 1 } })).status, 400);

    // פרטיות: אירוע פרטי של חבר
    const priv = (await post(member.token, ev({ title: 'סודי', visibility: 'private' }))).data;
    const ownerList = await api('GET', `/api/calendars/${calId}/events`, { token: owner.token });
    assert.ok(!ownerList.data.some((e) => e.id === priv.id));
    const memberList = await api('GET', `/api/calendars/${calId}/events`, { token: member.token });
    assert.ok(memberList.data.some((e) => e.id === priv.id));
    assert.equal((await api('GET', `/api/events/${priv.id}`, { token: owner.token })).status, 404);
    assert.equal((await api('PATCH', `/api/events/${priv.id}`, { token: owner.token, body: { title: 'x' } })).status, 404);
    assert.equal((await api('DELETE', `/api/events/${priv.id}`, { token: owner.token })).status, 404);
    assert.equal((await api('GET', `/api/events/${priv.id}`, { token: stranger.token })).status, 403);

    // הרשאות עריכה ומחיקה
    assert.equal((await api('PATCH', `/api/events/${birthday.id}`, { token: member.token, body: { title: 'x' } })).status, 403);
    assert.equal((await api('DELETE', `/api/events/${birthday.id}`, { token: member.token })).status, 403);
    const memberShared = (await post(member.token, ev({ title: 'של החבר' }))).data;
    const ownerEdit = await api('PATCH', `/api/events/${memberShared.id}`, { token: owner.token, body: { title: 'נערך ע"י הבעלים' } });
    assert.equal(ownerEdit.status, 200);
    assert.equal((await api('PATCH', `/api/events/${memberShared.id}`, { token: owner.token, body: { visibility: 'private' } })).status, 403);
    assert.equal((await api('DELETE', `/api/events/${memberShared.id}`, { token: owner.token })).status, 204);

    // תמונות
    const imgPath = `/api/events/${birthday.id}/image`;
    assert.equal(birthday.imageUrl, null);
    assert.equal((await api('PUT', imgPath, { token: member.token, form: imageForm(PNG, 'image/png', 'a.png') })).status, 403);
    assert.equal((await api('PUT', imgPath, { token: owner.token, form: imageForm(Buffer.from('not an image'), 'image/png', 'a.png') })).status, 400);
    assert.equal((await api('PUT', imgPath, { token: owner.token, form: imageForm(Buffer.alloc(1024 * 1024 + 10, 1), 'image/png', 'big.png') })).status, 400);
    assert.equal((await api('PUT', imgPath, { token: owner.token })).status, 400);
    assert.equal((await api('PUT', imgPath)).status, 401);
    // העלאה אמיתית ל-Cloudinary נבדקת רק אם הוגדרו מפתחות ב-.env
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const up = await api('PUT', imgPath, { token: owner.token, form: imageForm(PNG, 'image/png', 'a.png') });
      assert.equal(up.status, 200);
      assert.equal(up.data.hasImage, true);
      assert.match(up.data.imageUrl, /^https:\/\/res\.cloudinary\.com\//);
      assert.equal((await api('DELETE', imgPath, { token: owner.token })).status, 204);
      const after = await api('GET', `/api/events/${birthday.id}`, { token: owner.token });
      assert.equal(after.data.hasImage, false);
    }

    // הערה היא סוג אירוע: לא חוזרת כברירת מחדל, ויש לה תיאור אופציונלי
    const noteEv = await post(member.token, ev({ type: 'note', gender: undefined, title: 'לקנות פרחים', description: 'ורדים אדומים', hebrewYear: 5786, hebrewMonth: 10, hebrewDay: 24 }));
    assert.equal(noteEv.status, 201);
    assert.equal(noteEv.data.type, 'note');
    assert.equal(noteEv.data.repeatsYearly, false);
    assert.equal(noteEv.data.description, 'ורדים אדומים');
    assert.equal((await post(member.token, ev({ type: 'note', gender: undefined, description: 'x'.repeat(501) }))).status, 400);

    // סינון לפי החודש העברי המוצג
    const listMonth = async (token, y, m) => {
      const r = await api('GET', `/api/calendars/${calId}/events?hebrewYear=${y}&hebrewMonth=${m}`, { token });
      assert.equal(r.status, 200);
      return r.data.map((e) => e.id);
    };
    assert.ok((await listMonth(owner.token, 5787, 10)).includes(birthday.id)); // אירוע חוזר, שנה מאוחרת משנת המקור
    assert.ok((await listMonth(owner.token, 5720, 10)).includes(birthday.id)); // שנת המקור עצמה
    assert.ok(!(await listMonth(owner.token, 5719, 10)).includes(birthday.id)); // לפני שנת המקור
    assert.ok(!(await listMonth(owner.token, 5787, 11)).includes(birthday.id)); // חודש אחר
    assert.ok((await listMonth(owner.token, 5720, 11)).includes(other.id)); // אירוע שלא חוזר, בשנה שלו
    assert.ok(!(await listMonth(owner.token, 5721, 11)).includes(other.id)); // אירוע שלא חוזר, בשנה אחרת
    assert.ok((await listMonth(owner.token, 5786, 10)).includes(noteEv.data.id));
    assert.ok(!(await listMonth(owner.token, 5787, 10)).includes(noteEv.data.id));
    assert.ok((await listMonth(member.token, 5720, 10)).includes(priv.id)); // הפרטי של החבר נשאר פרטי
    assert.ok(!(await listMonth(owner.token, 5720, 10)).includes(priv.id));
    // אדר ב' (13) שמור בשנה מעוברת מוצג באדר (12) בשנה רגילה
    const adarTwo = (await post(owner.token, ev({ type: 'anniversary', gender: undefined, title: 'אדר ב', hebrewYear: 5787, hebrewMonth: 13, hebrewDay: 14 }))).data;
    assert.ok((await listMonth(owner.token, 5788, 12)).includes(adarTwo.id)); // 5788 שנה רגילה
    assert.ok((await listMonth(owner.token, 5790, 13)).includes(adarTwo.id)); // 5790 מעוברת
    assert.equal((await api('GET', `/api/calendars/${calId}/events?hebrewYear=5787`, { token: owner.token })).status, 400);
    assert.equal((await api('GET', `/api/calendars/${calId}/events?hebrewYear=5786&hebrewMonth=13`, { token: owner.token })).status, 400);
    assert.ok((await api('GET', `/api/calendars/${calId}/events`, { token: owner.token })).data.length >= 4); // בלי פרמטרים חוזר הכול

    // הסרה ועזיבה
    assert.equal((await api('DELETE', `/api/calendars/${calId}/members/${owner.id}`, { token: owner.token })).status, 403);
    assert.equal((await api('POST', `/api/calendars/${calId}/leave`, { token: owner.token })).status, 403);
    assert.equal((await api('DELETE', `/api/calendars/${calId}/members/${late.id}`, { token: owner.token })).status, 204);
    assert.equal((await api('GET', `/api/calendars/${calId}`, { token: late.token })).status, 403);
    assert.equal((await api('POST', `/api/calendars/${calId}/leave`, { token: member.token })).status, 204);
    assert.equal((await api('POST', `/api/calendars/${calId}/leave`, { token: member.token })).status, 403);

    // שינוי שם ומחיקת לוח
    assert.equal((await api('PATCH', `/api/calendars/${calId}`, { token: member.token, body: { name: 'חדש' } })).status, 403);
    assert.equal((await api('PATCH', `/api/calendars/${calId}`, { token: owner.token, body: { name: 'שם חדש' } })).data.name, 'שם חדש');
    assert.equal((await api('DELETE', `/api/calendars/${calId}`, { token: stranger.token })).status, 403);
    assert.equal((await api('DELETE', `/api/calendars/${calId}`, { token: owner.token })).status, 204);
    const left = await db.query('SELECT (SELECT count(*) FROM events) AS e, (SELECT count(*) FROM notes) AS n');
    assert.equal(Number(left.rows[0].e), 0);
    assert.equal(Number(left.rows[0].n), 0);
  });
}
