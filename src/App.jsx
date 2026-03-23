import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Bills from './pages/Bills'
import Kyc from './pages/Kyc'

const Admin = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <p className="text-gray-500">Admin panel coming in Phase 4</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/bills" element={
            <ProtectedRoute><Bills /></ProtectedRoute>
          } />
          <Route path="/kyc" element={
            <ProtectedRoute><Kyc /></ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
