import { useState } from "react"
import RegisterUser from "../components/common/auth/Register"
import Login from "../components/common/auth/LoginPage"
import { getToken } from "../utils/token"

const Home = () => {
    const [showLogin, setShowLogin] = useState(false)
const [showRegister, setShowRegister] = useState(false)
    return (
        <div
            dir="rtl"
            className="
                min-h-screen
                bg-gradient-to-b
                from-emerald-50
                via-white
                to-emerald-100/40
                flex
                items-center
                justify-center
                px-6
            "
        >
            <div className="mx-auto max-w-5xl text-center">

                <div
                    className="
                        mx-auto
                        mb-6
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        bg-emerald-100
                        text-3xl
                        shadow-sm
                    "
                >
                    📅
                </div>

                <h1
                    className="
                        text-4xl
                        font-bold
                        text-slate-800
                        sm:text-5xl
                    "
                >
                    האירועים שלכם, במקום אחד
                </h1>

                <p
                    className="
                        mx-auto
                        mt-5
                        max-w-2xl
                        text-lg
                        leading-8
                        text-slate-500
                    "
                >
                    צרו לוחות משותפים, הוסיפו אירועים,
                    שתפו עם חברים ומשפחה ושמרו את הרגעים החשובים יחד.
                </p>
             {getToken()===null  &&  <div
                    className="
                        mt-8
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        sm:flex-row
                    "
                >
          
                    <button
                       onClick={() => setShowRegister(true)}
                        className="
                            rounded-xl
                            bg-emerald-600
                            px-7 py-3
                            font-medium
                            text-white
                            shadow-sm
                            transition
                            hover:bg-emerald-700
                            hover:shadow-md
                        "
                    >
                        הרשמה
                    </button>

                    <button
                        onClick={() => setShowLogin(true)}
                        className="
                            rounded-xl
                            border
                            border-emerald-200
                            bg-white
                            px-7 py-3
                            font-medium
                            text-emerald-700
                            shadow-sm
                            transition
                            hover:bg-emerald-50
                        "
                    >
                        התחברות
                    </button>
                </div>

             }
                <div
                    className="
                        mt-14
                        grid
                        gap-4
                        sm:grid-cols-3
                    "
                >
                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
                        <div className="mb-2 text-2xl">🗓️</div>
                        <h3 className="font-semibold text-slate-700">
                            לוחות משותפים
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            צרו כמה לוחות שתרצו ושתפו אותם עם אחרים
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
                        <div className="mb-2 text-2xl">🎂</div>
                        <h3 className="font-semibold text-slate-700">
                            אירועים חשובים
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            ימי הולדת, ימי נישואין, תזכורות ועוד
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
                        <div className="mb-2 text-2xl">📷</div>
                        <h3 className="font-semibold text-slate-700">
                            תמונות וזיכרונות
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            הוסיפו תמונות לאירועים ושמרו רגעים יחד
                        </p>
                    </div>
                </div>

            </div>
            {showRegister && (
    <div
        className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/20
            backdrop-blur-sm
            p-4
        "
        onClick={() => setShowRegister(false)}
    >
        <div onClick={(e) => e.stopPropagation()}>
            <RegisterUser
                onClose={() => setShowRegister(false)}
            />
        </div>
    </div>
)}{showLogin && (
    <div
        className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/20
            backdrop-blur-sm
            p-4
        "
        onClick={() => setShowLogin(false)}
    >
        <div onClick={(e) => e.stopPropagation()}>
            <Login
                onClose={() => setShowLogin(false)}
            />
        </div>
    </div>
)}
        </div>
    )
}

export default Home