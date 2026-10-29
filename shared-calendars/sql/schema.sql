-- הסכמה נטענת אוטומטית בכל הפעלה של השרת (בטוח להרצה חוזרת)

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL CHECK (char_length(name) >= 2),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendars (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(60) NOT NULL CHECK (char_length(name) >= 2),
  owner_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_calendars_owner ON calendars(owner_id);

CREATE TABLE IF NOT EXISTS calendar_members (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_id INTEGER     NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (calendar_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON calendar_members(user_id);

CREATE TABLE IF NOT EXISTS invitations (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_id   INTEGER      NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL,
  invited_by_id INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (calendar_id, email)
);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- תאריכים עבריים נשמרים כמספרים בלבד. 1=ניסן ... 7=תשרי ... 12=אדר/אדר א', 13=אדר ב'
CREATE TABLE IF NOT EXISTS events (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_id      INTEGER      NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  created_by_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(100) NOT NULL CHECK (char_length(title) >= 1),
  description      VARCHAR(500),
  type             VARCHAR(20)  NOT NULL CHECK (type IN ('birthday','anniversary','memorial','note','other')),
  visibility       VARCHAR(10)  NOT NULL CHECK (visibility IN ('shared','private')),
  hebrew_year      INTEGER      NOT NULL,
  hebrew_month     INTEGER      NOT NULL CHECK (hebrew_month BETWEEN 1 AND 13),
  hebrew_day       INTEGER      NOT NULL CHECK (hebrew_day BETWEEN 1 AND 30),
  repeats_yearly   BOOLEAN      NOT NULL,
  gender           VARCHAR(10)  CHECK (gender IN ('male','female')),
  image_url        TEXT,
  image_public_id  TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_calendar ON events(calendar_id);

CREATE TABLE IF NOT EXISTS notes (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_id   INTEGER      NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  created_by_id INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text          VARCHAR(500) NOT NULL CHECK (char_length(text) >= 1),
  visibility    VARCHAR(10)  NOT NULL CHECK (visibility IN ('shared','private')),
  hebrew_year   INTEGER      NOT NULL,
  hebrew_month  INTEGER      NOT NULL CHECK (hebrew_month BETWEEN 1 AND 13),
  hebrew_day    INTEGER      NOT NULL CHECK (hebrew_day BETWEEN 1 AND 30),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_calendar ON notes(calendar_id);

-- עדכון למסד קיים: הערה היא עכשיו סוג אירוע (note), ולאירוע יש תיאור אופציונלי
ALTER TABLE events ADD COLUMN IF NOT EXISTS description VARCHAR(500);
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check CHECK (type IN ('birthday','anniversary','memorial','note','other'));

-- עדכון למסד קיים: התמונות עברו ל-Cloudinary (נשמרים רק הכתובת והמזהה)
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_public_id TEXT;
ALTER TABLE events DROP COLUMN IF EXISTS image_data;
ALTER TABLE events DROP COLUMN IF EXISTS image_mime_type;

-- hasSourceYear: true when a source year was entered. Existing events get true
ALTER TABLE events ADD COLUMN IF NOT EXISTS has_source_year BOOLEAN NOT NULL DEFAULT TRUE;

-- gender optional for birthday
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_check;
