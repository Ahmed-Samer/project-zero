import React, { useState } from 'react';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal'; // عشان نستخدم دالة الحفظ
import { getDayNumber } from '../lib/utils';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar'; 
import EditorModal from '../components/EditorModal'; // المودال للنشر
import { Loader2, Sparkles, Menu, Send } from 'lucide-react';

const PROJECT_START_DATE = new Date();

export default function Feed() {
  const { posts, loading } = useCommunity();
  const { user } = useAuth();
  const { addEntry } = useJournal(user); // استدعاء دالة النشر
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false); // حالة المودال

  // دالة الحفظ من الـ Feed
  const handleSave = async (data) => {
    const now = new Date();
    const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
    await addEntry(data.content, now, currentDayNum, data.quote);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans">
      
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-50 px-4 h-16 flex items-center justify-between">
        <span className="font-black text-xl tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#e7e9ea]"><Menu size={24} /></button>
      </div>

      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="lg:ml-64 flex justify-center min-h-screen">
        
        <main className="flex-1 max-w-[650px] border-r border-[#1f2937] min-h-screen pt-16 lg:pt-0">
          
          <div className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1f2937] px-4 py-4 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#e7e9ea] mb-1">Home</h2>
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                   <Sparkles size={14} /> <span className="font-bold">Latest Signals</span>
                </div>
              </div>
              
              {/* زرار النشر السريع في الـ Feed */}
              <button 
                onClick={() => setIsEditorOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2 lg:px-4 lg:py-2 lg:rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <Send size={18} /> <span className="hidden lg:inline">Broadcast</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <EntryCard 
                    key={post.id} 
                    entry={post} 
                    isOwnPost={user && user.uid === post.uid} 
                    isAdmin={user && user.uid === post.uid} 
                    showAuthor={true} 
                    onEdit={() => {}} onDelete={() => {}} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-[#64748b]">
                <p>Welcome to Project Zero. Broadcast your first signal.</p>
              </div>
            )}
          </div>
        </main>

        <RightSidebar />
        
      </div>

      {/* مودال النشر */}
      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} />
    </div>
  );
}