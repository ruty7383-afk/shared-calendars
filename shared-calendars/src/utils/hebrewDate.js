// בדיקת תקינות של תאריכים עבריים (מספרים בלבד).
// מספור החודשים זהה לזה של הספרייה @hebcal/hdate:
// 1=ניסן, 2=אייר, 3=סיוון, 4=תמוז, 5=אב, 6=אלול, 7=תשרי, 8=חשוון, 9=כסלו,
// 10=טבת, 11=שבט, 12=אדר (בשנה מעוברת: אדר א'), 13=אדר ב' (רק בשנה מעוברת)

const MIN_YEAR = 3000;
const MAX_YEAR = 9999;

function isLeapYear(year) {
  return (7 * year + 1) % 19 < 7;
}

// מספר הימים מאז "מולד בה"ר" ועד ראש השנה, לפני דחיות נוספות
function elapsedDays(year) {
  const months = Math.floor((235 * year - 234) / 19);
  const parts = 12084 + 13753 * months;
  let days = months * 29 + Math.floor(parts / 25920);
  if ((3 * (days + 1)) % 7 < 3) days += 1;
  return days;
}

function yearDelay(year) {
  const ny0 = elapsedDays(year - 1);
  const ny1 = elapsedDays(year);
  const ny2 = elapsedDays(year + 1);
  if (ny2 - ny1 === 356) return 2;
  if (ny1 - ny0 === 382) return 1;
  return 0;
}

function daysInYear(year) {
  return elapsedDays(year + 1) + yearDelay(year + 1) - (elapsedDays(year) + yearDelay(year));
}

function monthsInYear(year) {
  return isLeapYear(year) ? 13 : 12;
}

function daysInMonth(month, year) {
  const len = daysInYear(year);
  switch (month) {
    case 1: case 3: case 5: case 7: case 11: return 30; // ניסן, סיוון, אב, תשרי, שבט
    case 2: case 4: case 6: case 10: return 29; // אייר, תמוז, אלול, טבת
    case 8: return len % 10 === 5 ? 30 : 29; // חשוון (30 בשנה שלמה)
    case 9: return len % 10 === 3 ? 29 : 30; // כסלו (29 בשנה חסרה)
    case 12: return isLeapYear(year) ? 30 : 29; // אדר / אדר א'
    case 13: return 29; // אדר ב'
    default: return 0;
  }
}

// מחזירה null אם התאריך תקין, אחרת הודעת שגיאה
function validateHebrewDate(year, month, day) {
  if (![year, month, day].every(Number.isInteger)) {
    return 'hebrewYear, hebrewMonth and hebrewDay must be integers';
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return `hebrewYear must be between ${MIN_YEAR} and ${MAX_YEAR}`;
  }
  if (month < 1 || month > 13) return 'hebrewMonth must be between 1 and 13';
  if (month === 13 && !isLeapYear(year)) {
    return `hebrewMonth 13 (Adar II) exists only in a leap year, and ${year} is not a leap year`;
  }
  const max = daysInMonth(month, year);
  if (day < 1 || day > max) {
    return `hebrewDay must be between 1 and ${max} for month ${month} of year ${year}`;
  }
  return null;
}

module.exports = { isLeapYear, daysInYear, monthsInYear, daysInMonth, validateHebrewDate, MIN_YEAR, MAX_YEAR };
