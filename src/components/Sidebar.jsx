import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // ضفنا Link
import { useAuth } from '../hooks/useAuth';
import SearchModal from './SearchModal';
import { 
  LogOut, Home, Search, Bell, Mail, Zap, Settings
} from 'lucide-react';

const Sidebar = () => { 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const NAV_ITEMS = [
    { icon: Home, label: 'Feed', path: '/feed', action: () => navigate('/feed') },
    // شيلنا الداشبورد خالص زي ما طلبت وخلينا البروفايل هو الأساس
    { icon: Search, label: 'Search', action: () => setIsSearchOpen(true) },
    { icon: Bell, label: 'Notifications', path: '/notifications', action: () => navigate('/notifications') },
    // أيقونة الرسائل مع علامة زرقاء
    { 
      icon: Mail, 
      label: 'Messages', 
      path: '/messages', 
      action: () => navigate('/messages'),
      hasUnread: true // علامة زرقاء (مؤقتة لحد ما نربطها بالداتا)
    },
    { icon: Settings, label: 'Settings', path: '/settings', action: () => navigate('/settings') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="sidebar-fixed w-64 p-6 flex-col justify-between">
        <div>
          {/* Logo - Link to Feed */}
          <div className="mb-10 pl-2">
            <Link to="/feed" className="font-black text-2xl tracking-tighter text-white flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
              PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">ZERO</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const active = item.path && isActive(item.path);
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-600/10 to-transparent text-indigo-400 border-l-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {/* العلامة الزرقاء للرسائل */}
                    {item.hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0b0f19]"></span>
                    )}
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile */}
        {user && (
          <div className="pt-4 border-t border-[#1f2937]">
            <div 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => navigate(`/profile/${user.uid}`)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px]">
                <img src={user.photoURL} alt="Me" className="w-full h-full rounded-full object-cover bg-[#0b0f19]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{user.displayName}</h4>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5"
                >
                  <LogOut size={10} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Sidebar;