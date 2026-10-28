import { getCalendars } from "../../services/authServices"
import { useQuery } from "@tanstack/react-query"
import { getErrorMessege } from "../../utils/getErrorMessege"
import type { Calendar } from "../../types/calendar"
import LeaveCalendar from "../members/LeaveCalendar"
import RenameCalendar from "./UpdateCalendar"
import DeleteCalendar from "./DeleteCalendar"
interface Props{
onClickCalendar:(calendar:Calendar)=>void

}


const ShowCalendar = ({onClickCalendar}:Props) => {

    const {
        data: myCalendars = [],
        isLoading,
        isError,
        error
    } = useQuery<Calendar[]>({
        queryKey: ["calendars"],

        queryFn: async () => {
            const response = await getCalendars()
            return response.data
        }
    })

    if (isLoading) {
        return <p>טוען לוחות...</p>
    }

   return (
    <div
        dir="rtl"
        className="
            bg-gradient-to-b
            from-emerald-50/40
            via-white
            to-emerald-50/50
            px-6 py-8
        "
    >
        <div className="mx-auto max-w-6xl">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    הלוחות שלי
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    כל הלוחות המשותפים שלך במקום אחד
                </p>
            </div>


            <div
                className="
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                "
            >
                {myCalendars.map((calendar, index) => {

                    const colors = [
                        "bg-rose-50 border-rose-100",
                        "bg-violet-50 border-violet-100",
                        "bg-sky-50 border-sky-100",
                        "bg-emerald-50 border-emerald-100",
                        "bg-amber-50 border-amber-100",
                        "bg-orange-50 border-orange-100",
                    ]

                    const color = colors[index % colors.length]

                    return (
                        <div
                            key={calendar.id}
                            className={`
                                 group
                                   flex
                                   min-h-[270px]
                                  flex-col
                                  rounded-3xl
                                border
                                p-5
                                shadow-sm
                                transition-all
                                duration-200
                                hover:shadow-lg
                                ${color}
                            `}
                        >

                            <div
                                onClick={() => onClickCalendar(calendar)}
                                className="cursor-pointer flex-1"
                            >
                                <div
                                    className="
                                        mb-6
                                        flex
                                        h-12 w-12
                                        items-center justify-center
                                        rounded-2xl
                                        bg-white/80
                                        text-xl
                                        font-bold
                                        text-slate-700
                                        shadow-sm
                                    "
                                >
                                    {calendar.name.charAt(0)}
                                </div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    {calendar.name}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {calendar.role === "owner"
                                        ? "הלוח שלי"
                                        : "לוח ששותף איתי"}
                                </p>
                            </div>


                            <div
                            className="
    mt-auto
    flex
    items-center
    justify-between
    gap-3
    pt-6
"
                            >
          

                                <div className="flex items-center gap-1">
                                    {calendar.role === "owner" && (
                                        <>
                                            <RenameCalendar
                                                calendarId={calendar.id}
                                                name={calendar.name}
                                            />

                                            <DeleteCalendar
                                                calendarId={calendar.id}
                                            />
                                        </>
                                    )}

                                    {calendar.role === "member" && (
                                        <LeaveCalendar
                                            calendarId={calendar.id}
                                        />
                                    )}
                                </div>
                            </div>

                        </div>
                    )
                })}
            </div>


            {isError && (
                <p className="mt-6 text-sm text-red-500">
                    {getErrorMessege(error)}
                </p>
            )}

        </div>
    </div>
)
}

export default ShowCalendar