import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addMember } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useForm } from "react-hook-form"
interface Props {
    calendarId: number
    onClose: () => void
}
interface AddMemberForm {
    email: string
}
const AddMember = ({
  calendarId,onClose

}: Props) => {
const {
    register,
    handleSubmit,
    formState: { errors }
} = useForm<AddMemberForm>()
    const queryClient = useQueryClient()

    const addMemberMutation = useMutation({
        mutationFn: (email: string) =>
            addMember(calendarId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["members", String(calendarId)]
            })
             
            onClose()

        }

    })
const onSubmit = (data: AddMemberForm) => {
    addMemberMutation.mutate(data.email)
}
    return (
    <div
        dir="rtl"
        className="
            w-full
            max-w-sm
            rounded-3xl
            bg-white
            p-6
            shadow-xl
        "
    >
        <h2 className="text-xl font-bold text-slate-800">
            הוספת חבר ללוח
        </h2>

        <p className="mt-1 text-sm text-slate-500">
            הזיני את כתובת האימייל של מי שתרצי להזמין
        </p>

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6"
        >
            <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                אימייל חבר
            </label>

            <input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                {...register("email", {
                    required: "חובה להזין אימייל"
                })}
                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4 py-3
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

            {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                    {errors.email.message}
                </p>
            )}

            {addMemberMutation.isError && (
                <p className="mt-2 text-sm text-red-500">
                    {getErrorMessege(addMemberMutation.error)}
                </p>
            )}

            <div className="mt-6 flex gap-3">
                <button
                    type="submit"
                    disabled={addMemberMutation.isPending}
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
                    {addMemberMutation.isPending
                        ? "מוסיף..."
                        : "הוסף חבר"}
                </button>

                <button
                    type="button"
                    onClick={onClose}
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
)
}

export default AddMember