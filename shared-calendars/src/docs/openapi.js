// תיעוד Swagger (OpenAPI 3). נפתח בדפדפן בכתובת /api/docs

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ 'application/json': { schema } });
const body = (schema, example) => ({ required: true, content: { 'application/json': { schema, ...(example ? { example } : {}) } } });
const err = (description) => ({ description, content: json(ref('Error')) });

const E400 = err('נתונים לא תקינים');
const E401 = err('אין Token תקין');
const E403 = err('אין הרשאה');
const E404 = err('לא נמצא');
const E409 = err('התנגשות (כבר קיים)');

const secured = [{ bearerAuth: [] }];
const idParam = (name, description) => ({ name, in: 'path', required: true, description, schema: { type: 'integer' } });
const calId = idParam('id', 'מזהה לוח');
const eventId = idParam('eventId', 'מזהה אירוע');
const noteId = idParam('noteId', 'מזהה הערה');

const hebrewMonthsDescription =
  'מספר חודש עברי: 1=ניסן, 2=אייר, 3=סיוון, 4=תמוז, 5=אב, 6=אלול, 7=תשרי, 8=חשוון, 9=כסלו, 10=טבת, 11=שבט, ' +
  '12=אדר (בשנה מעוברת: אדר א\'), 13=אדר ב\' (קיים רק בשנה מעוברת)';

const hebrewDateProps = {
  hebrewYear: { type: 'integer', minimum: 3000, maximum: 9999, example: 5786 },
  hebrewMonth: { type: 'integer', minimum: 1, maximum: 13, description: hebrewMonthsDescription, example: 10 },
  hebrewDay: { type: 'integer', minimum: 1, maximum: 30, example: 25 },
};

const eventInputProps = {
  title: { type: 'string', minLength: 1, maxLength: 100, example: 'יום הולדת לסבתא' },
  description: { type: 'string', maxLength: 500, nullable: true, description: 'תיאור אופציונלי, למשל הטקסט של הערה' },
  type: { type: 'string', enum: ['birthday', 'anniversary', 'memorial', 'note', 'other'], description: 'יום הולדת, יום נישואין, יום זיכרון, הערה, אחר' },
  visibility: { type: 'string', enum: ['shared', 'private'], description: 'משותף או פרטי' },
  ...hebrewDateProps,
  hasSourceYear: { type: 'boolean', description: 'true if hebrewYear is a real source year (default true). false when no source year was entered' },
  repeatsYearly: {
    type: 'boolean',
    description: 'חוזר כל שנה. אם לא נשלח: true ביום הולדת, יום נישואין ויום זיכרון, ו-false באחר',
  },
  gender: { type: 'string', enum: ['male', 'female'], nullable: true, description: 'זכר או נקבה. חובה ביום הולדת, אופציונלי בשאר הסוגים' },
};

const noteInputProps = {
  text: { type: 'string', minLength: 1, maxLength: 500, example: 'לא לשכוח לקנות פרחים' },
  visibility: { type: 'string', enum: ['shared', 'private'] },
  ...hebrewDateProps,
};

// פרמטרים אופציונליים: מחזירים רק את החודש העברי המוצג. בלי פרמטרים חוזר הכול.
const monthParams = [
  { name: 'hebrewYear', in: 'query', required: false, description: 'שנה עברית של החודש המוצג. נשלח יחד עם hebrewMonth', schema: { type: 'integer', example: 5787 } },
  { name: 'hebrewMonth', in: 'query', required: false, description: hebrewMonthsDescription, schema: { type: 'integer', example: 10 } },
];

const paths = {
  '/api/health': {
    get: { tags: ['כללי'], summary: 'בדיקת שרת', responses: { 200: { description: 'השרת פעיל', content: json({ type: 'object', properties: { status: { type: 'string', example: 'ok' } } }) } } },
  },

  '/api/auth/register': {
    post: {
      tags: ['אימות'], summary: 'הרשמה',
      description: 'אם הוזמנת ללוחות לפני שנרשמת, ההזמנות הופכות אוטומטית לחברות.',
      requestBody: body(ref('RegisterInput'), { name: 'דנה כהן', email: 'dana@example.com', password: 'secret123' }),
      responses: { 201: { description: 'נוצר', content: json(ref('AuthResponse')) }, 400: E400, 409: E409 },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['אימות'], summary: 'התחברות',
      requestBody: body(ref('LoginInput'), { email: 'dana@example.com', password: 'secret123' }),
      responses: { 200: { description: 'הצלחה', content: json(ref('AuthResponse')) }, 400: E400, 401: E401 },
    },
  },
  '/api/auth/me': {
    get: { tags: ['אימות'], summary: 'המשתמש המחובר', security: secured, responses: { 200: { description: 'המשתמש', content: json(ref('User')) }, 401: E401 } },
  },

  '/api/calendars': {
    get: {
      tags: ['לוחות'], summary: 'הלוחות שלי (שיצרתי ושותפו איתי) עם התפקיד שלי', security: secured,
      responses: { 200: { description: 'רשימה', content: json({ type: 'array', items: ref('Calendar') }) }, 401: E401 },
    },
    post: {
      tags: ['לוחות'], summary: 'יצירת לוח', security: secured,
      requestBody: body({ type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 2, maxLength: 60 } } }, { name: 'המשפחה' }),
      responses: { 201: { description: 'נוצר', content: json(ref('Calendar')) }, 400: E400, 401: E401 },
    },
  },
  '/api/calendars/{id}': {
    get: { tags: ['לוחות'], summary: 'פרטי לוח והתפקיד שלי', security: secured, parameters: [calId], responses: { 200: { description: 'הלוח', content: json(ref('Calendar')) }, 401: E401, 403: E403, 404: E404 } },
    patch: {
      tags: ['לוחות'], summary: 'שינוי שם לוח (בעל הלוח)', security: secured, parameters: [calId],
      requestBody: body({ type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 2, maxLength: 60 } } }),
      responses: { 200: { description: 'עודכן', content: json(ref('Calendar')) }, 400: E400, 401: E401, 403: E403, 404: E404 },
    },
    delete: { tags: ['לוחות'], summary: 'מחיקת לוח עם כל האירועים וההערות (בעל הלוח)', security: secured, parameters: [calId], responses: { 204: { description: 'נמחק' }, 401: E401, 403: E403, 404: E404 } },
  },
  '/api/calendars/{id}/members': {
    get: {
      tags: ['חברים'], summary: 'חברי הלוח (כולל הבעלים), ולבעל הלוח גם הזמנות ממתינות', security: secured, parameters: [calId],
      responses: { 200: { description: 'חברים', content: json(ref('MembersResponse')) }, 401: E401, 403: E403, 404: E404 },
    },
    post: {
      tags: ['חברים'], summary: 'הוספת חבר לפי אימייל (בעל הלוח)',
      description: 'משתמש רשום מתווסף מיד (status=added). אימייל לא רשום נשמר כהזמנה (status=invited).',
      security: secured, parameters: [calId],
      requestBody: body({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }, { email: 'friend@example.com' }),
      responses: { 201: { description: 'נוסף או הוזמן', content: json(ref('AddMemberResponse')) }, 400: E400, 401: E401, 403: E403, 404: E404, 409: E409 },
    },
  },
  '/api/calendars/{id}/members/{userId}': {
    delete: { tags: ['חברים'], summary: 'הסרת חבר (בעל הלוח)', security: secured, parameters: [calId, idParam('userId', 'מזהה משתמש')], responses: { 204: { description: 'הוסר' }, 401: E401, 403: E403, 404: E404 } },
  },
  '/api/calendars/{id}/invitations/{invitationId}': {
    delete: { tags: ['חברים'], summary: 'ביטול הזמנה (בעל הלוח)', security: secured, parameters: [calId, idParam('invitationId', 'מזהה הזמנה')], responses: { 204: { description: 'בוטלה' }, 401: E401, 403: E403, 404: E404 } },
  },
  '/api/calendars/{id}/leave': {
    post: { tags: ['חברים'], summary: 'עזיבת לוח (חבר בלבד. בעל הלוח יכול רק למחוק)', security: secured, parameters: [calId], responses: { 204: { description: 'עזבת' }, 401: E401, 403: E403, 404: E404 } },
  },

  '/api/calendars/{id}/events': {
    get: {
      tags: ['אירועים'], summary: 'כל האירועים שמותר לי לראות: משותפים והפרטיים שלי',
      description: 'אפשר לשלוח hebrewYear ו-hebrewMonth כדי לקבל רק את החודש המוצג, כולל אירועים שחוזרים כל שנה. בלי פרמטרים חוזרים כל האירועים. חיפוש, סינון ומיון נעשים ב-React.',
      security: secured, parameters: [calId, ...monthParams],
      responses: { 200: { description: 'רשימה', content: json({ type: 'array', items: ref('Event') }) }, 401: E401, 403: E403, 404: E404 },
    },
    post: {
      tags: ['אירועים'], summary: 'הוספת אירוע', security: secured, parameters: [calId],
      description: 'התאריך נשלח כשנה, חודש ויום עבריים (מספרים). השרת בודק שהתאריך קיים, ומחזיר 400 אם לא.',
      requestBody: body(
        { type: 'object', required: ['title', 'type', 'visibility', 'hebrewYear', 'hebrewMonth', 'hebrewDay'], properties: eventInputProps },
        { title: 'יום הולדת לסבתא', type: 'birthday', visibility: 'shared', hebrewYear: 5720, hebrewMonth: 10, hebrewDay: 25, gender: 'female' },
      ),
      responses: { 201: { description: 'נוצר', content: json(ref('Event')) }, 400: E400, 401: E401, 403: E403, 404: E404 },
    },
  },
  '/api/events/{eventId}': {
    get: { tags: ['אירועים'], summary: 'אירוע בודד (פרטי: רק היוצר)', security: secured, parameters: [eventId], responses: { 200: { description: 'האירוע', content: json(ref('Event')) }, 401: E401, 403: E403, 404: E404 } },
    patch: {
      tags: ['אירועים'], summary: 'עריכת אירוע (היוצר, ובאירוע משותף גם בעל הלוח)', security: secured, parameters: [eventId],
      description: 'שולחים רק את השדות לשינוי. השרת בודק את האירוע המלא אחרי העדכון.',
      requestBody: body({ type: 'object', properties: eventInputProps }, { hebrewMonth: 11, hebrewDay: 3 }),
      responses: { 200: { description: 'עודכן', content: json(ref('Event')) }, 400: E400, 401: E401, 403: E403, 404: E404 },
    },
    delete: { tags: ['אירועים'], summary: 'מחיקת אירוע (היוצר, ובאירוע משותף גם בעל הלוח)', security: secured, parameters: [eventId], responses: { 204: { description: 'נמחק' }, 401: E401, 403: E403, 404: E404 } },
  },
  '/api/events/{eventId}/image': {
    put: {
      tags: ['תמונות'], summary: 'העלאת תמונה לאירוע (היוצר). JPEG, PNG או WebP, עד 1MB. התמונה נשמרת ב-Cloudinary', description: 'התשובה כוללת imageUrl: כתובת ציבורית שאפשר לשים ישירות ב-src של תמונה, בלי Token. העלאה נוספת מחליפה את התמונה הקודמת.', security: secured, parameters: [eventId],
      requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['image'], properties: { image: { type: 'string', format: 'binary' } } } } } },
      responses: { 200: { description: 'האירוע המעודכן (hasImage=true, imageUrl)', content: json(ref('Event')) }, 400: E400, 401: E401, 403: E403, 404: E404, 502: err('ההעלאה ל-Cloudinary נכשלה'), 503: err('Cloudinary לא מוגדר בשרת') },
    },
    delete: { tags: ['תמונות'], summary: 'מחיקת תמונה (היוצר)', security: secured, parameters: [eventId], responses: { 204: { description: 'נמחקה' }, 401: E401, 403: E403, 404: E404 } },
  },

  '/api/calendars/{id}/notes': {
    get: {
      tags: ['הערות'], summary: 'כל ההערות שמותר לי לראות: משותפות והפרטיות שלי',
      description: 'אפשר לשלוח hebrewYear ו-hebrewMonth כדי לקבל רק את החודש המוצג. בלי פרמטרים חוזרות כל ההערות. חיפוש, סינון ומיון נעשים ב-React.', security: secured, parameters: [calId, ...monthParams],
      responses: { 200: { description: 'רשימה', content: json({ type: 'array', items: ref('Note') }) }, 401: E401, 403: E403, 404: E404 },
    },
    post: {
      tags: ['הערות'], summary: 'הוספת הערה', security: secured, parameters: [calId],
      requestBody: body({ type: 'object', required: ['text', 'visibility', 'hebrewYear', 'hebrewMonth', 'hebrewDay'], properties: noteInputProps }, { text: 'לקנות פרחים', visibility: 'private', hebrewYear: 5786, hebrewMonth: 10, hebrewDay: 24 }),
      responses: { 201: { description: 'נוצרה', content: json(ref('Note')) }, 400: E400, 401: E401, 403: E403, 404: E404 },
    },
  },
  '/api/notes/{noteId}': {
    patch: {
      tags: ['הערות'], summary: 'עריכת הערה (היוצר, ובהערה משותפת גם בעל הלוח)', security: secured, parameters: [noteId],
      requestBody: body({ type: 'object', properties: noteInputProps }),
      responses: { 200: { description: 'עודכנה', content: json(ref('Note')) }, 400: E400, 401: E401, 403: E403, 404: E404 },
    },
    delete: { tags: ['הערות'], summary: 'מחיקת הערה (היוצר, ובהערה משותפת גם בעל הלוח)', security: secured, parameters: [noteId], responses: { 204: { description: 'נמחקה' }, 401: E401, 403: E403, 404: E404 } },
  },
};

const schemas = {
  Error: { type: 'object', properties: { error: { type: 'string' } } },
  User: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } },
  RegisterInput: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', minLength: 2, maxLength: 50 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6, maxLength: 100 } } },
  LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } },
  AuthResponse: { type: 'object', properties: { token: { type: 'string' }, user: ref('User') } },
  Calendar: {
    type: 'object',
    properties: { id: { type: 'integer' }, name: { type: 'string' }, ownerId: { type: 'integer' }, createdAt: { type: 'string', format: 'date-time' }, role: { type: 'string', enum: ['owner', 'member'], description: 'התפקיד שלי בלוח' } },
  },
  Member: { type: 'object', properties: { userId: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['owner', 'member'] }, joinedAt: { type: 'string', format: 'date-time' } } },
  Invitation: { type: 'object', properties: { id: { type: 'integer' }, email: { type: 'string' }, invitedById: { type: 'integer' }, createdAt: { type: 'string', format: 'date-time' } } },
  MembersResponse: { type: 'object', properties: { members: { type: 'array', items: ref('Member') }, invitations: { type: 'array', items: ref('Invitation'), description: 'מופיע רק לבעל הלוח' } } },
  AddMemberResponse: { type: 'object', properties: { status: { type: 'string', enum: ['added', 'invited'] }, member: ref('Member'), invitation: ref('Invitation') } },
  Event: {
    type: 'object',
    properties: {
      id: { type: 'integer' }, calendarId: { type: 'integer' }, createdById: { type: 'integer' }, createdByName: { type: 'string' },
      title: { type: 'string' }, description: { type: 'string', nullable: true },
      type: eventInputProps.type, visibility: eventInputProps.visibility,
      ...hebrewDateProps,
      repeatsYearly: { type: 'boolean' },
      hasSourceYear: { type: 'boolean' },
      gender: { type: 'string', enum: ['male', 'female'], nullable: true },
      hasImage: { type: 'boolean' }, imageUrl: { type: 'string', nullable: true, description: 'כתובת התמונה ב-Cloudinary, או null' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Note: {
    type: 'object',
    properties: {
      id: { type: 'integer' }, calendarId: { type: 'integer' }, createdById: { type: 'integer' }, createdByName: { type: 'string' },
      text: { type: 'string' }, visibility: noteInputProps.visibility,
      ...hebrewDateProps,
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
};

// הערות הן עכשיו סוג אירוע (note), ולכן אין להן Endpoints נפרדים
delete paths['/api/calendars/{id}/notes'];
delete paths['/api/notes/{noteId}'];
delete schemas.Note;

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Shared Calendars API',
    version: '1.0.0',
    description:
      'API ללוחות שנה משותפים עם תאריכים עבריים.\n\n' +
      'לחצי על Authorize למעלה והדביקי את ה-Token שקיבלת בהתחברות.\n\n' +
      'התאריכים נשמרים ומוחזרים כמספרים בלבד (hebrewYear, hebrewMonth, hebrewDay). ' + hebrewMonthsDescription + '.',
  },
  tags: ['כללי', 'אימות', 'לוחות', 'חברים', 'אירועים', 'תמונות'].map((name) => ({ name })),
  paths,
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas,
  },
};
