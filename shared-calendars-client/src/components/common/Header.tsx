import { NavLink } from "react-router-dom"
import { rmToken } from "../../utils/token"
import { useAuthContext } from "../../context/AuthContext"

const Header = () => {
    const { setUser } = useAuthContext()
    return (
    <header
       className="
    sticky top-0 z-40
    h-12
    shrink-0
    border-b border-emerald-100
    bg-white/85
    backdrop-blur-md
"
    >
        <nav
            dir="rtl"
            className="
                mx-auto
                flex
                max-w-6xl
                items-center
                justify-between
                px-6
                h-full
            "
        >
           <div className="flex items-center gap-2">
    <NavLink
        to="/"
        end
        className={({ isActive }) =>
            `
            rounded-xl
            px-4 py-2
            text-sm
            font-medium
            transition
            ${
                isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }
            `
        }
    >
        דף הבית
    </NavLink>

    <NavLink
        to="/MyCalendars"
        className={({ isActive }) =>
            `
            rounded-xl
            px-4 py-2
            text-sm
            font-medium
            transition
            ${
                isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }
            `
        }
    >
        הלוחות שלי
    </NavLink>
</div>

            <button
                onClick={() => {
                    rmToken()
                        setUser(null)

                }}
                className="
                    rounded-xl
                    px-4 py-2
                    text-sm
                    font-medium
                    text-slate-500
                    transition
                    hover:bg-red-50
                    hover:text-red-600
                "
            >
                התנתקות
            </button>
        </nav>
    </header>
)
}

export default Header