import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal';
import { getDayNumber, formatDateFull } from '../lib/utils';
import Countdown from '../components/Countdown';
import EntryCard from '../components/EntryCard';
import YearGrid from '../components/YearGrid';
import EditorModal from '../components/EditorModal';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { Loader2, Plus, Radio, Layers, Menu, Activity, Send } from 'lucide-react';

const PROJECT_START_DATE = new Date(); 
const TARGET_DATE = new Date('2025-12-31');

export default function Dashboard() {
  const { user } = useAuth();
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal(user);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSave = async (data) => {
    if (data.id) {
      await updateEntry(data.id, data.content, data.date, data.dayNumber, data.quote);
    } else {
      const now = new Date();
      const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
      await addEntry(data.content, now, currentDayNum, data.quote);
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
  const sortedDays = Object.keys(groupedEntries).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-50 px-4 h-16 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#e7e9ea]"><Menu size={24} /></button>
      </div>

      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="lg:ml-64 flex justify-center min-h-screen">
        
        <main className="flex-1 max-w-[700px] border-r border-[#1f2937] min-h-screen pt-16 lg:pt-0">
          
          {/* Dashboard Header (Removed sticky to fix scrolling issue) */}
          <div className="px-6 py-8 border-b border-[#1f2937] bg-[#0b0f19]">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Radio size={14} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Personal Command</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">My Dashboard</h2>
              </div>
              
              <div className="flex items-center gap-4">
                 {/* New Name: "New Signal" */}
                 <button onClick={handleNew} className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm">
                    <Send size={16} /> New Signal
                 </button>
                 <div className="hidden md:block">
                    <Countdown targetDate={TARGET_DATE} />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
                  <YearGrid totalDays={365} activeDays={allActiveDayNumbers} onDayClick={scrollToDay} />
               </div>
               
               <div className="flex gap-4 overflow-x-auto pb-2">
                  <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
                      <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400"><Activity size={24} /></div>
                      <div>
                          <p className="text-xs text-[#64748b] font-bold uppercase">Total Signals</p>
                          <p className="text-2xl font-black text-white">{entries.length}</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : sortedDays.length > 0 ? (
              <div className="space-y-8">
                {sortedDays.map((dayNum) => {
                  const dayEntries = groupedEntries[dayNum];
                  return (
                    <div key={dayNum} id={`day-${dayNum}`} className="relative group/day">
                      <div className="flex items-end gap-4 mb-4 border-b border-[#1f2937] pb-2">
                        <span className="text-4xl font-black text-[#1f2937] group-hover/day:text-indigo-500/20 transition-colors">#{dayNum}</span>
                        <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-1.5">{formatDateFull(dayEntries[0].date)}</span>
                      </div>
                      <div className="grid gap-6">
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

      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} initialData={editingEntry} />
    </div>
  );
}