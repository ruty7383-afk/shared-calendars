import { HDate, gematriya, Locale } from "@hebcal/hdate"
import type { NavigateFunction } from "react-router-dom"
import type { Dispatch, SetStateAction } from "react"
import type { Calendar } from "../../types/calendar"

interface Props {
    calendar: Calendar
    nowMonth: number
    nowYear: number
    prevMonth: () => void
    nextMonth: () => void
    setShowCreateEvent: Dispatch<SetStateAction<boolean>>
    navigate: NavigateFunction
    view: "month" | "week" | "day"
setView: (view: "month" | "week" | "day") => void
}

const CalendarHeader = ({
    calendar,
    nowMonth,
    nowYear,
    prevMonth,
    nextMonth,
    setShowCreateEvent,
   navigate,
    view,
    setView
}: Props) => {

    return (
        <div
            dir="rtl"
            className="
                mb-1 flex shrink-0
                items-center justify-between
                gap-4
                px-2 py-1
            "
        >
            {/* שם הלוח */}
            <div className="min-w-[180px] text-right">
                <div className="text-xl font-bold text-slate-800">
                    {calendar.name}
                </div>

                <div className="text-xs text-slate-400">
                    הלוח שלי
                </div>
            </div>


            {/* מעבר בין חודשים */}
            <div className="flex items-center gap-4">
                <button
                    onClick={prevMonth}
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-full
                        border border-slate-200
                        bg-white
                        text-base text-slate-600
                        transition
                        hover:bg-slate-100
                    "
                >
                    →
                </button>

                <div className="min-w-[130px] text-center">
                    <div className="text-xl font-bold text-slate-800">
                        {Locale.gettext(
                            HDate.getMonthName(nowMonth, nowYear),
                            "he"
                        )}
                    </div>

                    <div className="text-xs text-slate-400">
                        {gematriya(nowYear)}
                    </div>
                </div>

                <button
                    onClick={nextMonth}
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-full
                        border border-slate-200
                        bg-white
                        text-base text-slate-600
                        transition
                        hover:bg-slate-100
                    "
                >
                    ←
                </button>
            </div>

<div className="flex rounded-xl bg-slate-100 p-1">

    <button
        type="button"
        onClick={() => setView("month")}
        className={`
            rounded-lg px-3 py-1.5 text-sm transition
            ${
                view === "month"
                    ? "bg-white font-medium text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
            }
        `}
    >
        חודש
    </button>

    <button
        type="button"
        onClick={() => setView("week")}
        className={`
            rounded-lg px-3 py-1.5 text-sm transition
            ${
                view === "week"
                    ? "bg-white font-medium text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
            }
        `}
    >
        שבוע
    </button>

    <button
        type="button"
        onClick={() => setView("day")}
        className={`
            rounded-lg px-3 py-1.5 text-sm transition
            ${
                view === "day"
                    ? "bg-white font-medium text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
            }
        `}
    >
        יום
    </button>

</div>
            {/* פעולות */}
            <div className="flex min-w-[180px] justify-end gap-2">
                <button
                    onClick={() => setShowCreateEvent(true)}
                    className="
                        rounded-lg
                        bg-violet-600
                        px-4 py-2
                        text-sm font-medium
                        text-white
                        shadow-sm
                        transition
                        hover:bg-violet-700
                    "
                >
                    + הוסף אירוע
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/CalendarMember/" + calendar.id,
                            { state: { calendar } }
                        )
                    }
                    className="
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-3 py-2
                        text-sm font-medium
                        text-slate-600
                        transition
                        hover:bg-slate-50
                    "
                >
                    חברי הלוח
                </button>
            </div>
        </div>
    )
}

export default CalendarHeader