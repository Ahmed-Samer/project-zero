import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal';
import { getDayNumber, formatDateFull } from '../lib/utils';
// التعديلات هنا: استيراد مباشر من components
import Countdown from '../components/Countdown';
import EntryCard from '../components/EntryCard';
import YearGrid from '../components/YearGrid';
import EditorModal from '../components/EditorModal';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav'; 
import { Loader2, Radio, Layers, Activity, Calendar, User } from 'lucide-react';

const PROJECT_START_DATE = new Date(); 
const TARGET_DATE = new Date('2025-12-31');

export default function Dashboard() {
  const { user } = useAuth();
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal(user);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const handleSave = async (data) => {
    if (data.id) {
      await updateEntry(data.id, data.content, data.date, data.dayNumber, data.quote, data.image);
    } else {
      const now = new Date();
      const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
      await addEntry(data.content, now, currentDayNum, data.quote, data.image);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingEntry(null);
    setIsEditorOpen(true);
  };

  const scrollToDay = (dayNum) => {
    const element = document.getElementById(`day-${dayNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-indigo-500');
      setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500'), 1000);
    }
  };

  const groupedEntries = useMemo(() => {
    return entries.reduce((groups, entry) => {
      const day = entry.dayNumber || 0;
      if (!groups[day]) groups[day] = [];
      groups[day].push(entry);
      return groups;
    }, {});
  }, [entries]);

  const allActiveDayNumbers = useMemo(() => entries.map(e => e.dayNumber), [entries]);
  const uniqueActiveDays = [...new Set(allActiveDayNumbers)].length;
  const sortedDays = Object.keys(groupedEntries).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0 overflow-x-hidden">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center justify-center">
        <span className="font-bold text-lg tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen w-full">
        
        {/* Container Main */}
        <main className="flex-1 max-w-[700px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0 w-full min-w-0">
          
          {/* Dashboard Header Area */}
          <div className="px-4 lg:px-6 py-6 lg:py-8 border-b border-[#1f2937] bg-[#0b0f19] w-full">
            
            {/* Desktop Header Content */}
            <div className="hidden lg:flex flex-row justify-between items-end gap-6 mb-8 w-full">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Radio size={14} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Personal Command</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">My Dashboard</h2>
              </div>
              <div className="hidden md:block">
                 <Countdown targetDate={TARGET_DATE} />
              </div>
            </div>

            {/* Mobile Header Content */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6 w-full">
               <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-indigo-600 to-violet-600 mb-3 shadow-lg shadow-indigo-500/20 shrink-0">
                  {user?.photoURL ? (
                     <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover bg-[#0b0f19]" />
                  ) : (
                     <div className="w-full h-full rounded-full bg-[#1f2937] flex items-center justify-center"><User size={32} className="text-slate-500" /></div>
                  )}
               </div>
               <h2 className="text-2xl font-black text-white mb-1 truncate w-full">{user?.displayName || 'Unknown User'}</h2>
               <div className="flex items-center gap-2 text-indigo-400 mb-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  <Radio size={12} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Active Member</span>
               </div>

               {/* Mobile Stats Row */}
               <div className="flex items-center gap-8 border-t border-b border-[#1f2937] py-3 px-6 w-full justify-center">
                  <div className="text-center">
                     <span className="block text-xl font-black text-white">{entries.length}</span>
                     <span className="text-[10px] text-slate-500 uppercase font-bold">Signals</span>
                  </div>
                  <div className="w-px h-8 bg-[#1f2937]"></div>
                  <div className="text-center">
                     <span className="block text-xl font-black text-white">{uniqueActiveDays}</span>
                     <span className="text-[10px] text-slate-500 uppercase font-bold">Active Days</span>
                  </div>
               </div>
            </div>

            {/* Grids & Desktop Stats */}
            <div className="grid grid-cols-1 gap-6 w-full">
               {/* Year Grid */}
               <div className="bg-transparent lg:bg-[#111827] lg:border border-[#1f2937] rounded-2xl p-0 lg:p-6 overflow-hidden w-full">
                  <YearGrid totalDays={365} activeDays={allActiveDayNumbers} onDayClick={scrollToDay} />
               </div>
               
               {/* Desktop Stats Box */}
               <div className="hidden lg:flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 w-full">
                  <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
                      <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400"><Activity size={24} /></div>
                      <div>
                          <p className="text-xs text-[#64748b] font-bold uppercase">Total Signals</p>
                          <p className="text-2xl font-black text-white">{entries.length}</p>
                      </div>
                  </div>
                  <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
                      <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><Calendar size={24} /></div>
                      <div>
                          <p className="text-xs text-[#64748b] font-bold uppercase">Active Days</p>
                          <p className="text-2xl font-black text-white">{uniqueActiveDays}</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="p-4 lg:p-6 w-full">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : sortedDays.length > 0 ? (
              <div className="space-y-8 w-full">
                {sortedDays.map((dayNum) => {
                  const dayEntries = groupedEntries[dayNum];
                  return (
                    <div key={dayNum} id={`day-${dayNum}`} className="relative group/day w-full">
                      <div className="flex items-end gap-4 mb-4 border-b border-[#1f2937] pb-2">
                        <span className="text-3xl lg:text-4xl font-black text-[#1f2937] group-hover/day:text-indigo-500/20 transition-colors">#{dayNum}</span>
                        <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-1.5">{formatDateFull(dayEntries[0].date)}</span>
                      </div>
                      <div className="grid gap-6 w-full">
                        {dayEntries.map(entry => (
                          <EntryCard 
                            key={entry.id} 
                            entry={entry} 
                            isOwnPost={true} 
                            showAuthor={false} 
                            onEdit={handleEdit} 
                            onDelete={deleteEntry} 
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-[#64748b]">
                <Layers size={40} className="mx-auto mb-4 opacity-50" />
                <p>Start your journey now.</p>
              </div>
            )}
          </div>
        </main>

        <RightSidebar />

      </div>

      <MobileNav onOpenEditor={handleNew} />
      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} initialData={editingEntry} />
    </div>
  );
}