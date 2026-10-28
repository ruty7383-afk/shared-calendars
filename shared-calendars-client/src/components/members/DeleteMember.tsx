import { useMutation, useQueryClient } from "@tanstack/react-query"
import {  removeMember } from "../../services/authServices"
import { getErrorMessege } from "../../utils/getErrorMessege"
import { useState } from "react"
interface Props {
    memberId: number
  calendarId:number
}


const DeleteMember=({memberId,calendarId}:Props)=>{
        const queryClient = useQueryClient()
        const [showConfirm, setShowConfirm] = useState(false)
const deleteMeberMutation = useMutation({
        mutationFn: () => removeMember(calendarId,memberId),

        onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: ["members", String(calendarId)]
            })
            setShowConfirm(false)
        }
    })
const handleDelete = () => {
    deleteMeberMutation.mutate()
}

return (
    <>
        <button
            onClick={() => setShowConfirm(true)}
            disabled={deleteMeberMutation.isPending}
            className="
                rounded-full
                bg-red-50
                px-3 py-1.5
                text-xs
                font-medium
                text-red-600
                transition
                hover:bg-red-100
                disabled:opacity-50
            "
        >
            הסר
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
                        👤
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        הסרת חבר
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        האם את בטוחה שברצונך להסיר את החבר מהלוח?
                    </p>

                    {deleteMeberMutation.isError && (
                        <p className="mt-3 text-sm text-red-500">
                            {getErrorMessege(deleteMeberMutation.error)}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={deleteMeberMutation.isPending}
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
                            {deleteMeberMutation.isPending
                                ? "מסיר..."
                                : "כן, הסר"}
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
export default DeleteMember