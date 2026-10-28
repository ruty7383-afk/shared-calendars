import { useForm } from "react-hook-form"
import type { CreateEventForm } from "../../types/event"
import { gematriyaStrToNum, HDate } from "@hebcal/hdate"


interface Props {
    defaultValues?: CreateEventForm
onSubmit: (
    data: CreateEventForm,
    dirtyFields: Partial<Record<keyof CreateEventForm, boolean>>
) => void
    isPending: boolean
    buttonText: string
    defaultDay?: number
    defaultMonth?: number
}

export const EventForm = ({
    defaultValues,
    onSubmit,
    isPending,
    buttonText,
    defaultDay,
    defaultMonth
}: Props) => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, dirtyFields }
    } = useForm<CreateEventForm>({
        defaultValues,
        shouldUnregister: true
    })
const repeatsYearly = watch("repeatsYearly") 
    const selectedType = watch("type")
   return (
    <form
        onSubmit={handleSubmit((data) =>
            onSubmit(data, dirtyFields)
        )}
        className="space-y-5"
    >

        <div className="space-y-4">

            <div className="space-y-1.5">
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700"
                >
                    שם בעל/י הארוע/תאור
                </label>

                <input
                    id="name"
                    type="text"
                    placeholder="לדוג' יוסי שטרן,לקנות ..."
                    {...register("title", {
                        required: "חובה להזין שם"
                    })}
                    className="
                        w-full rounded-xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-3
                        text-sm text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-violet-400
                        focus:bg-white
                        focus:ring-2
                        focus:ring-violet-100
                    "
                />

                {errors.title && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                        {errors.title.message}
                    </p>
                )}
            </div>


            <div className="space-y-1.5">
                <label
                    htmlFor="type"
                    className="block text-sm font-semibold text-slate-700"
                >
                    סוג ארוע:
                </label>

                <select
                    id="type"
                    {...register("type", {
                        required: "חובה להזין סוג ארוע"
                    })}
                    className="
                        w-full rounded-xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-3
                        text-sm text-slate-700
                        outline-none
                        transition
                        focus:border-violet-400
                        focus:bg-white
                        focus:ring-2
                        focus:ring-violet-100
                    "
                >
                    <option value="">בחר סוג אירוע</option>
                    <option value="birthday">יום הולדת</option>
                    <option value="anniversary">יום נישואין</option>
                    <option value="memorial">יום זיכרון</option>
                    <option value="note">הערה</option>
                    <option value="other">אחר</option>
                </select>

                {errors.type && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                        {errors.type.message}
                    </p>
                )}
            </div>


            {selectedType === "birthday" && (
                <div className="space-y-1.5">
                    <label
                        htmlFor="gender"
                        className="block text-sm font-semibold text-slate-700"
                    >
                        מגדר:
                    </label>

                    <select
                        id="gender"
                        {...register("gender", {
                            required: "ביום הולדת חובה לבחור מגדר"
                        })}
                        className="
                            w-full rounded-xl
                            border border-slate-200
                            bg-slate-50
                            px-4 py-3
                            text-sm text-slate-700
                            outline-none
                            transition
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-2
                            focus:ring-violet-100
                        "
                    >
                        <option value="">בחר מגדר</option>
                        <option value="male">זכר</option>
                        <option value="female">נקבה</option>
                    </select>

                    {errors.gender && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                            {errors.gender.message}
                        </p>
                    )}
                </div>
            )}


            <div className="space-y-1.5">
                <label
                    htmlFor="visibility"
                    className="block text-sm font-semibold text-slate-700"
                >
                    הרשאה:
                </label>

                <select
                    id="visibility"
                    {...register("visibility", {
                        required: "חובה לבחור הרשאה"
                    })}
                    className="
                        w-full rounded-xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-3
                        text-sm text-slate-700
                        outline-none
                        transition
                        focus:border-violet-400
                        focus:bg-white
                        focus:ring-2
                        focus:ring-violet-100
                    "
                >
                    <option value="">בחר הרשאה </option>
                    <option value="shared">משותף </option>
                    <option value="private">פרטי </option>
                </select>

                {errors.visibility && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                        {errors.visibility.message}
                    </p>
                )}
            </div>


            {defaultDay != null && defaultMonth != null ? (
                repeatsYearly ? (
                    <div className="space-y-1.5">
                        <label
                            htmlFor="hebrewYearText"
                            className="block text-sm font-semibold text-slate-700"
                        >
                            שנת מקור:
                        </label>

                        {selectedType !== "note" && (
                            <input
                                id="hebrewYearText"
                                type="text"
                                placeholder="לדוגמה: תשע״ב"
                                {...register("hebrewYearText", {
                                    required: "חובה להזין שנת מקור",
                                    validate: (value) => {
                                        if (!value) {
                                            return "חובה להזין תאריך"
                                        }

                                        try {
                                            const year = gematriyaStrToNum(value)

                                            return year > 0 || "יש להזין שנה עברית תקינה"
                                        }
                                        catch {
                                            return "יש להזין שנה עברית תקינה"
                                        }
                                    }
                                })}
                                className="
                                    w-full rounded-xl
                                    border border-slate-200
                                    bg-slate-50
                                    px-4 py-3
                                    text-sm text-slate-800
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-violet-400
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-violet-100
                                "
                            />
                        )}

                        {errors.hebrewYearText && (
                            <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.hebrewYearText.message}
                            </p>
                        )}
                    </div>
                ) : null
            ) : (
                <div className="space-y-1.5">
                    <label
                        htmlFor="hebrewDate"
                        className="block text-sm font-semibold text-slate-700"
                    >
                        תאריך:
                    </label>

                    <input
                        id="hebrewDate"
                        type="text"
                        placeholder="תאריך מקור, לדוגמה: י׳ חשוון תשע״ב"
                        {...register("hebrewDate", {
                            required: "חובה להזין תאריך",
                            validate: (value) => {
                                if (!value) {
                                    return "חובה להזין תאריך"
                                }

                                try {
                                    HDate.fromGematriyaString(value)
                                    return true
                                }
                                catch {
                                    return "יש להזין תאריך עברי תקין"
                                }
                            }
                        })}
                        className="
                            w-full rounded-xl
                            border border-slate-200
                            bg-slate-50
                            px-4 py-3
                            text-sm text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-2
                            focus:ring-violet-100
                        "
                    />

                    {errors.hebrewDate && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                            {errors.hebrewDate.message}
                        </p>
                    )}
                </div>
            )}


            {selectedType !== "note" && (
                <div
                    className="
                        flex items-center justify-between
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-3
                    "
                >
                    <label
                        htmlFor="repeatsYearly"
                        className="text-sm font-medium text-slate-700"
                    >
                        אירוע חוזר כל שנה?
                    </label>

                    <input
                        id="repeatsYearly"
                        type="checkbox"
                        {...register("repeatsYearly")}
                        className="h-5 w-5 cursor-pointer accent-violet-600"
                    />
                </div>
            )}


            {selectedType !== "note" && (
                <div className="space-y-2">

                    <label
                        htmlFor="image"
                        className="block text-sm font-semibold text-slate-700"
                    >
                        תמונה:
                    </label>

                    <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        {...register("image")}
                        className="
                            block w-full
                            cursor-pointer
                            rounded-xl
                            border border-dashed border-slate-300
                            bg-slate-50
                            p-3
                            text-sm text-slate-500
                            transition
                            hover:border-violet-400
                            hover:bg-violet-50/40
                            file:ml-4
                            file:rounded-lg
                            file:border-0
                            file:bg-violet-100
                            file:px-4
                            file:py-2
                            file:text-sm
                            file:font-medium
                            file:text-violet-700
                        "
                    />

                </div>
            )}

        </div>


        <button
            type="submit"
            disabled={isPending}
            className="
                mt-2 w-full
                rounded-xl
                bg-violet-600
                px-5 py-3
                font-semibold text-white
                shadow-sm
                transition
                hover:bg-violet-700
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            {isPending ? "שומר..." : buttonText}
        </button>

    </form>
)
}