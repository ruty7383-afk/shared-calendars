import { useState } from "react"
import { HDate } from "@hebcal/hdate"
import {
    createEvent,
    getCalendars,
    getEvents
} from "../../services/authServices"
import type { EventType } from "../../types/event"

type ImportEvent = {
    day: number
    month: number
    title: string
    type: EventType
}

const SCHREIBER_EVENTS: ImportEvent[] = [
    { day: 1, month: 11, title: "אברהם אהרון שרייבר", type: "birthday" },
    { day: 1, month: 12, title: "יהודה שרייבר יצחק הולס", type: "birthday" },
    { day: 1, month: 2, title: "דוד שמואל ענבל", type: "birthday" },
    { day: 1, month: 3, title: "יצחק ושרי רפפורט(מן ההר)", type: "anniversary" },
    { day: 2, month: 8, title: "חני שרייבר(ב\"ר מאיר) 5.10", type: "birthday" },
    { day: 2, month: 10, title: "ישראל מאיר ענבל 8.8", type: "birthday" },
    { day: 2, month: 10, title: "יצחק רפפורט (מן ההר)", type: "birthday" },
    { day: 2, month: 10, title: "סבא יהודה", type: "memorial" },
    { day: 2, month: 11, title: "תמר שוורץ 3.2.1", type: "birthday" },
    { day: 2, month: 12, title: "יוני ראם( 3) 3.3.1", type: "birthday" },
    { day: 2, month: 1, title: "סבא", type: "birthday" },
    { day: 2, month: 2, title: "בני פוזן 5.1.2", type: "birthday" },
    { day: 3, month: 8, title: "מוישי כספי", type: "birthday" },
    { day: 3, month: 10, title: "אברהם אהרון 1.2 ואלישבע שרייבר", type: "anniversary" },
    { day: 3, month: 1, title: "רחלי שרייבר(יחיאל), מאיר שרייבר (ב\"ר אברהם אהרון) 1.2.1", type: "birthday" },
    { day: 3, month: 3, title: "מוטי ראם, יחיאל שרייבר", type: "birthday" },
    { day: 3, month: 5, title: "צביקי שרייבר 7.1 ותמר פוזן 7.1", type: "birthday" },
    { day: 3, month: 6, title: "אילת רויטנברג (מן ההר) 2.4.1", type: "birthday" },
    { day: 4, month: 1, title: "יהודה ורחל שרייבר (ב\"ר יחיאל)", type: "anniversary" },
    { day: 4, month: 3, title: "שני שרייבר (ב\"ר שלוימי ב\"ר יחיאל)", type: "birthday" },
    { day: 4, month: 4, title: "גיטי שרייבר(ב\"ר אהרון)מרים שרייבר(ב\"ר יחיאל ב\"ר אהרן)", type: "birthday" },
    { day: 5, month: 7, title: "צבי רויטנברג (מן ההר)", type: "birthday" },
    { day: 5, month: 9, title: "זאבי ושושי בלום, מוישי ואהובי שרייבר", type: "anniversary" },
    { day: 5, month: 11, title: "ר' משה ודסי שרייבר", type: "anniversary" },
    { day: 5, month: 1, title: "צבי שוורץ 3.2.3", type: "birthday" },
    { day: 5, month: 2, title: "שני שרייבר (ב\"ר יהודה ב\"ר יחיאל)1.5.1", type: "birthday" },
    { day: 5, month: 4, title: "אלי ויהודית גרילק (מן ההר)", type: "anniversary" },
    { day: 5, month: 6, title: "מוישי מן ההר 2.10", type: "birthday" },
    { day: 6, month: 9, title: "יחיאל מן ההר", type: "anniversary" },
    { day: 6, month: 1, title: "שירה הוכמן", type: "birthday" },
    { day: 6, month: 5, title: "שירה רויטנברג (מן ההר)", type: "birthday" },
    { day: 7, month: 7, title: "יחיאל שנדורפי", type: "birthday" },
    { day: 7, month: 12, title: "רחלי פוזן()", type: "birthday" },
    { day: 7, month: 1, title: "יחיאל שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 7, month: 2, title: "שיקי שרייבר (ב\"ר יהודה)", type: "birthday" },
    { day: 7, month: 4, title: "יחיאל משה ענבל, יהודה שרייבר( ב\"ר יחיאל)", type: "birthday" },
    { day: 8, month: 8, title: "רחלי ריזל", type: "birthday" },
    { day: 8, month: 9, title: "חני ענבל", type: "birthday" },
    { day: 8, month: 10, title: "רות מן ההר", type: "birthday" },
    { day: 8, month: 12, title: "עליזה פרידל גיטל(ב\"ר יחיאל ב\"ר אהרן)", type: "birthday" },
    { day: 8, month: 4, title: "שמואל אנגלר", type: "birthday" },
    { day: 9, month: 10, title: "יחיאל שרייבר (ב\"ר יהודה)", type: "birthday" },
    { day: 9, month: 12, title: "ציפי שרייבר", type: "birthday" },
    { day: 9, month: 12, title: "סבא יחיאל", type: "memorial" },
    { day: 9, month: 5, title: "חני שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 9, month: 6, title: "שרהלה וזאבי הוכמן", type: "anniversary" },
    { day: 10, month: 8, title: "רחלי שרייבר(יהודה), רותי שרייבר (ב\"ר שלוימי ב\"ר יחיאל)", type: "birthday" },
    { day: 10, month: 2, title: "ידידיה הוכמן, אילה שרייבר( ב\"ר אברהם אהרון)", type: "birthday" },
    { day: 11, month: 9, title: "מיכל ענבל", type: "birthday" },
    { day: 11, month: 10, title: "רחלי כספי", type: "birthday" },
    { day: 11, month: 5, title: "יהודה ורותי לסר (ענבל)", type: "birthday" },
    { day: 12, month: 10, title: "בני שרייבר", type: "birthday" },
    { day: 12, month: 11, title: "מוטי ותמר ראם", type: "anniversary" },
    { day: 12, month: 2, title: "עמי שרייבר שושי בלום אברימי שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 12, month: 3, title: "יחיאל ותהילה שרייבר(ב\"ר משה), יעקב שרייבר ( ב\"ר יחיאל)", type: "birthday" },
    { day: 12, month: 4, title: "אלחנן שורץ, יצחקי וגיטי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 12, month: 5, title: "יהודה ושולי שרייבר", type: "anniversary" },
    { day: 12, month: 6, title: "שרי זכריש(ב\"ר משה שרייבר)", type: "birthday" },
    { day: 13, month: 9, title: "מיכל כספי, מיכל מן ההר", type: "birthday" },
    { day: 13, month: 11, title: "ריקי אנגלר", type: "birthday" },
    { day: 13, month: 1, title: "רשקי שרייבר", type: "birthday" },
    { day: 13, month: 4, title: "מוישי ספרא", type: "birthday" },
    { day: 13, month: 5, title: "רחלי ענבל", type: "birthday" },
    { day: 14, month: 8, title: "יצחק שרייבר(ב\"ר מאיר)", type: "birthday" },
    { day: 14, month: 12, title: "יוסי בלום, נתי שרייבר( ב\"ר שלוימי ב\"ר יחיאל)", type: "birthday" },
    { day: 14, month: 1, title: "שולי שרייבר", type: "birthday" },
    { day: 14, month: 3, title: "חיים מישור (מן ההר)", type: "birthday" },
    { day: 14, month: 4, title: "אהרן וציפי שרייבר", type: "anniversary" },
    { day: 14, month: 5, title: "יצחק ותמר פוזן", type: "anniversary" },
    { day: 15, month: 9, title: "שלוימי שרייבר ( ב\"ר יחיאל)", type: "birthday" },
    { day: 15, month: 10, title: "אביגיל שרייבר (ב\"ר אברהם אהרון)", type: "birthday" },
    { day: 15, month: 11, title: "יאיר הוכמן ,אהרן שרייבר", type: "birthday" },
    { day: 15, month: 12, title: "שני מן ההר", type: "birthday" },
    { day: 15, month: 1, title: "ברוך ריזל", type: "birthday" },
    { day: 15, month: 3, title: "רותי שרייבר", type: "birthday" },
    { day: 15, month: 3, title: "יחיאל ורחלי שרייבר(ב\"ר אהרן)", type: "anniversary" },
    { day: 15, month: 3, title: "ר' משה שרייבר", type: "birthday" },
    { day: 15, month: 3, title: "הדסה שרייבר (ב\"ר אברהם אהרון)", type: "birthday" },
    { day: 15, month: 5, title: "נתי שרייבר(מוישי של יחיאל)", type: "birthday" },
    { day: 15, month: 6, title: "אליהו שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 16, month: 9, title: "אלי שרייבר( ב\"ר מוישי ב\"ר יחיאל)", type: "birthday" },
    { day: 16, month: 12, title: "שרהלה וזאבי הוכמן, אליהו שרייבר (ב\"ר יחיאל)", type: "birthday" },
    { day: 16, month: 3, title: "ציפי פוזן (ב\"ר יצחק ותמר)", type: "birthday" },
    { day: 17, month: 1, title: "בת שבע מן ההר, רחלי זכריש", type: "birthday" },
    { day: 17, month: 4, title: "אילה רפפורט (מן ההר)", type: "birthday" },
    { day: 18, month: 9, title: "תמר כספי", type: "birthday" },
    { day: 18, month: 10, title: "רותי לסר (ענבל)", type: "birthday" },
    { day: 18, month: 12, title: "אברהם צבי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 18, month: 2, title: "שרי מן ההר", type: "birthday" },
    { day: 18, month: 5, title: "חני כספי יחיאל וחנה מן ההר, צביקי ספרא", type: "birthday" },
    { day: 18, month: 6, title: "שמחה שרייבר (ב\"ר יחיאל)", type: "birthday" },
    { day: 19, month: 7, title: "גיטי שרייבר", type: "birthday" },
    { day: 19, month: 8, title: "יצחק גריינימן", type: "birthday" },
    { day: 19, month: 9, title: "זאבי בלום", type: "birthday" },
    { day: 19, month: 10, title: "מיכל ראם (2)", type: "birthday" },
    { day: 19, month: 11, title: "שרי רפפורט (מן ההר), מוישי שורץ", type: "birthday" },
    { day: 19, month: 12, title: "אלחנן ודסי שוורץ", type: "anniversary" },
    { day: 19, month: 1, title: "מתי מישור (מן ההר)", type: "birthday" },
    { day: 19, month: 2, title: "אורי נחמה גרילק (מן ההר)", type: "birthday" },
    { day: 20, month: 8, title: "יחיאל שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 20, month: 9, title: "ישראל מאיר ושושי ריזל (ב\"ר משה שרייבר)", type: "birthday" },
    { day: 20, month: 10, title: "שושי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 20, month: 11, title: "יהודה הוכמן", type: "birthday" },
    { day: 20, month: 12, title: "ציפי פוזן(ב\"ר אברימי ורחלי), אליהו ספרא", type: "birthday" },
    { day: 20, month: 4, title: "שלוימי שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 20, month: 6, title: "תמי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 21, month: 7, title: "אלישבע מישור (מן ההר)", type: "birthday" },
    { day: 21, month: 8, title: "מוישי ואפרת ענבל יחיאל שרייבר(ב\"ר מאיר)", type: "birthday" },
    { day: 21, month: 9, title: "אלי גרילק (מן ההר)", type: "birthday" },
    { day: 21, month: 10, title: "יהודה ב\"ר אהרן שרייבר", type: "birthday" },
    { day: 21, month: 11, title: "יהודית גרילק (מן ההר)", type: "birthday" },
    { day: 21, month: 12, title: "שלוימי מן ההר, יחיאל וחיה שרייבר", type: "anniversary" },
    { day: 21, month: 4, title: "אפרת ענבל", type: "birthday" },
    { day: 21, month: 5, title: "אליהו ונעמי ספרא", type: "anniversary" },
    { day: 22, month: 8, title: "אברימי ספרא", type: "birthday" },
    { day: 22, month: 9, title: "חני שרייבר (ב\"ר אברהם אהרון)", type: "birthday" },
    { day: 22, month: 12, title: "תמר ראם", type: "birthday" },
    { day: 22, month: 12, title: "יצחק ואלישבע הולס", type: "anniversary" },
    { day: 22, month: 12, title: "יהודה ורחלי שרייבר", type: "anniversary" },
    { day: 22, month: 3, title: "מוישי שרייבר (ב\"ר יחיאל), זלדי גריינימן", type: "birthday" },
    { day: 22, month: 5, title: "מאיר שרייבר", type: "birthday" },
    { day: 23, month: 8, title: "חנה מן ההר", type: "birthday" },
    { day: 23, month: 10, title: "יוסי פוזן,יהודה שרייבר(ב\"ר יחאל ב\"ר אהרן)", type: "birthday" },
    { day: 23, month: 1, title: "יהונתן הוכמן", type: "birthday" },
    { day: 23, month: 3, title: "דוד ושולמית ענבל", type: "anniversary" },
    { day: 23, month: 4, title: "יחיאל כספי", type: "birthday" },
    { day: 23, month: 5, title: "אברהם צבי ושרי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 23, month: 6, title: "שני מישור (מן ההר)", type: "birthday" },
    { day: 24, month: 10, title: "מוטי שרייבר שושי שנדורפי", type: "birthday" },
    { day: 24, month: 12, title: "ריקי כספי, שרי וחיים זכריש(שרייבר)", type: "birthday" },
    { day: 24, month: 1, title: "חיה שרייבר", type: "birthday" },
    { day: 24, month: 3, title: "יצחק וזלדי גריינימן", type: "anniversary" },
    { day: 24, month: 3, title: "אומי ירושלים", type: "memorial" },
    { day: 24, month: 4, title: "חני שרייבר(ב\"ר יהודה ב\"ר אהרון)", type: "birthday" },
    { day: 25, month: 12, title: "חני ספרא", type: "birthday" },
    { day: 25, month: 3, title: "מוטי ספרא", type: "birthday" },
    { day: 25, month: 5, title: "שולמית ענבל", type: "birthday" },
    { day: 26, month: 8, title: "יצחקי שרייבר(ב\"ר משה)", type: "birthday" },
    { day: 26, month: 11, title: "אריאל הוכמן יחיאל וחוי שרייבר", type: "birthday" },
    { day: 26, month: 1, title: "יצחק פוזן", type: "birthday" },
    { day: 26, month: 3, title: "מטי שרייבר", type: "birthday" },
    { day: 26, month: 4, title: "צילי שרייבר", type: "birthday" },
    { day: 27, month: 8, title: "ציבי שרייבר", type: "birthday" },
    { day: 27, month: 11, title: "שירה וצבי רויטנברג(מן ההר)", type: "anniversary" },
    { day: 27, month: 12, title: "מירי שרייבר שייקי שרייבר(מאיר), ארי שרייבר( מוישי ב\"ר יחיאל)", type: "birthday" },
    { day: 27, month: 1, title: "אלי שרייבר", type: "birthday" },
    { day: 27, month: 3, title: "אומי בני ברק", type: "memorial" },
    { day: 27, month: 4, title: "מוישי שרייבר(ב\"ר מאיר)", type: "birthday" },
    { day: 27, month: 5, title: "אברימי ורחלי פוזן", type: "anniversary" },
    { day: 28, month: 9, title: "תהילה שרייבר", type: "birthday" },
    { day: 28, month: 11, title: "שלומי ויהודית שרייבר", type: "anniversary" },
    { day: 28, month: 12, title: "תמר מן ההר(של יחיאל)", type: "birthday" },
    { day: 28, month: 4, title: "דסי שורץ", type: "birthday" },
    { day: 28, month: 5, title: "נעמי ספרא", type: "birthday" },
    { day: 28, month: 6, title: "חני שרייבר (ב\"ר יהודה)", type: "birthday" },
    { day: 29, month: 8, title: "יהודה שרייבר (ב\"ר משה)", type: "birthday" },
    { day: 29, month: 3, title: "אברימי כספי", type: "birthday" },
    { day: 29, month: 5, title: "ישראל מאיר שרייבר(ב\"ר אהרון)", type: "birthday" },
    { day: 30, month: 8, title: "אלישבע ורותי שנדורפי", type: "birthday" },
    { day: 30, month: 11, title: "תמר מן ההר", type: "birthday" },
    { day: 30, month: 12, title: "יהודה ענבל", type: "birthday" },
    { day: 30, month: 1, title: "חיים שרייבר(ב\"ר מאיר)", type: "birthday" },
    { day: 30, month: 3, title: "אלישבע הולס(שרייבר)", type: "birthday" },
]

const ImportSchreiberEvents = () => {
    const [isImporting, setIsImporting] = useState(false)
    const [message, setMessage] = useState("")

    const handleImport = async () => {
        const approved = confirm(
            `לייבא ${SCHREIBER_EVENTS.length} אירועים ללוח "שרייבר"?\n` +
            "אירועים שכבר קיימים באותו יום, חודש ושם ידולגו."
        )

        if (!approved) return

        setIsImporting(true)
        setMessage("מתחיל ייבוא...")

        try {
            const calendarsResponse = await getCalendars()

            const calendar = calendarsResponse.data.find(
                (item: { id: number; name: string }) =>
                    item.name.trim() === "שרייבר"
            )

            if (!calendar) {
                setMessage('לא נמצא לוח בשם "שרייבר" אצל המשתמש המחובר.')
                return
            }

            const currentHebrewYear = new HDate().getFullYear()
            const existingKeys = new Set<string>()

            for (let month = 1; month <= 12; month++) {
                const response = await getEvents(
                    calendar.id,
                    currentHebrewYear,
                    month
                )

                for (const event of response.data) {
                    existingKeys.add(
                        `${event.hebrewDay}|${event.hebrewMonth}|${event.title.trim()}`
                    )
                }
            }

            let created = 0
            let skipped = 0
            let failed = 0

            for (const item of SCHREIBER_EVENTS) {
                const key =
                    `${item.day}|${item.month}|${item.title.trim()}`

                if (existingKeys.has(key)) {
                    skipped++
                    continue
                }

                try {
                    await createEvent(calendar.id, {
                        title: item.title,
                        type: item.type,
                        visibility: "shared",
                        hebrewYear: currentHebrewYear,
                        hebrewMonth: item.month,
                        hebrewDay: item.day,
                        repeatsYearly: true,
                        hasSourceYear: false
                    })

                    existingKeys.add(key)
                    created++
                }
                catch (error) {
                    console.error("Failed importing event:", item, error)
                    failed++
                }

                setMessage(
                    `נוצרו ${created}, דולגו ${skipped}, נכשלו ${failed}...`
                )
            }

            setMessage(
                `הייבוא הסתיים ✅ נוצרו ${created} אירועים, ` +
                `דולגו ${skipped} קיימים, נכשלו ${failed}.`
            )
        }
        catch (error) {
            console.error(error)
            setMessage("הייבוא נעצר בגלל שגיאה. בדקי את ה-Console.")
        }
        finally {
            setIsImporting(false)
        }
    }

    return (
        <div dir="rtl" className="mt-4 text-center">
            <button
                type="button"
                onClick={handleImport}
                disabled={isImporting}
                className="
                    rounded-xl
                    bg-violet-600
                    px-5 py-3
                    font-medium
                    text-white
                    shadow-sm
                    transition
                    hover:bg-violet-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                {isImporting
                    ? "מייבא אירועים..."
                    : 'ייבוא אירועי משפחת שרייבר'}
            </button>

            {message && (
                <p className="mt-3 text-sm text-slate-600">
                    {message}
                </p>
            )}
        </div>
    )
}

export default ImportSchreiberEvents
