import type { EventExist } from "../../types/event"
import type { Calendar } from "../../types/calendar"
import DeleteEvent from "./DeleteEvent"

interface Props {
    event: EventExist
    t: {
        text: string
        colors: string
    }
    calendar: Calendar
    user: {
        id: number
    } | null
    onEdit: (event: EventExist) => void
    showImage?: boolean
    imageSize?: "small" | "large"
}

const ShowEventt = ({
    event,
    t,
    calendar,
    user,
    onEdit,
    showImage = false,
    imageSize = "small"
}: Props) => {

    return (
        <div
            className={`
                pointer-events-auto
                group/event relative
                rounded-md
                px-1.5 py-0.5
                backdrop-blur-sm
                transition
                hover:z-50
                ${t.colors}
            `}
        >
            {showImage && event.hasImage && event.imageUrl && (
   <img
    src={event.imageUrl}
    alt={event.title}
    className={`
        mb-2
        w-full
        rounded-lg
        ${
            imageSize === "large"
                ? "max-h-72 object-contain"
                : "h-24 object-cover"
        }
    `}
/>
)}
            <span
                title={t.text}
                className="
                    block w-full
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    text-right
                    text-[11px]
                    font-medium
                    leading-4
                "
            >
                {t.text}
            </span>

            {(event.createdById === user?.id ||
                (calendar.role === "owner" &&
                    event.visibility === "shared")) && (

                <div
                    className="
                        absolute left-1 top-1/2 z-40
                        hidden -translate-y-1/2
                        items-center gap-1
                        rounded-lg
                        bg-white/95
                        p-1
                        shadow-md
                        group-hover/event:flex
                    "
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(event)
                        }}
                        className="
                            flex h-7 w-7
                            items-center justify-center
                            rounded-md
                            bg-violet-50
                            text-sm
                            transition
                            hover:bg-violet-100
                        "
                    >
                        🖊️
                    </button>

                    <DeleteEvent
                        eventId={event.id}
                        
                    />
                </div>
            )}
        </div>
    )
}

export default ShowEventt