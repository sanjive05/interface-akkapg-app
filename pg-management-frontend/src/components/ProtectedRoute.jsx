import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, checking } = useAuth()
  if (checking) return <div className="screen-loader">Checking your session…</div>
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
