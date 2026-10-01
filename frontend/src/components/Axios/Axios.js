import axios from 'axios'
import store from "../../app/store/store.js"
import { logout } from "../../app/features/authSlice.js"
import { clearUrls } from "../../app/features/urlSlice.js"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/v1/api",
    withCredentials: true,
})

let refreshRequest

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config
        const excludedPaths = ["/auth/login", "/auth/register", "/auth/logout", "/auth/refresh"]

        if (
            error.response?.status !== 401 ||
            !request ||
            request._retry ||
            excludedPaths.some((path) => request.url?.includes(path))
        ) {
            return Promise.reject(error)
        }

        request._retry = true

        try {
            if (!refreshRequest) {
                refreshRequest = api.post("/auth/refresh").finally(() => {
                    refreshRequest = null
                })
            }

            await refreshRequest
            return api(request)
        } catch (refreshError) {
            store.dispatch(logout())
            store.dispatch(clearUrls())
            return Promise.reject(refreshError)
        }
    },
)

export default api