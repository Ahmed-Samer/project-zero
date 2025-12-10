import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';
import UserProfile from './pages/UserProfile';

// استيراد الصفحات
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Feed from './pages/Feed'; // استيراد الصفحة الجديدة

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* الصفحة الرئيسية (الداشبورد / البروفايل) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* صفحة المجتمع (Feed) */}
        <Route 
          path="/feed" 
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } 
        />
        {/* صفحة بروفايل أي مستخدم */}
<Route 
  path="/profile/:uid" 
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  } 
/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}