import axios from "axios"
import { createCalendar } from "../services/authServices"
import { getToken, rmToken } from "../utils/token"
import { useNavigate } from "react-router-dom"
import { ChangeEvent, FormEvent,useState } from "react"

export const checkToken =()=>{
const token=getToken();
const navigate=useNavigate()

if(token!=null)
{
    try
    {
        }
    catch(err)
    {
       if(axios.isAxiosError(err) && err.response?.status === 401) 
       {
        navigate("/login")
        rmToken()
       }
       
    }
    
}
else{
        navigate("/LoginPage")

}
}