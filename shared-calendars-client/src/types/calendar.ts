export interface Calendar {
    name: string
    id: number
    role: "owner" | "member"
}
export interface Member {
     name: string
    email: string
    userId: number
}
export interface Invitation{
    email: string
  id  : number
}
export interface MembersResponse {
    members: Member[]
    invitations: Invitation[]
}
export interface RegisterForm{
       name: string
    email: string
    password: string
}