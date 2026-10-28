import { getEvents ,getCalendar } from "../services/authServices";
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import type { EventExist } from "../types/event"
import { HDate } from "@hebcal/hdate"
import { useQuery } from "@tanstack/react-query"
import { getErrorMessege } from "../utils/getErrorMessege";
import CreateEvent from "../components/events/CreateEvent";
import DeleteEvent from "../components/events/DeleteEvent";
import UpdateEvent from "../components/events/UpdateEvent";
import { useAuthContext } from "../context/AuthContext";
import CalendarHeader from "../components/calendars/CalendarHeader";
import { show } from "../utils/showEv";
import CalendarDay from "../components/calendars/CalendarDay";
import CalendarWeek from "../components/calendars/CalendarWeek";
import type { Calendar as CalendarType } from "../types/calendar";
import CalendarMonth from "../components/calendars/CalendarMonth";
const today = new HDate(new Date())
const Calendar = () => {
    const { id } = useParams()
    const [showCreateEvent, setShowCreateEvent] = useState(false)
    const [showCreateEventOn, setShowCreateEventOn] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuthContext()
    const [eventToUpdate, setEventToUpdate] = useState<EventExist | null>(null)
    const [selectedDay, setSelectedDay] = useState<number>()
    const [openImagesDay, setOpenImagesDay] = useState<number | null>(null)
    const [openEventsDay, setOpenEventsDay] = useState<number | null>(null)
    const location = useLocation()

const { data: calendarFromServer, isLoading: isLoadingCalendar } =
    useQuery<CalendarType>({
        queryKey: ["calendar", id],

        queryFn: async () => {
            const response = await getCalendar(Number(id))
            return response.data
        },

        enabled: !!id && !location.state?.calendar
    })

const calendar = location.state?.calendar ?? calendarFromServer
    const [nowMonth, setNowMonth] = useState<number>(today.getMonth())
    const [nowYear, setNowYear] = useState<number>(today.getFullYear())
  type CalendarView = "month" | "week" | "day"

const [view, setView] = useState<CalendarView>("month")
const [selectedViewDay, setSelectedViewDay] = useState<number>(today.getDate())
    const { data: events = [], isLoading: isLoadingEvents, isError: isErrorEvents, error: errorEvents } = useQuery<EventExist[]>({
        queryKey: ["events", id, nowYear, nowMonth],

        queryFn: async () => {
            const response = await getEvents(
                Number(id),
                nowYear,
                nowMonth
            )

            return response.data
        },

        enabled: id != null
    })

    interface Day {
        dayNumber: number
        events: EventExist[]

    }
    const daysInMonth = HDate.daysInMonth(nowMonth, nowYear)
    const days: Day[] = Array.from(
        { length: daysInMonth },
        (_, index) => ({
            dayNumber: index + 1,
            events: [],
            notes: []

        })
    )
    //הכנסת ארועים למערך הימים
    events.forEach((e) => {
        if (e.hebrewDay === 30 && daysInMonth < 30) {
            days[e.hebrewDay - 2].events.push(e)
        }
        else {
            days[e.hebrewDay - 1].events.push(e)

        }
    })



    const moveView = (direction: 1 | -1) => {

    if (view === "month") {
        const current = new HDate(1, nowMonth, nowYear)

        const newDate =
            direction === 1
                ? current.add(1, "month")
                : current.subtract(1, "month")

        setNowMonth(newDate.getMonth())
        setNowYear(newDate.getFullYear())
        setSelectedViewDay(1)

        return
    }

    const current = new HDate(
        selectedViewDay,
        nowMonth,
        nowYear
    )

    const amount = view === "week" ? 7 : 1

    const newDate =
        direction === 1
            ? current.add(amount, "day")
            : current.subtract(amount, "day")

    setSelectedViewDay(newDate.getDate())
    setNowMonth(newDate.getMonth())
    setNowYear(newDate.getFullYear())
}

const nextMonth = () => moveView(1)
const prevMonth = () => moveView(-1)
if (isLoadingCalendar) {
    return <p>טוען לוח...</p>
}

   
    if (!calendar) {
        return <p>לא נמצאו פרטי הלוח</p>
    }
    //כדי שרק שאין דברים על הלוח יציג
    if (isLoadingEvents) {
        return <p>טוען...</p>
    }
   
    const openedImages =
        openImagesDay !== null
            ? days[openImagesDay - 1]?.events.filter(
                event => event.hasImage && event.imageUrl
            ) ?? []
            : []
          
    return (
<div
    dir="rtl"
    className="
        flex h-[calc(100dvh-64px)]
        w-full flex-col
        overflow-hidden
        bg-gradient-to-b
        from-emerald-50/40
        via-white
        to-emerald-50/50
    "
>
 <CalendarHeader
    calendar={calendar}
    nowMonth={nowMonth}
    nowYear={nowYear}
    prevMonth={prevMonth}
    nextMonth={nextMonth}
    setShowCreateEvent={setShowCreateEvent}
    navigate={navigate}
    view={view}
    setView={setView}
/>    

{view === "month" && (
    <CalendarMonth
        days={days}
        nowMonth={nowMonth}
        nowYear={nowYear}
        show={(event) => show(event, nowYear)}
        calendar={calendar}
        user={user}
        onEdit={(event) =>
            setEventToUpdate(event)
        }
        onOpenImagesDay={(dayNumber) =>
            setOpenImagesDay(dayNumber)
        }
        onOpenEventsDay={(dayNumber) =>
            setOpenEventsDay(dayNumber)
        }
        onCreateEventOnDay={(dayNumber) => {
            setSelectedDay(dayNumber)
            setShowCreateEventOn(true)
        }}
    />
)}
 

    {view === "week" && (
    <CalendarWeek
        days={days}
        nowMonth={nowMonth}
        nowYear={nowYear}
        selectedDay={selectedViewDay}
        show={(event:EventExist) => show(event, nowYear)}
        calendar={calendar}
        user={user}
        onEdit={(event:EventExist) => setEventToUpdate(event)}
    />
)}

{view === "day" && (
    <CalendarDay
        day={days[selectedViewDay - 1]}
        show={(event:EventExist) => show(event, nowYear)}
        calendar={calendar}
        user={user}
        onEdit={(event:EventExist) => setEventToUpdate(event)}
    />
)}      
            {showCreateEvent && (

                <div
                    onClick={() => setShowCreateEvent(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5 backdrop-blur-[2px]"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"
                    >

                        <CreateEvent
                            calendarId={Number(id)}
                            onClose={() => setShowCreateEvent(false)}
                        />

                    </div>

                </div>

            )}
            {showCreateEventOn && (

                <div
                    onClick={() => setShowCreateEventOn(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5 backdrop-blur-[2px]"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"
                    >

                        <CreateEvent
                            calendarId={Number(id)}
                            onClose={() => setShowCreateEventOn(false)}
                            defaultDay={selectedDay}
                            defaultMonth={nowMonth}
                            defaultYear={nowYear}
                        />

                    </div>

                </div>

            )}
            {eventToUpdate && (
                <div
                    className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/45
            p-5
            backdrop-blur-[2px]
        "
                    onClick={() => setEventToUpdate(null)}
                >
                    <div
                        className="
                max-h-[90vh]
                w-full max-w-xl
                overflow-y-auto
                rounded-3xl
                bg-white
                p-7
                shadow-2xl
            "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UpdateEvent
                            eventId={eventToUpdate.id}
                            event={eventToUpdate}
                            onClose={() => setEventToUpdate(null)}
                        />
                    </div>
                </div>
            )}
            {openImagesDay !== null && (

                <div
                    onClick={() => setOpenImagesDay(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
                >

                    {openedImages.length === 1 ? (

                        <div className="relative">
                            <button
                                onClick={() => setOpenImagesDay(null)}
                                className="
                absolute -left-3 -top-3 z-20
                flex h-10 w-10 items-center justify-center
                rounded-full bg-white
                text-xl text-slate-600
                shadow-lg
                hover:bg-slate-100
            "
                            >
                                ×
                            </button>

                            <img
                                src={openedImages[0].imageUrl || ""}
                                alt={openedImages[0].title}
                                className="
                max-h-[60vh]
                max-w-[50vw]
                rounded-2xl
                object-contain
                shadow-2xl
            "
                            />
                        </div>

                    ) : (

                        <div
                            className="
            relative max-h-[85vh]
            w-full max-w-4xl
            overflow-y-auto
            rounded-3xl
            bg-white p-6
            shadow-2xl
        "
                        >
                            <button
                                onClick={() => setOpenImagesDay(null)}
                                className="
                absolute left-4 top-4
                flex h-9 w-9 items-center justify-center
                rounded-full bg-slate-100
                text-xl text-slate-500
                hover:bg-slate-200
            "
                            >
                                ×
                            </button>

                            <div className="mb-5 text-right text-xl font-bold text-slate-800">
                                תמונות:        </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

                                {openedImages.map(event => (
                                    <div
                                        key={event.id}
                                        className="
                        overflow-hidden
                        rounded-2xl
                        border border-slate-200
                        bg-white
                    "
                                    >
                                        <img
                                            src={event.imageUrl || ""}
                                            alt={event.title}
                                            className="aspect-square w-full object-cover"
                                        />

                                        <div className="p-3 text-right text-sm font-medium text-slate-700">
                                            {event.title}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                    )}

                </div>

            )}
            
            {openEventsDay !== null && (

                <div
                    onClick={() => setOpenEventsDay(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                    >

                        <button
                            onClick={() => setOpenEventsDay(null)}
                            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-slate-200"
                        >
                            ×
                        </button>

                        <div className="mb-5 text-right text-xl font-bold text-slate-800">
                            כל האירועים
                        </div>

                        <div className="space-y-2">

                            {days[openEventsDay - 1]?.events.map(event => {

                                const t = show(event,nowYear)

                                return (

                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                                    >

                                        <div
                                            className="text-right text-sm font-medium"
                                           
                                        >
                                            {t.text}
                                        </div>

                                        {(event.createdById === user?.id ||
                                            (
                                                calendar.role === "owner" &&
                                                event.visibility === "shared"
                                            )) && (

                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEventToUpdate(event)
                                                        }}
                                                        className="
        flex h-7 w-7
        items-center justify-center
        rounded-md
        bg-violet-50
        text-sm
        transition
        hover:bg-violet-100
    "
                                                    >
                                                        🖊️
                                                    </button>

                                                    <DeleteEvent
                                                        eventId={event.id}
                                                    />
                                                </div>

                                            )}

                                    </div>

                                )
                            })}

                        </div>

                    </div>

                </div>

            )}
            {isErrorEvents && <p style={{ color: "red" }}>{getErrorMessege(errorEvents)}</p>}


       </div>
    )
}
export default Calendar