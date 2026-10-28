import { useQuery } from "@tanstack/react-query"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { getMembers } from "../../services/authServices"
import DeleteMember from "./DeleteMember"
import type { Calendar,MembersResponse } from "../../types/calendar"
import { useState } from "react"
import DeleteInvitation from "../invation/DeleteInvation"
interface Props {
    calendar: Calendar
    onAddMember: () => void
}

const ShowMembers = ({ calendar ,onAddMember }: Props) => {
    const {
        data ,
        isLoading,
        isError,
        error
    } = useQuery<MembersResponse>({
queryKey: ["members", String(calendar.id)],
        queryFn: async () => {
            const response = await getMembers(calendar.id)

            return response.data
        }
    })
    const members = data?.members ?? []
const invitations = data?.invitations ?? []
const [search,setSearch]=useState<string>("")

    if (isLoading) {
        return <p>טוען חברים...</p>
    }
   return (
    <div
        dir="rtl"
        className="
            mx-auto
            w-full
            max-w-4xl
            rounded-3xl
            bg-white/80
            p-6
            shadow-sm
        "
    >
        <div className="mb-6 flex items-start justify-between gap-4">

<div className="flex-1 text-center">        <h2 className="text-2xl font-bold text-slate-800">
            חברי הלוח
        </h2>

        <p className="mt-1 text-sm font-medium text-emerald-700">
            {calendar.name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
            כאן אפשר לראות ולנהל את המשתתפים בלוח
        </p>
    </div>

    {calendar.role === "owner" && (
        <button
            onClick={onAddMember}
            className="
                rounded-xl
                bg-emerald-600
                px-4 py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
            "
        >
            + הוסף חבר
        </button>
    )}

</div>

        <div className="mb-6">
            <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-slate-600"
            >
                חיפוש חבר
            </label>

            <input
                id="search"
                type="text"
                placeholder="חיפוש לפי שם או אימייל..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4 py-3
                    outline-none
                    transition
                    focus:border-emerald-300
                    focus:bg-white
                    focus:ring-2
                    focus:ring-emerald-100
                "
            />
        </div>

        <div className="space-y-3">
            {members
                .filter(
                    (m) =>
                        m.email.includes(search) ||
                        m.name.includes(search)
                )
                .map((member) => (
                    <div
                        key={member.userId}
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50/70
                            px-4 py-3
                        "
                    >
                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex h-10 w-10
                                    items-center justify-center
                                    rounded-full
                                    bg-emerald-100
                                    font-bold
                                    text-emerald-700
                                "
                            >
                                {member.name.charAt(0)}
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    {member.name}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {member.email}
                                </p>
                            </div>
                        </div>

                        {calendar.role === "owner" && (
                            <DeleteMember
                                memberId={member.userId}
                                calendarId={calendar.id}
                            />
                        )}
                    </div>
                ))}
        </div>

        {invitations.length !== 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">

                <h3 className="mb-4 text-lg font-bold text-slate-700">
                    הזמנות ממתינות
                </h3>

                <div className="space-y-3">
                    {invitations
                        .filter((m) => m.email.includes(search))
                        .map((invitation) => (
                            <div
                                key={invitation.id}
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    rounded-2xl
                                    border
                                    border-amber-100
                                    bg-amber-50/60
                                    px-4 py-3
                                "
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {invitation.email}
                                    </p>

                                    <p className="mt-1 text-xs text-amber-600">
                                        ממתין להצטרפות
                                    </p>
                                </div>

                                {calendar.role === "owner" && (
                                    <DeleteInvitation
                                        invitationId={invitation.id}
                                        calendarId={calendar.id}
                                    />
                                )}
                            </div>
                        ))}
                </div>
            </div>
        )}

        {isError && (
            <p className="mt-4 text-sm text-red-500">
                {getErrorMessege(error)}
            </p>
        )}
    </div>
)
}

export default ShowMembers