
import './App.css'

import MyCalendars from './pages/MyCalendars'
import ProtectedRoute from "./components/common/ProtectedRoute"
import {  Route, Routes  } from "react-router-dom"
import Calendar from './pages/Calendar'
import CalendarMember from './pages/CalendarMember'
import Header from './components/common/Header'
import Home from "./pages/Home"
import { useAuthContext } from "./context/AuthContext"
function App() {
const { user } = useAuthContext()

  return (
    <div>
     {user && <Header />}
     <Routes>
     <Route path="/" element={<Home />} />
      <Route  element={<ProtectedRoute />}>
      <Route path="/MyCalendars" element={<MyCalendars />} />
      <Route path="/calendars/:id" element={<Calendar />} />
      <Route path="/CalendarMember/:id" element={<CalendarMember />} />
      </Route>
      
      

     </Routes>
     </div>
  )
}

export default App
