import { useMutation, useQueryClient } from "@tanstack/react-query"
import { renameCalendar } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useState } from "react"
import { useForm } from "react-hook-form"
interface Props {
    calendarId: number
    name: string

}

interface RenameCalendarForm {
    name: string
}
const RenameCalendar = ({ calendarId, name }: Props) => {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)

    const renameCalendarMutation = useMutation({
        mutationFn: (newName: string) => renameCalendar(calendarId, newName)
        ,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["calendars"]
            })
            setShowForm(false)

        }
    })


    const onSubmit = (data: RenameCalendarForm) => {
        renameCalendarMutation.mutate(data.name)
    }
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RenameCalendarForm>({
        defaultValues: {
            name: name
        }
    })
   return (
    <>
        <button
            onClick={() => setShowForm(true)}
            disabled={renameCalendarMutation.isPending}
            className="
                flex h-9 w-9
                items-center justify-center
                rounded-full
                bg-white/70
                text-sm
                shadow-sm
                transition
                hover:bg-white
                hover:shadow
                disabled:opacity-50
            "
            title="שינוי שם הלוח"
        >
            🖊️
        </button>

        {showForm && (
            <div
                className="
                    fixed inset-0 z-50
                    flex items-center justify-center
                    bg-black/20
                    backdrop-blur-sm
                    p-4
                "
                onClick={() => setShowForm(false)}
            >
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    onClick={(e) => e.stopPropagation()}
                    dir="rtl"
                    className="
                        w-full
                        max-w-sm
                        rounded-3xl
                        border
                        border-emerald-100
                        bg-white
                        p-6
                        shadow-xl
                    "
                >
                    <h2 className="mb-1 text-xl font-bold text-slate-800">
                        שינוי שם הלוח
                    </h2>

                    <p className="mb-5 text-sm text-slate-500">
                        הזיני שם חדש ללוח
                    </p>

                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        שם הלוח
                    </label>

                    <input
                        id="name"
                        type="text"
                        {...register("name", {
                            required: "חובה להזין שם ללוח"
                        })}
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

                    {errors.name && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.name.message}
                        </p>
                    )}

                    {renameCalendarMutation.isError && (
                        <p className="mt-2 text-sm text-red-500">
                            {getErrorMessege(renameCalendarMutation.error)}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={renameCalendarMutation.isPending}
                            className="
                                flex-1
                                rounded-xl
                                bg-emerald-600
                                px-4 py-3
                                font-medium
                                text-white
                                transition
                                hover:bg-emerald-700
                                disabled:opacity-50
                            "
                        >
                            {renameCalendarMutation.isPending
                                ? "שומר..."
                                : "שמור שינויים"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-5 py-3
                                font-medium
                                text-slate-600
                                transition
                                hover:bg-slate-50
                            "
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        )}
    </>
)
}
export default RenameCalendar