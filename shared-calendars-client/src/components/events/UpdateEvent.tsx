import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateEvent, uploadImage } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import type {EventExist,CreateEventForm, UpdateEventRequest } from "../../types/event"
import { EventForm } from "./EventForm"
import {  HDate } from "@hebcal/hdate"
import { deleteEventImage } from "../../services/authServices"
import { useState } from "react"
interface Props {
    eventId: number
   event:EventExist
  onClose: () => void
}


const UpdateEvent=({eventId,event,onClose }:Props)=>{
        const queryClient = useQueryClient()
        const [imageDeleted, setImageDeleted] = useState(false)
        const deleteImageMutation = useMutation({
    mutationFn: () => deleteEventImage(eventId),

    onSuccess: () => {
            setImageDeleted(true)

        queryClient.invalidateQueries({
            queryKey: ["events"]
        })
    }
})
const updateEventMutation = useMutation({
        mutationFn: async ({changes,imageFile}: {
        changes: UpdateEventRequest
        imageFile?: File
    }) => {

        if (Object.keys(changes).length > 0) {
            await updateEvent(eventId, changes)
        }

        if (imageFile) {
            await uploadImage(eventId, imageFile)
        }
    },


        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["events"]
            })
onClose()
        }
    })
    const eventDate = new HDate(
    event.hebrewDay,
    event.hebrewMonth,
    event.hebrewYear
)
const defaultValues: CreateEventForm = {
    title: event.title,
    type: event.type,
    visibility: event.visibility,
    repeatsYearly: event.repeatsYearly,
    gender: event.gender??undefined,
    hebrewDate: eventDate.renderGematriya(true)
}

const onSubmit = (data: CreateEventForm,dirtyFields: Partial<Record<keyof CreateEventForm, boolean>>) => {
       const imageFile = data.image?.[0]
    const changes: UpdateEventRequest = {}
     if (dirtyFields.title) {
        changes.title = data.title
    }
        if (dirtyFields.type) {
        changes.type = data.type
    }
     if (dirtyFields.visibility) {
        changes.visibility = data.visibility
    }
     if (dirtyFields.gender) {
        changes.gender = data.gender
    }
        if (dirtyFields.repeatsYearly) {
        changes.repeatsYearly = data.repeatsYearly
    }

        if (dirtyFields.hebrewDate) {
       const date = HDate.fromGematriyaString(data.hebrewDate!)
          changes.hebrewDay= date.getDate()
            changes.hebrewMonth = date.getMonth()
          changes.hebrewYear = date.getFullYear()

        } 
        if (Object.keys(changes).length === 0  && !imageFile) {
    onClose()
    return
}

updateEventMutation.mutate({changes,imageFile})


    }
return (
    <>
      

         (
            <div
                className="
                    fixed inset-0 z-[70]
                    flex items-center justify-center
                    bg-black/45
                    p-5
                    backdrop-blur-[2px]
                "
                onClick={() => onClose()}
            >
                <div
                    className="
                        relative
                        max-h-[90vh]
                        w-full max-w-xl
                        overflow-y-auto
                        rounded-3xl
                        bg-white
                        p-7
                        text-right
                        shadow-2xl
                    "
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()}
                >

                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="
                            absolute left-4 top-4
                            flex h-9 w-9
                            items-center justify-center
                            rounded-full
                            bg-slate-100
                            text-xl text-slate-500
                            transition
                            hover:bg-slate-200
                        "
                    >
                        ×
                    </button>


                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">
                            עריכת אירוע
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            עדכני רק את הפרטים שברצונך לשנות
                        </p>
                    </div>


                    <EventForm
                        defaultValues={defaultValues}
                        onSubmit={onSubmit}
                        isPending={updateEventMutation.isPending}
                        buttonText="שמור שינויים"
                    />


                    {event.hasImage && event.imageUrl && !imageDeleted  && (
                        <div
                            className="
                                mt-5
                                rounded-2xl
                                border border-slate-200
                                bg-slate-50
                                p-4
                            "
                        >
                            <p className="mb-3 text-sm font-semibold text-slate-700">
                                התמונה הנוכחית
                            </p>

                            <div className="flex items-center gap-4">

                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="
                                        h-24 w-24
                                        rounded-xl
                                        object-cover
                                        shadow-sm
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const answer = confirm(
                                            "האם למחוק את התמונה?"
                                        )

                                        if (answer) {
                                            deleteImageMutation.mutate()
                                        }
                                    }}
                                    disabled={deleteImageMutation.isPending}
                                    className="
                                        rounded-xl
                                        border border-red-200
                                        bg-white
                                        px-4 py-2
                                        text-sm font-medium
                                        text-red-500
                                        transition
                                        hover:bg-red-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {deleteImageMutation.isPending
                                        ? "מוחק תמונה..."
                                        : "מחק תמונה"}
                                </button>

                            </div>


                            {deleteImageMutation.isError && (
                                <p
                                    className="
                                        mt-3 rounded-lg
                                        bg-red-50
                                        px-3 py-2
                                        text-xs font-medium
                                        text-red-500
                                    "
                                >
                                    {getErrorMessege(
                                        deleteImageMutation.error
                                    )}
                                </p>
                            )}
                        </div>
                    )}


                    <button
                        type="button"
                        onClick={() => {
onClose()                        }}
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
                        בטל שינויים
                    </button>


                    {updateEventMutation.isError && (
                        <p
                            className="
                                mt-4 rounded-xl
                                border border-red-200
                                bg-red-50
                                px-4 py-3
                                text-sm text-red-600
                            "
                        >
                            {getErrorMessege(
                                updateEventMutation.error
                            )}
                        </p>
                    )}

                </div>
            </div>
        )
    </>
)
}
export default UpdateEvent