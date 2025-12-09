import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useJournal } from './hooks/useJournal';
import { getDayNumber, formatDateFull } from './lib/utils';
import Countdown from './components/Countdown';
import EntryCard from './components/EntryCard';
import YearGrid from './components/YearGrid';
import LoginModal from './components/LoginModal';
import EditorModal from './components/EditorModal';
import { 
  Loader2, Plus, LogIn, LogOut, Command, Zap, Trophy, Activity, 
  Layers, Briefcase, Brain, Dumbbell, Target 
} from 'lucide-react';

const PROJECT_START_DATE = new Date(); 
const TARGET_DATE = new Date('2026-12-10');

const FILTERS = [
  { id: 'All', label: 'All', icon: Layers },
  { id: 'Business', label: 'Work', icon: Briefcase },
  { id: 'Mindset', label: 'Mind', icon: Brain },
  { id: 'Health', label: 'Body', icon: Dumbbell },
  { id: 'DeepWork', label: 'Focus', icon: Zap },
  { id: 'General', label: 'Misc', icon: Target },
];

// مكون الكارت المضيء (Spotlight) نستخدمه في الواجهة
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
  };
  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`spotlight-card rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default function App() {
  const { user } = useAuth();
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal(user);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSave = async (data) => {
    if (data.id) {
      await updateEntry(data.id, data.content, data.date, data.dayNumber, data.category, data.quote);
    } else {
      const now = new Date();
      const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
      await addEntry(data.content, now, currentDayNum, data.category, data.quote);
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
      element.classList.add('ring-1', 'ring-indigo-500');
      setTimeout(() => element.classList.remove('ring-1', 'ring-indigo-500'), 1500);
    }
  };

  // Logic
  const filteredEntries = useMemo(() => {
    if (activeFilter === 'All') return entries;
    return entries.filter(entry => (entry.category || 'General') === activeFilter);
  }, [entries, activeFilter]);

  const groupedEntries = useMemo(() => {
    return filteredEntries.reduce((groups, entry) => {
      const day = entry.dayNumber || 0;
      if (!groups[day]) groups[day] = [];
      groups[day].push(entry);
      return groups;
    }, {});
  }, [filteredEntries]);

  const allActiveDayNumbers = useMemo(() => {
    const allGroups = entries.reduce((groups, entry) => {
      groups[entry.dayNumber || 0] = true;
      return groups;
    }, {});
    return Object.keys(allGroups).map(Number);
  }, [entries]);

  const sortedDays = Object.keys(groupedEntries).sort((a, b) => b - a);
  const currentStreak = allActiveDayNumbers.length;

  return (
    <div className="min-h-screen font-sans bg-[#030712] relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="fixed inset-0 bg-grid-white bg-[size:50px_50px] pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 bg-noise pointer-events-none z-50"></div>
      
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Command size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Project<span className="text-indigo-500">Zero</span></span>
          </div>

          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className="text-[10px] font-bold text-red-400 hover:text-white transition-colors flex items-center gap-2">
              <LogOut size={12} /> DISCONNECT
            </button>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <LogIn size={12} /> AUTHENTICATE
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
        
        {/* --- BENTO GRID DASHBOARD (Top Section) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          
          {/* 1. Timer Card (Large) */}
          <SpotlightCard className="md:col-span-2 p-8 flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">System Status</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Operational</h2>
              <p className="text-slate-400 max-w-md text-sm">Target locked. Countdown sequence initiated.</p>
            </div>
            <div className="mt-6">
              <Countdown targetDate={TARGET_DATE} />
            </div>
          </SpotlightCard>

          {/* 2. Stats Card (Small - Stacked) */}
          <div className="grid grid-rows-2 gap-4">
             <SpotlightCard className="p-5 flex items-center justify-between">
                <div>
                   <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Streak</p>
                   <p className="text-3xl font-black text-white">{currentStreak}</p>
                </div>
                <Trophy size={24} className="text-yellow-500 opacity-80" />
             </SpotlightCard>
             
             <SpotlightCard className="p-5 flex items-center justify-between">
                <div>
                   <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Logs</p>
                   <p className="text-3xl font-black text-white">{entries.length}</p>
                </div>
                <Layers size={24} className="text-emerald-500 opacity-80" />
             </SpotlightCard>
          </div>

          {/* 3. Map Card (Full Width on Mobile) */}
          <SpotlightCard className="md:col-span-3 p-1">
             <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Activity Heatmap</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             </div>
             <div className="p-4 overflow-x-auto">
               <YearGrid 
                  totalDays={365} 
                  activeDays={allActiveDayNumbers} 
                  onDayClick={scrollToDay} 
                />
             </div>
          </SpotlightCard>
        </div>

        {/* --- FEED SECTION --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
           
           {/* Sidebar Filters */}
           <div className="w-full md:w-48 flex-shrink-0 md:sticky md:top-24">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Filters</h3>
              <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                        ${isActive 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon size={14} />
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {isAdmin && (
                <button 
                  onClick={handleNew}
                  className="mt-6 w-full py-3 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> New Log
                </button>
              )}
           </div>

           {/* Timeline */}
           <div className="flex-1 w-full min-h-[500px]">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
              ) : sortedDays.length > 0 ? (
                <div className="space-y-12">
                  {sortedDays.map((dayNum) => {
                    const dayEntries = groupedEntries[dayNum];
                    return (
                      <div key={dayNum} id={`day-${dayNum}`} className="animate-enter">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="text-4xl font-black text-white/10 select-none">#{dayNum}</div>
                           <div className="h-px bg-white/10 flex-1"></div>
                           <div className="text-xs font-bold text-slate-500 uppercase">{formatDateFull(dayEntries[0].date)}</div>
                        </div>

                        <div className="space-y-6">
                           {dayEntries.map(entry => (
                              <EntryCard 
                                key={entry.id} 
                                entry={entry} 
                                isAdmin={isAdmin}
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
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-500 text-sm">No data found in this sector.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={() => setIsAdmin(true)} />
      <EditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSave} initialData={editingEntry} />
    </div>
  );
}