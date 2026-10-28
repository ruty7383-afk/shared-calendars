import { useMutation, useQueryClient } from "@tanstack/react-query"
import {  cancelInvitation } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useState } from "react"
interface Props {
    invitationId: number
  calendarId:number
}


const DeleteInvitation=({invitationId,calendarId}:Props)=>{
        const queryClient = useQueryClient()
        const [showConfirm, setShowConfirm] = useState(false)
const deleteInvationMutation = useMutation({
        mutationFn: () => cancelInvitation(calendarId,invitationId),

        onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: ["members", String(calendarId)]
            })
            setShowConfirm(false)
        }
    })
const handleDelete = () => {
    deleteInvationMutation.mutate()
}

return (
    <>
        <button
            onClick={() => setShowConfirm(true)}
            disabled={deleteInvationMutation.isPending}
            className="
                rounded-full
                bg-amber-50
                px-3 py-1.5
                text-xs
                font-medium
                text-amber-700
                transition
                hover:bg-amber-100
                disabled:opacity-50
            "
        >
            בטל הזמנה
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
                            bg-amber-50
                            text-xl
                        "
                    >
                        ✉️
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        ביטול הזמנה
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        האם את בטוחה שברצונך לבטל את ההזמנה?
                    </p>

                    {deleteInvationMutation.isError && (
                        <p className="mt-3 text-sm text-red-500">
                            {getErrorMessege(deleteInvationMutation.error)}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={deleteInvationMutation.isPending}
                            className="
                                flex-1
                                rounded-xl
                                bg-amber-500
                                px-4 py-3
                                font-medium
                                text-white
                                transition
                                hover:bg-amber-600
                                disabled:opacity-50
                            "
                        >
                            {deleteInvationMutation.isPending
                                ? "מבטל..."
                                : "כן, בטל"}
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
export default DeleteInvitation