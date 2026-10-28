export type EventType =
    | "birthday"
    | "anniversary"
    | "memorial"
    |"note"
    | "other"
export type Visibility = "shared" | "private"
export type Gender = "male" | "female"


export interface CreateEventRequest {
    title: string
    type: EventType
    visibility: Visibility
    hebrewYear: number
    hebrewMonth: number
    hebrewDay: number
    repeatsYearly: boolean
    gender?: Gender

}
export interface CreateEventForm {
    title: string
    type: EventType
    visibility: Visibility
    hebrewDate?: string
    hebrewYearText?: string
    repeatsYearly: boolean
    gender?: Gender
    image?: FileList
}
export interface EventExist {
    id: number,
    calendarId: number,
    createdById: number,
    title: string
    type: EventType
    visibility: Visibility
    hebrewYear: number
    hebrewMonth: number
    hebrewDay: number
    repeatsYearly: boolean
    gender?: Gender
    hasImage: boolean
    imageUrl: string | null
}
export interface UpdateEventRequest {
    title?: string
    type?: EventType
    visibility?: Visibility
    hebrewYear?: number
    hebrewMonth?: number
    hebrewDay?: number
    repeatsYearly?: boolean
    gender?: Gender

}
