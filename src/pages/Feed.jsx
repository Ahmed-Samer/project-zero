import React, { useState } from 'react';
import { useCommunity } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal'; 
import { getDayNumber } from '../lib/utils';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar'; 
import EditorModal from '../components/EditorModal'; 
import MobileNav from '../components/MobileNav'; 
import { Link } from 'react-router-dom'; // ضفنا Link
import { Loader2, Sparkles, Send, Mail } from 'lucide-react'; // ضفنا Mail

const PROJECT_START_DATE = new Date();

export default function Feed() {
  const { posts, loading } = useCommunity();
  const { user } = useAuth();
  const { addEntry } = useJournal(user); 
  const [isEditorOpen, setIsEditorOpen] = useState(false); 

  const handleSave = async (data) => {
    const now = new Date();
    const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
    await addEntry(data.content, now, currentDayNum, data.quote, data.image);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0 overflow-x-hidden">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center justify-between">
        <div className="w-8"></div>
        <span className="font-bold text-lg tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
        <Link to="/messages" className="text-slate-400 hover:text-white transition-colors">
          <Mail size={22} />
        </Link>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen w-full">
        
        <main className="flex-1 max-w-[650px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0 w-full min-w-0">
          
          {/* Desktop Header */}
          <div className="hidden lg:flex sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1f2937] px-4 py-4 cursor-pointer justify-between items-center" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div>
              <h2 className="text-xl font-bold text-[#e7e9ea] mb-1">Home</h2>
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                 <Sparkles size={14} /> <span className="font-bold">Latest Signals</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <Send size={18} /> <span>Broadcast</span>
            </button>
          </div>

          <div className="p-4 w-full">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : posts.length > 0 ? (
              <div className="space-y-4 w-full">
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

      <MobileNav onOpenEditor={() => setIsEditorOpen(true)} />
      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} />
    </div>
  );
}