import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PosPage from './pages/PosPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
