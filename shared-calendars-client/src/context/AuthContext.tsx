import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { getMe } from "../services/authServices"
import { getToken } from "../utils/token"
interface User {
  id: number
  name: string
  email: string
}
interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const token = getToken()

    if (!token) return

    getMe()
        .then((response) => {
            const currentUser =
                response.data.user ?? response.data

            setUser(currentUser)
        })
        .catch(() => {
            setUser(null)
        })
}, [])
return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider")
  }

  return context
}