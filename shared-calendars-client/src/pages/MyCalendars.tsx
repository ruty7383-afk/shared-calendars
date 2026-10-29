import { useNavigate } from "react-router-dom"
import CreateCalendar from "../components/calendars/CreateCalendar"
import ShowCalendar from "../components/calendars/ShowCalendars"
import { useState } from "react"
const MyCalendars = () => {
const [showCreate, setShowCreate] = useState(false)
    const navigate = useNavigate()


   return (
    <div
        dir="rtl"
        className="
            min-h-screen
            bg-gradient-to-b
            from-emerald-50/40
            via-white
            to-emerald-50/50
            px-6 py-8
        "
    >
        <div className="mx-auto max-w-6xl">

            <ShowCalendar
                onClickCalendar={(calendar) =>
                    navigate("/calendars/" + calendar.id, {
                        state: { calendar }
                    })
                }
            />

            <div className="mt-8 flex justify-center">
<button
    onClick={() => setShowCreate(true)}
    className="
        mt-8
        rounded-xl
        bg-emerald-600
        px-6 py-3
        font-medium
        text-white
        shadow-sm
        transition
        hover:bg-emerald-700
        hover:shadow-md
    "
>
    + יצירת לוח חדש
</button>   
{showCreate && (
    <div
        className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/20
            backdrop-blur-sm
            p-4
        "
        onClick={() => setShowCreate(false)}
    >
        <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={() => setShowCreate(false)}
                className="
                    absolute
                    -top-3 -left-3
                    z-10
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-white
                    text-lg
                    text-slate-500
                    shadow-md
                    transition
                    hover:text-slate-800
                "
            >
                ×
            </button>
            <CreateCalendar
    onCreated={() => setShowCreate(false)}
/>
        </div>
    </div>
)}         </div>

        </div>
    </div>
)
}

export default MyCalendars