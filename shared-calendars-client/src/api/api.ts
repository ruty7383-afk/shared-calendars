import axios from "axios"
import { getToken, rmToken } from "../utils/token"

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const url = error.config?.url

        if (
            error.response?.status === 401 &&
            !url?.includes("/api/auth/login") &&
            !url?.includes("/api/auth/register")
        ) {
            rmToken()
            window.location.href = "/"
        }

        return Promise.reject(error)
    }
)