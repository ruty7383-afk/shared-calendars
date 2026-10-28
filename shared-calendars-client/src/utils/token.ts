export const rmToken=()=>{localStorage.removeItem("token")}

export const getToken=()=>localStorage.getItem("token")

export const setToken=(token:string)=>{localStorage.setItem("token",token)
}