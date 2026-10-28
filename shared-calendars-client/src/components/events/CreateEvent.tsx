import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createEvent, uploadImage } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import type { CreateEventForm, CreateEventRequest } from "../../types/event"
import {    gematriya, gematriyaStrToNum, HDate } from "@hebcal/hdate"
import { EventForm } from "./EventForm"
interface Props {
    calendarId: number
    onClose: () => void
    defaultDay?: number
    defaultMonth?: number
    defaultYear?: number
}
const CreateEvent = ({
    calendarId,
    onClose,
    defaultDay,
    defaultMonth,
    defaultYear

}: Props) => {

    const queryClient = useQueryClient()

    const createEventMutation = useMutation({
        mutationFn: async({event,imageFile}: {event: CreateEventRequest,        imageFile?: File
}) =>{

        const response = await createEvent(calendarId, event)

        const eventId = response.data.id

        if (imageFile) {
            await uploadImage(eventId, imageFile)
        }
                return response.data

    },
        onSuccess: () => {
         

    queryClient.invalidateQueries({
                queryKey: ["events", String(calendarId)]
            })
            onClose()

        }

    })

    const onSubmit = (data: CreateEventForm) => {
        const imageFile = data.image?.[0]
        const hasSourceYear = !!data.hebrewYearText?.trim()
        let day: number
        let month: number
        let year: number
        if (data.type === "note") {
    data.repeatsYearly = false
}
        //אם בחר מתוך התאריך עצמו
        if(defaultDay != null &&
    defaultMonth != null &&
    defaultYear != null)
    {
            day = defaultDay
    month = defaultMonth
    if (data.repeatsYearly  && hasSourceYear) {
        year = 5000 + gematriyaStrToNum(data.hebrewYearText!)
    } else {
        year = defaultYear
    }
    }
      else if (defaultDay != null && defaultMonth != null) {
    day = defaultDay
    month = defaultMonth

    if (hasSourceYear) {
        year = 5000 + gematriyaStrToNum(data.hebrewYearText!)
    } else {
        year = new HDate().getFullYear()
    }
}
        //אם יצר ארוע בכפתור
       else {
    if (data.repeatsYearly) {

        const yearForDate = hasSourceYear
            ? data.hebrewYearText!
            : gematriya(new HDate().getFullYear())

        const date = HDate.fromGematriyaString(
            `${data.hebrewDate} ${yearForDate}`
        )

        day = date.getDate()
        month = date.getMonth()

        year = hasSourceYear
            ? date.getFullYear()
            : new HDate().getFullYear()
    }
    else {
        const date =
            HDate.fromGematriyaString(data.hebrewDate!)

        day = date.getDate()
        month = date.getMonth()
        year = date.getFullYear()
    }
}
        const {
            hebrewDate,
            hebrewYearText,
            image,
            ...rest
        } = data

        const event: CreateEventRequest = {
            ...rest,
            hebrewDay: day,
            hebrewMonth: month,
            hebrewYear: year,
            hasSourceYear
        }

        createEventMutation.mutate({event,imageFile})
    }
    return (
        <div
    dir="rtl"
    className="w-full text-right"
>
            <EventForm
                onSubmit={onSubmit}
                isPending={createEventMutation.isPending}
                buttonText="צור"
                defaultDay={defaultDay}
                defaultMonth={defaultMonth}
            />
            <button
    type="button"
    onClick={onClose}
    className="
        mt-4 w-full
        rounded-xl
        border border-slate-200
        bg-white
        px-4 py-2.5
        text-sm font-medium
        text-slate-600
        transition
        hover:bg-slate-50
        hover:text-slate-800
    "
>
    ביטול
</button>
            {createEventMutation.isError && (
    <p
        className="
            mt-4 rounded-xl
            border border-red-200
            bg-red-50
            px-4 py-3
            text-sm text-red-600
        "
    >
        {getErrorMessege(createEventMutation.error)}
    </p>
)}
        </div>
    )
}

export default CreateEvent