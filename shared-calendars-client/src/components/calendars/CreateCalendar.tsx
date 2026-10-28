import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createCalendar } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
interface CreateCalendarProps {
    onCreated: () => void
}

interface CreateCalendarForm {
    name: string
}


const CreateCalendar = ({ onCreated }: CreateCalendarProps) => {

    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateCalendarForm>()


    const createCalendarMutation = useMutation({
        mutationFn: (data: CreateCalendarForm) =>
            createCalendar(data.name),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["calendars"]
            })

            reset()
            onCreated()
        }
    })


    const onSubmit = (data: CreateCalendarForm) => {
        createCalendarMutation.mutate(data)
    }


return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="
            w-full
           max-w-sm
            rounded-3xl
            border
            border-emerald-100
            bg-white/90
           p-5
            shadow-sm
            backdrop-blur
        "
    >
        <h2 className="mb-1 text-2xl font-bold text-slate-800">
            יצירת לוח חדש
        </h2>

        <p className="mb-6 text-sm text-slate-500">
            תני שם ללוח ותוכלי להתחיל להוסיף אליו אירועים
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
            placeholder="לדוגמה: משפחה"
            {...register("name", {
                required: "חובה להזין שם ללוח"
            })}
            className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
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

        {createCalendarMutation.isError && (
            <p className="mt-2 text-sm text-red-500">
                {getErrorMessege(createCalendarMutation.error)}
            </p>
        )}

        <button
            type="submit"
            disabled={createCalendarMutation.isPending}
            className="
                mt-5
                w-full
                rounded-xl
                bg-emerald-600
                px-4
                py-3
                font-medium
                text-white
                transition
                hover:bg-emerald-700
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            {createCalendarMutation.isPending
                ? "יוצר..."
                : "+ צור לוח"}
        </button>
    </form>
)
}

export default CreateCalendar