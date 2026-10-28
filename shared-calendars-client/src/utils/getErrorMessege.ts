import axios from "axios"


export const getErrorMessege =(err:unknown)=>{
 

     
       if(axios.isAxiosError(err) && err.response?.status === 401) 
       {
           
        return "איימיל או סיסמה שגויים"
       }
       if(axios.isAxiosError(err) && err.response?.status === 400) 
       {
         //לכתוב אין נתונים תקינים
        return "לא נמצאו נתונים תקינים"
       }
       if(axios.isAxiosError(err) && err.response?.status === 403) 
       {
         //לכתוב אין הרשאהים
        return "אין הרשאה"
       }
       if(axios.isAxiosError(err) && err.response?.status === 404) 
       {
         //לכתוב לא נמצנתונים תקינים
        return "לא נמצא"
       }
       if(axios.isAxiosError(err) && err.response?.status === 409) 
       {
         //כבר קיים
        return "כבר קיים"
       }
       if(axios.isAxiosError(err) && (err.response?.status === 503 || err.response?.status === 502) ) 
       {
         //כבר קיים
        return "בעיה בהעלאת תמונה "
       }
       return "אירעה שגיאה"
       
    
   
}

