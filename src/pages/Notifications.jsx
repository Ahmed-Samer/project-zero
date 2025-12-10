import React, { useState } from 'react'; // ضفنا useState
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal'; // عشان دالة النشر
import { getDayNumber, formatTime } from '../lib/utils';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav'; // استيراد الشريط السفلي
import EditorModal from '../components/EditorModal'; // استيراد المودال
import { Skeleton } from '../components/Skeleton';
import { Heart, MessageSquare, UserPlus, Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROJECT_START_DATE = new Date();

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, loading, markAllAsRead, markAsRead } = useNotifications(user);
  
  // States للنشر من زرار الموبايل
  const { addEntry } = useJournal(user);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSave = async (data) => {
    const now = new Date();
    const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
    await addEntry(data.content, now, currentDayNum, data.quote, data.image);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-[#f91880]" fill="currentColor" />;
      case 'comment': return <MessageSquare size={18} className="text-[#1d9bf0]" fill="currentColor" />;
      case 'follow': return <UserPlus size={18} className="text-[#00ba7c]" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center justify-center">
        <span className="font-bold text-lg tracking-tight">Notifications</span>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen">
        <main className="flex-1 max-w-[650px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0">
          
          {/* Desktop Header */}
          <div className="hidden lg:flex sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1f2937] px-4 py-4 justify-between items-center">
            <h2 className="text-xl font-bold text-[#e7e9ea]">Notifications</h2>
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-[#1f2937]">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : notifications.length > 0 ? (
              <AnimatePresence>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 flex gap-4 hover:bg-[#111827] transition-colors cursor-pointer ${!notif.read ? 'bg-[#161e31]/50' : ''}`}
                  >
                    <div className="mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <img 
                          src={notif.senderImage || `https://ui-avatars.com/api/?name=${notif.senderName}&background=random`} 
                          alt="Sender" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-bold text-sm">{notif.senderName}</span>
                      </div>
                      <p className="text-sm text-[#e7e9ea] mb-1">
                        {notif.type === 'like' && 'liked your signal.'}
                        {notif.type === 'comment' && `replied: "${notif.text}"`}
                        {notif.type === 'follow' && 'started following you.'}
                      </p>
                      <span className="text-xs text-[#71767b]">{formatTime(notif.createdAt)}</span>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20 text-[#64748b]">
                <Bell size={40} className="mx-auto mb-4 opacity-50" />
                <p>No notifications yet.</p>
              </div>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileNav onOpenEditor={() => setIsEditorOpen(true)} />
      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} />
    </div>
  );
}