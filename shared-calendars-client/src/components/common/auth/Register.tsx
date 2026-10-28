import { registerUser } from "../../../services/authServices"
import { useAuthContext } from "../../../context/AuthContext"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { setToken } from "../../../utils/token"
import { getErrorMessege } from "../../../utils/getErrorMessege"
import type { RegisterForm } from "../../../types/calendar"

interface Props {
    onClose: () => void
}
const RegisterUser = ({ onClose }: Props) => {

    const { setUser } = useAuthContext()

    const {
        register,
        handleSubmit,

        formState: { errors }
    } = useForm<RegisterForm>()


    const registerUserMutation = useMutation({
        mutationFn: (data: RegisterForm) =>
            registerUser(data),

        onSuccess: (response) => {
            setToken(response.data.token)
            setUser(response.data.user)

          
onClose()        }
    })


    const onSubmit = (data: RegisterForm) => {
        registerUserMutation.mutate(data)
    }


  return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="
            w-full
            max-w-md
            rounded-3xl
            bg-white
            p-7
            shadow-2xl
        "
    >
        <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
                הרשמה
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                צרי חשבון והתחילי לנהל לוחות משותפים
            </p>
        </div>

        <div className="mb-4">
            <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                שם
            </label>

            <input
                id="name"
                type="text"
                placeholder="השם שלך"
                {...register("name", {
                    required: "חובה להזין שם"
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
                <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                </p>
            )}
        </div>

        <div className="mb-4">
            <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                אימייל
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
                    outline-none
                    transition
                    focus:border-emerald-300
                    focus:bg-white
                    focus:ring-2
                    focus:ring-emerald-100
                "
            />

            {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                </p>
            )}
        </div>

        <div>
            <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                סיסמה
            </label>

            <input
                id="password"
                type="password"
                placeholder="לפחות 8 תווים"
                {...register("password", {
                    required: "חובה להזין סיסמה",
                    minLength: {
                        value: 8,
                        message: "הסיסמה חייבת להכיל לפחות 8 תווים"
                    }
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

            {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                </p>
            )}
        </div>

        {registerUserMutation.isError && (
            <p className="mt-3 text-sm text-red-500">
                {getErrorMessege(registerUserMutation.error)}
            </p>
        )}

        <div className="mt-6 flex gap-3">
            <button
                type="submit"
                disabled={registerUserMutation.isPending}
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
                {registerUserMutation.isPending
                    ? "נרשם..."
                    : "הרשמה"}
            </button>

            <button
                type="button"
                onClick={onClose}
                className="
                    rounded-xl
                    border
                    border-slate-200
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
)
}
export default RegisterUser



