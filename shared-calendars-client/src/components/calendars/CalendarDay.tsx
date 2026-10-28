import { gematriya } from "@hebcal/hdate"
import type { EventExist } from "../../types/event"
import type { Calendar } from "../../types/calendar"
import ShowEvent from "../events/ShowEvent"

interface Day {
    dayNumber: number
    events: EventExist[]
}

interface Props {
    day: Day | undefined

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

const CalendarDay = ({
    day,
    show,
    calendar,
    user,
    onEdit
}: Props) => {

    if (!day) {
        return null
    }

    return (
        <div
            dir="rtl"
            className="
                min-h-0 flex-1
                overflow-y-auto
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
            "
        >
            <div className="mb-5">
                <div className="text-2xl font-bold text-slate-800">
                    יום {gematriya(day.dayNumber)}
                </div>

                <div className="mt-1 text-sm text-slate-400">
                    {day.events.length} אירועים
                </div>
            </div>

            {day.events.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                    אין אירועים ביום זה
                </div>
            ) : (
                <div className="flex flex-col gap-2">
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
                                imageSize="large"
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CalendarDay