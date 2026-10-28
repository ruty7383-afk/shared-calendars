import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCalendar } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useState } from "react"
interface Props {
    calendarId: number
  
}


const DeleteCalendar=({calendarId}:Props)=>{
        const queryClient = useQueryClient()
        const [showConfirm, setShowConfirm] = useState(false)
const deleteClendarMutation = useMutation({
        mutationFn: () => deleteCalendar(calendarId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["calendars"]
            })
             setShowConfirm(false)
        }
    })
const handleDelete = () => {
    
        deleteClendarMutation.mutate()
  
}

return (
    <>
        <button
            onClick={() => setShowConfirm(true)}
            disabled={deleteClendarMutation.isPending}
            className="
                flex h-9 w-9
                items-center justify-center
                rounded-full
                bg-white/70
                text-sm
                shadow-sm
                transition
                hover:bg-red-50
                hover:shadow
                disabled:opacity-50
            "
            title="מחיקת הלוח"
        >
            🗑️
        </button>

        {showConfirm && (
            <div
                className="
                    fixed inset-0 z-50
                    flex items-center justify-center
                    bg-black/20
                    backdrop-blur-sm
                    p-4
                "
                onClick={() => setShowConfirm(false)}
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
                        מחיקת הלוח
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        האם את בטוחה שברצונך למחוק את הלוח?
                        הפעולה הזאת לא ניתנת לביטול.
                    </p>

                    {deleteClendarMutation.isError && (
                        <p className="mt-3 text-sm text-red-500">
                            {getErrorMessege(deleteClendarMutation.error)}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={deleteClendarMutation.isPending}
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
                            {deleteClendarMutation.isPending
                                ? "מוחק..."
                                : "כן, מחק"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="
                                flex-1
                                rounded-xl
                                border
                                border-slate-200
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
            </div>
        )}
    </>
)
}
export default DeleteCalendar