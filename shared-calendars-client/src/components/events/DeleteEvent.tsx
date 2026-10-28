import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteEvent } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useState } from "react"
import { createPortal } from "react-dom"
interface Props {
    eventId: number}

const DeleteEvent=({eventId}:Props)=>{
    const [showConfirm, setShowConfirm] = useState(false)
        const queryClient = useQueryClient()
const deleteEventMutation = useMutation({
        mutationFn: () => deleteEvent(eventId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["events"]
            })
                setShowConfirm(false)

        }
    })
const handleDelete = () => {
    deleteEventMutation.mutate()
}

return (
    <>
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(true)
            }}
            disabled={deleteEventMutation.isPending}
            className="
                flex h-7 w-7
                items-center justify-center
                rounded-md
                bg-red-50
                text-sm
                transition
                hover:bg-red-100
                disabled:opacity-50
            "
            title="מחיקת אירוע"
        >
            🗑️
        </button>
{showConfirm &&
    createPortal(
        <div
            className="
                fixed inset-0 z-[9999]
                flex items-center justify-center
                bg-black/20
                backdrop-blur-sm
                p-4
            "
            onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(false)
            }}
        >
            <div
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
                className="
                    w-full
                    max-w-sm
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-xl
                "
            >
                <div
                    className="
                        mb-4
                        flex h-12 w-12
                        items-center justify-center
                        rounded-full
                        bg-red-50
                        text-xl
                    "
                >
                    🗑️
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                    מחיקת אירוע
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    האם את בטוחה שברצונך למחוק את האירוע?
                </p>

                {deleteEventMutation.isError && (
                    <p className="mt-3 text-sm text-red-500">
                        {getErrorMessege(deleteEventMutation.error)}
                    </p>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteEventMutation.isPending}
                        className="
                            flex-1
                            rounded-xl
                            bg-red-500
                            px-4 py-3
                            font-medium
                            text-white
                            transition
                            hover:bg-red-600
                            disabled:opacity-50
                        "
                    >
                        {deleteEventMutation.isPending
                            ? "מוחק..."
                            : "כן, מחק"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowConfirm(false)}
                        className="
                            flex-1
                            rounded-xl
                            border border-slate-200
                            bg-white
                            px-4 py-3
                            font-medium
                            text-slate-600
                            transition
                            hover:bg-slate-50
                        "
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
    </>
)
}
export default DeleteEvent