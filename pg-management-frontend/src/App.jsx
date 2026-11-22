import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppLayout from './layouts/AppLayout'
import { RoomsPage, BillingPage, PaymentsPage, ReportsPage, SettingsPage, ElectricityPage } from './pages/OperationsPages'
import TenantsPage from './pages/TenantsPage'
import TenantProfilePage from './pages/TenantProfilePage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:tenantId" element={<TenantProfilePage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="electricity" element={<ElectricityPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
