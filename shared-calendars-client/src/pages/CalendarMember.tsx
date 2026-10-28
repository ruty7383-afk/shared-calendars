import { useLocation,useNavigate,useParams   } from "react-router-dom"
import ShowMembers from "../components/members/ShowMembers"
import { useState } from "react"
import AddMember from "../components/members/AddMember"
import { useQuery } from "@tanstack/react-query"
import { getCalendar } from "../services/authServices"
import type { Calendar as CalendarType } from "../types/calendar"


const CalendarMember=()=>{
const navigate = useNavigate()
const { id } = useParams()
const [isAdd, setIsAdd] = useState(false)
const location = useLocation()

const { data: calendarFromServer, isLoading } =
    useQuery<CalendarType>({
        queryKey: ["calendar", id],

        queryFn: async () => {
            const response = await getCalendar(Number(id))
            return response.data
        },

        enabled: !!id && !location.state?.calendar
    })

const calendar = location.state?.calendar ?? calendarFromServer
if (isLoading) {
    return <p>טוען לוח...</p>
}
if (!calendar) {
    return <p>לא נמצאו פרטי הלוח</p>
}
    return (
    <div
        dir="rtl"
        className="
            min-h-screen
            bg-gradient-to-b
            from-emerald-50/40
            via-white
            to-emerald-50/50
            px-6 py-4
        "
    >
        <div className="mx-auto max-w-5xl">
            <button
    onClick={() =>
        navigate(`/calendars/${calendar.id}`, {
            state: { calendar }
        })
    }
    className="
        mb-4
        rounded-xl
        bg-white
        px-4 py-2
        text-sm
        font-medium
        text-slate-600
        shadow-sm
        transition
        hover:bg-emerald-50
        hover:text-emerald-700
    "
>
    → חזרה ללוח
</button>
<ShowMembers
    calendar={calendar}
    onAddMember={() => setIsAdd(true)}
/>
            

            {isAdd && (
                <div
                    className="
                        fixed inset-0 z-50
                        flex items-center justify-center
                        bg-black/20
                        backdrop-blur-sm
                        p-4
                    "
                    onClick={() => setIsAdd(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <AddMember
                            calendarId={calendar.id}
                            onClose={() => setIsAdd(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    </div>
)
}
export default CalendarMember



