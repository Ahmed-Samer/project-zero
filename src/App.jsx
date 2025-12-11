import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast'; 

// الصفحات
import Login from './pages/Login';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications'; 
import Settings from './pages/Settings';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 1. لو مفيش يوزر أصلاً -> روح سجل دخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. الثغرة اتقفلت هنا: لو اليوزر موجود بس مش مفعل الإيميل -> ممنوع الدخول
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md w-full backdrop-blur-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Identity verification required. We sent a secure link to 
            <span className="text-white font-mono block mt-1 bg-white/5 py-1 px-2 rounded">{user.email}</span>
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors text-sm"
            >
              I've Verified, Let Me In
            </button>
            <button 
              onClick={logout}
              className="w-full py-2.5 bg-transparent border border-slate-700 text-slate-400 hover:text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// مكون تحويل للصفحة الشخصية
const RedirectToProfile = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // لو مفعل، وديه البروفايل، غير كدا Login
  return (user && user.emailVerified) ? <Navigate to={`/profile/${user.uid}`} replace /> : <Navigate to="/login" replace />;
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