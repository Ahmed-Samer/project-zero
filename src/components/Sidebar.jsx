import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SearchModal from './SearchModal';
import { 
  LogOut, Home, Search, Bell, Mail, Zap
} from 'lucide-react';

const Sidebar = () => { // شيلنا mobileMenuOpen props مبقاش ليها لازمة هنا
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const NAV_ITEMS = [
    { icon: Home, label: 'Feed', path: '/feed', action: () => navigate('/feed') },
    { icon: Zap, label: 'Dashboard', path: '/', action: () => navigate('/') },
    { icon: Search, label: 'Search', action: () => setIsSearchOpen(true) },
    { icon: Bell, label: 'Notifications', path: '/notifications', action: () => navigate('/notifications') },
    { icon: Mail, label: 'Messages', path: '/messages', action: () => alert("Messages feature coming soon!") },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="sidebar-fixed w-64 p-6 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mb-10 pl-2">
            <h1 className="font-black text-2xl tracking-tighter text-white flex items-center gap-1">
              PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">ZERO</span>
            </h1>
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
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-600/10 to-transparent text-indigo-400 border-l-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile */}
        {user && (
          <div className="pt-4 border-t border-[#1f2937]">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px]">
                <img src={user.photoURL} alt="Me" className="w-full h-full rounded-full object-cover bg-[#0b0f19]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{user.displayName}</h4>
                <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5">
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