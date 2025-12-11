import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Bell, User, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MobileNav = ({ onOpenEditor, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  // مكون الأيقونة مع إمكانية إضافة "نقطة تنبيه"
  const NavItem = ({ icon: Icon, path, onClick, activeColor = "text-indigo-500", hasNotification = false }) => {
    const active = path && isActive(path);
    return (
      <button 
        onClick={onClick || (() => navigate(path))}
        className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? activeColor : "text-slate-500 hover:text-slate-300"}`}
      >
        <Icon size={active ? 26 : 24} strokeWidth={active ? 2.5 : 2} fill={active && Icon !== PlusSquare ? "currentColor" : "none"} className={active ? "scale-110 transition-transform" : ""} />
        
        {/* النقطة الزرقاء (أو أي لون) للتنبيه */}
        {hasNotification && (
          <span className="absolute top-3 right-6 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0b0f19]"></span>
        )}
        
        {active && <span className="w-1 h-1 rounded-full bg-current absolute bottom-2"></span>}
      </button>
    );
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-[#1f2937] flex items-center justify-around px-2 z-50 pb-safe">
      
      {/* 1. Home */}
      <NavItem icon={Home} path="/feed" activeColor="text-indigo-500" />

      {/* 2. Search - دلوقتي مربوط بـ onSearch */}
      <NavItem icon={Search} onClick={onSearch} activeColor="text-orange-500" />

      {/* 3. Add Post */}
      <div className="relative -top-5">
        <button 
          onClick={onOpenEditor}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border-4 border-[#0b0f19] active:scale-95 transition-transform"
        >
          <PlusSquare size={28} />
        </button>
      </div>

      {/* 4. Notifications */}
      <NavItem icon={Bell} path="/notifications" activeColor="text-pink-500" />

      {/* 5. Profile */}
      <button 
        onClick={() => navigate(`/profile/${user?.uid}`)}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive(`/profile/${user?.uid}`) ? "opacity-100" : "opacity-60"}`}
      >
        <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${isActive(`/profile/${user?.uid}`) ? "border-indigo-500" : "border-transparent"}`}>
           {user?.photoURL ? (
             <img src={user.photoURL} alt="Me" className="w-full h-full object-cover" />
           ) : (
             <User size={24} />
           )}
        </div>
      </button>

    </div>
  );
};

export default MobileNav;