import { HDate, gematriya } from "@hebcal/hdate"
import type { EventExist } from "../../types/event"
import type { Calendar } from "../../types/calendar"
import ShowEventt from "../events/ShowEvent"

interface Day {
    dayNumber: number
    events: EventExist[]
}

interface Props {
    days: Day[]
    nowMonth: number
    nowYear: number

    show: (event: EventExist) => {
        text: string
        colors: string
    }

    calendar: Calendar

    user: {
        id: number
    } | null

    onEdit: (event: EventExist) => void

    onOpenImagesDay: (dayNumber: number) => void
    onOpenEventsDay: (dayNumber: number) => void
    onCreateEventOnDay: (dayNumber: number) => void
}

const CalendarMonth = ({
    days,
    nowMonth,
    nowYear,
    show,
    calendar,
    user,
    onEdit,
    onOpenImagesDay,
    onOpenEventsDay,
    onCreateEventOnDay
}: Props) => {

    const today = new HDate(new Date())

    const weekDays = [
        "ראשון",
        "שני",
        "שלישי",
        "רביעי",
        "חמישי",
        "שישי",
        "שבת"
    ]

    const firstDayOfMonth =
        new HDate(1, nowMonth, nowYear).getDay()

    const weeksInMonth =
        Math.ceil((firstDayOfMonth + days.length) / 7)

    return (
        <div
            dir="rtl"
            className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* שמות הימים */}
                <div className="grid grid-cols-7 bg-slate-50">

                    {weekDays.map((weekDay) => (
                        <div
                            key={weekDay}
                            className="border-l border-slate-200 py-1.5 text-center text-sm font-semibold text-slate-500 last:border-l-0"
                        >
                            {weekDay}
                        </div>
                    ))}

                </div>

                {/* התאריכים */}
                <div
                    className="grid min-h-0 flex-1 grid-cols-7"
                    style={{
                        gridTemplateRows:
                            `repeat(${weeksInMonth}, minmax(0, 1fr))`
                    }}
                >

                    {/* מקומות ריקים לפני א' בחודש */}
                    {Array.from({
                        length: firstDayOfMonth
                    }).map((_, index) => (

                        <div
                            key={`empty-${index}`}
                            className="min-h-0 border-l border-t border-slate-200 bg-slate-50/60"
                        />

                    ))}

                    {days.map((day) => {

                        const images =
                            day.events.filter(
                                event =>
                                    event.hasImage &&
                                    event.imageUrl
                            )

                        const visibleEvents =
                            day.events.slice(0, 4)

                        const isToday =
                            day.dayNumber === today.getDate() &&
                            nowMonth === today.getMonth() &&
                            nowYear === today.getFullYear()

                        return (

                            <div
                                key={day.dayNumber}
                                className={`
                                    group
                                    relative h-full min-h-0
                                    overflow-hidden
                                    border-l border-t border-slate-200
                                    bg-white
                                    transition
                                    hover:z-10 hover:shadow-lg
                                    ${
                                        isToday
                                            ? "ring-2 ring-inset ring-violet-500"
                                            : ""
                                    }
                                `}
                            >

                                {/* כפתורי עוד תמונות / אירועים */}
                                <div className="absolute bottom-2 left-2 z-30 flex items-center gap-1.5">

                                    {images.length > 2 && (

                                        <button
                                            type="button"
                                            dir="ltr"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onOpenImagesDay(
                                                    day.dayNumber
                                                )
                                            }}
                                            className="
                                                flex h-7 w-9
                                                items-center justify-center
                                                rounded-full
                                                bg-white/60
                                                text-[10px]
                                                font-semibold
                                                text-slate-500
                                                shadow-sm
                                                backdrop-blur-sm
                                                transition
                                                hover:bg-white/90
                                                hover:text-violet-600
                                            "
                                        >

                                            <span className="relative inline-flex h-7 w-7 items-center justify-center">

                                                <span className="text-xl">
                                                    📷
                                                </span>

                                                <span
                                                    className="
                                                        absolute
                                                        inset-0
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-[9px]
                                                        font-bold
                                                        text-slate-700
                                                    "
                                                >
                                                    +{images.length - 2}
                                                </span>

                                            </span>

                                        </button>

                                    )}

                                    {day.events.length > 4 && (

                                        <button
                                            type="button"
                                            dir="ltr"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onOpenEventsDay(
                                                    day.dayNumber
                                                )
                                            }}
                                            className="
                                                flex h-7 w-9
                                                items-center justify-center
                                                rounded-full
                                                bg-white/60
                                                text-[10px]
                                                font-semibold
                                                text-slate-500
                                                shadow-sm
                                                backdrop-blur-sm
                                                transition
                                                hover:bg-white/90
                                                hover:text-violet-600
                                            "
                                        >

                                            <span className="relative inline-flex h-7 w-7 items-center justify-center">

                                                <span className="text-xl">
                                                    📝
                                                </span>

                                                <span
                                                    className="
                                                        absolute
                                                        inset-0
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-[9px]
                                                        font-bold
                                                        text-slate-700
                                                    "
                                                >
                                                    +{day.events.length - 4}
                                                </span>

                                            </span>

                                        </button>

                                    )}

                                </div>

                                {/* התמונות כרקע */}
                                {images.length > 0 && (

                                    <div className="absolute inset-0 z-0">

                                        {images.length === 1 && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onOpenImagesDay(
                                                        day.dayNumber
                                                    )
                                                }
                                                className="h-full w-full"
                                            >

                                                <img
                                                    src={
                                                        images[0].imageUrl ||
                                                        ""
                                                    }
                                                    alt={
                                                        images[0].title
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                            </button>

                                        )}

                                        {images.length >= 2 && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onOpenImagesDay(
                                                        day.dayNumber
                                                    )
                                                }
                                                className="flex h-full w-full"
                                            >

                                                <img
                                                    src={
                                                        images[0].imageUrl ||
                                                        ""
                                                    }
                                                    alt={
                                                        images[0].title
                                                    }
                                                    className="h-full w-1/2 object-cover"
                                                />

                                                <img
                                                    src={
                                                        images[1].imageUrl ||
                                                        ""
                                                    }
                                                    alt={
                                                        images[1].title
                                                    }
                                                    className="h-full w-1/2 object-cover"
                                                />

                                            </button>

                                        )}

                                    </div>

                                )}

                                {/* מספר היום */}
                                <div
                                    className={`
                                        absolute right-2 top-2 z-20
                                        flex h-8 min-w-8
                                        items-center justify-center
                                        rounded-full px-2
                                        text-sm font-bold
                                        shadow-sm
                                        ${
                                            isToday
                                                ? "bg-violet-600 text-white"
                                                : "bg-white/90 text-slate-700 backdrop-blur-sm"
                                        }
                                    `}
                                >
                                    {gematriya(day.dayNumber)}
                                </div>

                                {/* יצירת אירוע */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onCreateEventOnDay(
                                            day.dayNumber
                                        )
                                    }
                                    className="
                                        absolute left-2 top-2 z-20
                                        flex h-8 w-8
                                        items-center justify-center
                                        rounded-full
                                        bg-white/90
                                        text-lg
                                        text-violet-600
                                        opacity-0
                                        shadow-sm
                                        backdrop-blur-sm
                                        transition
                                        hover:bg-violet-600
                                        hover:text-white
                                        group-hover:opacity-100
                                    "
                                >
                                    +
                                </button>

                                {/* האירועים */}
                                {day.events.length > 0 && (

                                    <div
                                        className="
                                            pointer-events-none
                                            absolute bottom-0
                                            left-0 right-0
                                            z-10
                                            px-2 pb-2 pt-2
                                            hover:z-40
                                        "
                                    >

                                        <div className="relative space-y-0.5">

                                            {visibleEvents.map(
                                                (event) => {

                                                    const t =
                                                        show(event)

                                                    return (

                                                        <ShowEventt
                                                            key={
                                                                event.id
                                                            }
                                                            event={
                                                                event
                                                            }
                                                            t={t}
                                                            calendar={
                                                                calendar
                                                            }
                                                            user={
                                                                user
                                                            }
                                                            onEdit={
                                                                onEdit
                                                            }
                                                        />

                                                    )
                                                }
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        )
                    })}

                </div>

            </div>
        </div>
    )
}

export default CalendarMonth