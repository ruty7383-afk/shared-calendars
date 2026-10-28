import type { Method } from "axios"
import { api } from "../api/api"
import type { UpdateEventRequest,CreateEventRequest } from "../types/event"


interface ApiRequestProps {
    method: Method
    url: string
    data?: unknown
    params?: unknown
}


// פונקציה כללית לכל הבקשות לשרת
export const apiRequest = ({
    method,
    url,
    data,
    params
}: ApiRequestProps) => {

    return api({
        method,
        url,
        data,
        params
    })
}


// הרשמה
export const registerUser = (user: {
    name: string
    email: string
    password: string
}) => {
    return apiRequest({
        method: "POST",
        url: "/api/auth/register",
        data: user
    })
}


// התחברות
export const login = (user: {
    email: string
    password: string
}) => {
    return apiRequest({
        method: "POST",
        url: "/api/auth/login",
        data: user
    })
}


// קבלת המשתמש המחובר
export const getMe = () => {
    return apiRequest({
        method: "GET",
        url: "/api/auth/me",
        
    })
}


// קבלת כל הלוחות של המשתמש
export const getCalendars = () => {
    return apiRequest({
        method: "GET",
        url: "/api/calendars",
        
    })
}


// יצירת לוח חדש
export const createCalendar = (
    name: string
) => {
    return apiRequest({
        method: "POST",
        url: "/api/calendars",
        
        data: { name }
    })
}


// קבלת לוח מסוים
export const getCalendar = (
    id: number
) => {
    return apiRequest({
        method: "GET",
        url: `/api/calendars/${id}`,
        
    })
}

export const renameCalendar = (
    id: number,name:string
) => {
    return apiRequest({
        method: "PATCH",
        url: `/api/calendars/${id}`,
        data:{name}
    })
}

export const deleteCalendar = (
    id: number
) => {
    return apiRequest({
        method: "DELETE",
        url: `/api/calendars/${id}`,
        
    })
}



// קבלת אירועים לפי שנה וחודש עבריים
export const getEvents = (
  
    calendarId: number,
    hebrewYear: number,
    hebrewMonth: number
) => {
    return apiRequest({
        method: "GET",
        url: `/api/calendars/${calendarId}/events`,
        params: {
            hebrewYear,
            hebrewMonth
        }
    })
}



//יצירת ארוע חדש
export const createEvent = (
        calendarId: number,
 event:CreateEventRequest
    
) => {
    return apiRequest({
        method: "POST",
        url: `/api/calendars/${calendarId}/events`,
        data: event
        
    })
}

export const deleteEvent = (
        eventId: number,
    
) => {
    return apiRequest({
        method: "DELETE",
        url: `/api/events/${eventId}`,
        
    })
}
export const updateEvent = (
    evebtId: number,
 event:UpdateEventRequest
    
) => {
    return apiRequest({
        method: "PATCH",
        url: `/api/events/${evebtId}`,
        data: event
        
    })
}
export const getMembers=(calendarId:number)=>{

return apiRequest({
    method:"GET",
    url:`/api/calendars/${calendarId}/members`
})
}


export const addMember=(calendarId:number,email:string)=>{

return apiRequest({
    method:"POST",
    url:`/api/calendars/${calendarId}/members`,
    data:{email}
})
}

export const removeMember=(calendarId:number,userId:number)=>{

return apiRequest({
    method:"DELETE",
    url:`/api/calendars/${calendarId}/members/${userId}`,
})
}

export const cancelInvitation=(calendarId:number,invitationId:number)=>{

return apiRequest({
    method:"DELETE",
    url:`/api/calendars/${calendarId}/invitations/${invitationId}`,
})
}

export const leaveCalendar=(calendarId:number)=>{

return apiRequest({
    method:"POST",
    url:`/api/calendars/${calendarId}/leave`,
})
}

export const uploadImage=(eventId:number,image: File)=>{
const formData = new FormData()
formData.append("image", image)
return apiRequest({
    method:"PUT",
    url:`/api/events/${eventId}/image`,
    data:formData
})
}
export const deleteEventImage = (
    eventId: number
) => {
    return apiRequest({
        method: "DELETE",
        url: `/api/events/${eventId}/image`
    })
}

