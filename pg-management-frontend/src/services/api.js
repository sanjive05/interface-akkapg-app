import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('pg_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-PG-CODE'] = localStorage.getItem('pg_selected_workspace') || 'AKKA-PG'
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      sessionStorage.removeItem('pg_access_token')
      sessionStorage.removeItem('pg_username')
      window.dispatchEvent(new Event('pg:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
