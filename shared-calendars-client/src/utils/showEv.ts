import type { EventExist } from "../types/event"

export const show = (event: EventExist,nowYear:number) => {
    let text = ""
    let colors = ""
    const years = nowYear - event.hebrewYear

    if (event.type === "birthday") {
        colors = "bg-rose-100 text-rose-700"

        if (event.gender === "male" && years === 13) {
            text = `בר מצוה ל${event.title}`
        }
        else if (event.gender === "female" && years === 12) {
            text = `בת מצוה ל${event.title}`
        }
        else {
            text = `יום הולדת ${years} ל${event.title} 🎈`
        }
    }

    if (event.type === "anniversary") {
        text = `יום נשואין ${years} ל${event.title}`
        colors = "bg-violet-100 text-violet-700"
    }

    if (event.type === "memorial") {
        text = `יום זכרון ${years} ל${event.title} 🕯️`
        colors = "bg-amber-100 text-amber-800"
    }

    if (event.type === "other") {
        text = event.title
        colors = "bg-emerald-100 text-emerald-700"
    }

    if (event.type === "note") {
        text = event.title
        colors = "bg-sky-100 text-sky-700"
    }

    return { text, colors }
}
   