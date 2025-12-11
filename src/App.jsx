import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast'; 

// الصفحات
import Login from './pages/Login';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications'; 
import Settings from './pages/Settings';
import Chat from './pages/Chat';

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

// مكون تحويل للصفحة الشخصية
const RedirectToProfile = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={`/profile/${user.uid}`} replace /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* الصفحة الرئيسية بقت تحولك لبروفايلك مباشرة */}
        <Route path="/" element={<ProtectedRoute><RedirectToProfile /></ProtectedRoute>} />
        
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/profile/:uid" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}