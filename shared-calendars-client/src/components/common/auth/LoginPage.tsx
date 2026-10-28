import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { login } from "../../../services/authServices"
import { setToken } from "../../../utils/token"
import { useAuthContext } from "../../../context/AuthContext"
import { getErrorMessege } from "../../../utils/getErrorMessege"

interface Props {
    onClose: () => void
}
interface LoginForm {
    email: string
    password: string
}


const Login=({ onClose }: Props)=> {

    const { setUser } = useAuthContext()


    const {register,handleSubmit,formState: { errors }} = useForm<LoginForm>()


    const loginMutation = useMutation({
        mutationFn: login,

        onSuccess: (response) => {
            setToken(response.data.token)
            setUser(response.data.user)
             
          
               onClose()
        }
    })


    const onSubmit = (data: LoginForm) => {
        loginMutation.mutate(data)
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
                התחברות
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                התחברי לחשבון שלך והמשיכי ללוחות המשותפים
            </p>
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
                    required: "חובה להזין מייל"
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
                placeholder="הסיסמה שלך"
                {...register("password", {
                    required: "חובה להזין סיסמה"
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

        {loginMutation.isError && (
            <p className="mt-3 text-sm text-red-500">
                {getErrorMessege(loginMutation.error)}
            </p>
        )}

        <div className="mt-6 flex gap-3">
            <button
                type="submit"
                disabled={loginMutation.isPending}
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
                {loginMutation.isPending
                    ? "מתחבר..."
                    : "התחברות"}
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

export default Login