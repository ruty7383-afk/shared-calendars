import { HDate, gematriya } from "@hebcal/hdate"
import type { EventExist } from "../../types/event"
import type { Calendar } from "../../types/calendar"
import ShowEvent from "../events/ShowEvent"

interface Day {
    dayNumber: number
    events: EventExist[]
}

interface Props {
    days: Day[]
    nowMonth: number
    nowYear: number
    selectedDay: number

    show: (event: EventExist) => {
        text: string
        colors: string
    }

    calendar: Calendar
    user: {
        id: number
    } | null
    onEdit: (event: EventExist) => void
}

const CalendarWeek = ({
    days,
    nowMonth,
    nowYear,
    selectedDay,
    show,
    calendar,
    user,
    onEdit
}: Props) => {

    const currentDate =
        new HDate(selectedDay, nowMonth, nowYear)

    const dayOfWeek = currentDate.getDay()

    const startDay = selectedDay - dayOfWeek

    const weekDays = Array.from(
        { length: 7 },
        (_, index) => {
            const dayNumber = startDay + index

            if (
                dayNumber < 1 ||
                dayNumber > days.length
            ) {
                return null
            }

            return days[dayNumber - 1]
        }
    )

    const names = [
        "ראשון",
        "שני",
        "שלישי",
        "רביעי",
        "חמישי",
        "שישי",
        "שבת"
    ]

    return (
        <div
            dir="rtl"
            className="
                grid min-h-0 flex-1
                grid-cols-7
                overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
            "
        >
            {weekDays.map((day, index) => (

                <div
                    key={index}
                    className="
                        min-h-0
                        border-l border-slate-200
                        p-2
                        last:border-l-0
                    "
                >
                    <div className="mb-3 text-center">
                        <div className="text-xs text-slate-400">
                            {names[index]}
                        </div>

                        {day && (
                            <div className="mt-1 font-bold text-slate-700">
                                {gematriya(day.dayNumber)}
                            </div>
                        )}
                    </div>

                    {day && (
                        <div className="flex flex-col gap-1">
                            {day.events.map((event) => {

                                const t = show(event)

                                return (
                                    <ShowEvent
                                        key={event.id}
                                        event={event}
                                        t={t}
                                        calendar={calendar}
                                        user={user}
                                        onEdit={onEdit}
                                        showImage
                                    />
                                )
                            })}
                        </div>
                    )}

                </div>
            ))}
        </div>
    )
}

export default CalendarWeek