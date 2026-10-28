# Shared Calendars API (לוחות שנה משותפים)

שרת Node.js + Express + PostgreSQL ללוחות שנה משותפים עם תאריכים עבריים.

- מדריך ל־React: [docs/REACT_GUIDE.md](docs/REACT_GUIDE.md)
- תיעוד Swagger אינטראקטיבי: `/api/docs` (והמפרט הגולמי ב־`/api/docs.json`)

## מה בפנים

```
src/
  server.js, app.js, config.js, db.js
  routes/        auth, calendars (כולל חברים והזמנות), events (כולל תמונות), notes
  middleware/    auth (JWT), errorHandler
  utils/         hebrewDate (בדיקת תאריך עברי), validate, access, errors
  docs/openapi.js
sql/schema.sql   הסכמה. נטענת אוטומטית בכל הפעלה
tests/           בדיקות יחידה ובדיקות אינטגרציה
docs/REACT_GUIDE.md
```

## הרצה מקומית

דרישות: Node.js 18 ומעלה (נבדק על 22), ו־PostgreSQL.

1. צרי מסד נתונים: `createdb shared_calendars`
2. התקנה: `npm install`
3. העתיקי `.env.example` לקובץ `.env`, ועדכני `DATABASE_URL` ו־`JWT_SECRET`.
4. הפעלה: `npm start` (או `npm run dev` להפעלה מחדש אוטומטית).
5. בדפדפן: `http://localhost:3000/api/docs`

הטבלאות נוצרות לבד בהפעלה הראשונה, ואין צורך להריץ מיגרציות.

## בדיקות

```
npm run test:unit   # בדיקות תאריכים עבריים וכללי ולידציה. לא דורשות מסד נתונים
npm test            # הכול. בדיקות האינטגרציה דורשות מסד נתונים נפרד
```

לבדיקות האינטגרציה צרי מסד נוסף (`createdb shared_calendars_test`) ומלאי `TEST_DATABASE_URL` ב־`.env`.
**הבדיקות מוחקות את כל הנתונים במסד הזה**, ולכן אסור להפנות אותו למסד האמיתי. בלי `TEST_DATABASE_URL` בדיקות האינטגרציה מדולגות.

## העלאה לענן (Render)

1. **מסד נתונים:** ב־Render לחצי New → PostgreSQL ויצרי מסד. העתיקי את ה־**Internal Database URL**.
2. **העלאת הקוד:** העלי את התיקייה ל־GitHub (ה־`.env` לא עולה, הוא ב־`.gitignore`).
3. **שירות:** New → Web Service, וחברי את המאגר. הגדרות:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **משתני סביבה** (Environment):

   | משתנה | ערך |
   |---|---|
   | `DATABASE_URL` | ה־URL שהעתקת |
   | `DATABASE_SSL` | `true` |
   | `JWT_SECRET` | מחרוזת אקראית ארוכה (לפחות 32 תווים) |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | הכתובת של אתר ה־React, למשל `https://my-calendar.vercel.app` (אפשר כמה, מופרדות בפסיק) |

   אין צורך להגדיר `PORT`, Render מגדיר אותו.
5. אחרי העלייה בדקי `https://<השם-שלך>.onrender.com/api/health` (אמור להחזיר `{"status":"ok"}`) ואת `/api/docs`.
6. ב־React הגדירי את כתובת ה־API לכתובת הזו.

הערות: בתוכנית החינמית של Render השרת "נרדם" אחרי זמן ללא פעילות, והבקשה הראשונה אחריו איטית. אותם צעדים מתאימים גם ל־Railway ול־Fly.io, והעיקר הוא אותם משתני סביבה.
אם `CORS_ORIGIN` לא מתאים לכתובת האתר בדיוק (כולל `https://` וללא `/` בסוף), הדפדפן יחסום בקשות.

## כללים עיקריים

- **תאריכים:** מספרים בלבד (`hebrewYear`, `hebrewMonth`, `hebrewDay`), מספור כמו ב־`@hebcal/hdate` (1=ניסן ... 7=תשרי ... 13=אדר ב'). השרת בודק שהתאריך קיים (אדר ב' רק בשנה מעוברת, אורך חשוון וכסלו משתנה לפי השנה), ואחרת מחזיר 400. טווח השנים: 3000 עד 9999.
- **סוגי אירוע:** `birthday`, `anniversary`, `memorial`, `other`.
- **`repeatsYearly`:** אם לא נשלח, `true` ביום הולדת, יום נישואין ויום זיכרון, ו־`false` ב־`other`.
- **`gender`** (`male`/`female`): חובה ביום הולדת, אחרת 400.
- **הרשימות** (`/events`, `/notes`) לא מקבלות פרמטרים. הן מחזירות את כל מה שמותר למשתמשת לראות. חיפוש, סינון ומיון נעשים ב־React.
- **תמונות:** JPEG, PNG או WebP עד 1MB, נשמרות במסד הנתונים. הסוג נקבע לפי תוכן הקובץ.
- **הרשאות:** כמו במסמך האפיון. פריט פרטי של אחר מחזיר 404 (כדי לא לחשוף שהוא קיים). מי שאינו חבר בלוח מקבל 403.
- **בעל הלוח** יכול לערוך ולמחוק פריטים משותפים של אחרים (לפי טבלת ההרשאות), אבל לא לשנות להם `visibility`.
- הרשמה עם אימייל שהוזמן ללוחות הופכת את ההזמנות לחברות אוטומטית. אימיילים נשמרים באותיות קטנות.
- סיסמאות נשמרות מוצפנות (bcrypt). ה־JWT תקף 7 ימים כברירת מחדל.
