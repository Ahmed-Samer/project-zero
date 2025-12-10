import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth'; // عشان نعرف مين اللي فاتح
import { useJournal } from '../hooks/useJournal'; // عشان دالة النشر
import { formatDateFull, getDayNumber } from '../lib/utils';
import EntryCard from '../components/EntryCard';
import YearGrid from '../components/YearGrid';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav'; // استيراد الشريط السفلي
import EditorModal from '../components/EditorModal'; // استيراد المودال
import { Loader2, Layers, User, Activity, Calendar } from 'lucide-react';

const PROJECT_START_DATE = new Date();

export default function UserProfile() {
  const { uid } = useParams();
  const { user } = useAuth(); // المستخدم الحالي (اللي فاتح الموقع)
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  // States للنشر
  const { addEntry } = useJournal(user);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const q = query(
          collection(db, 'journal_entries'),
          where('uid', '==', uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(data);
        
        if (data.length > 0) {
          setProfileData({
            name: data[0].authorName,
            image: data[0].authorImage
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (uid) fetchUserData();
  }, [uid]);

  const handleSave = async (data) => {
    const now = new Date();
    const currentDayNum = getDayNumber(PROJECT_START_DATE, now);
    await addEntry(data.content, now, currentDayNum, data.quote, data.image);
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
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center justify-center">
        <span className="font-bold text-lg tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen">
        
        <main className="flex-1 max-w-[700px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0">
          
          {/* Profile Header Area */}
          <div className="px-4 lg:px-6 py-6 lg:py-8 border-b border-[#1f2937] bg-[#0b0f19]/95 sticky top-14 lg:top-0 z-30 backdrop-blur-sm">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
               {/* Profile Image */}
               <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/20">
                  {profileData?.image ? (
                     <img src={profileData.image} alt="Profile" className="w-full h-full rounded-full object-cover bg-[#0b0f19]" />
                  ) : (
                     <div className="w-full h-full rounded-full bg-[#1f2937] flex items-center justify-center"><User size={40} className="text-slate-500" /></div>
                  )}
               </div>
               
               {/* Name & Stats */}
               <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-black text-white mb-2">{profileData?.name || 'User'}</h1>
                  <p className="text-[#64748b] text-xs uppercase tracking-widest font-bold mb-4">Project Zero Member</p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-6">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] rounded-lg border border-[#1f2937]">
                        <Activity size={16} className="text-green-500" />
                        <span className="text-white font-bold">{entries.length}</span>
                        <span className="text-xs text-[#94a3b8]">Signals</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] rounded-lg border border-[#1f2937]">
                        <Calendar size={16} className="text-indigo-500" />
                        <span className="text-white font-bold">{allActiveDayNumbers.length}</span>
                        <span className="text-xs text-[#94a3b8]">Active Days</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* The Grid */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 lg:p-6 overflow-hidden">
               <YearGrid totalDays={365} activeDays={allActiveDayNumbers} onDayClick={scrollToDay} />
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="p-4 lg:p-6">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : sortedDays.length > 0 ? (
              <div className="space-y-8">
                {sortedDays.map((dayNum) => {
                  const dayEntries = groupedEntries[dayNum];
                  return (
                    <div key={dayNum} id={`day-${dayNum}`} className="relative group/day">
                      <div className="flex items-end gap-4 mb-4 border-b border-[#1f2937] pb-2">
                        <span className="text-3xl lg:text-4xl font-black text-[#1f2937] group-hover/day:text-indigo-500/20 transition-colors">#{dayNum}</span>
                        <span className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-1.5">{formatDateFull(dayEntries[0].date)}</span>
                      </div>
                      <div className="grid gap-6">
                        {dayEntries.map(entry => (
                          <EntryCard 
                            key={entry.id} 
                            entry={entry} 
                            isAdmin={false} 
                            showAuthor={false} 
                            onEdit={() => {}} 
                            onDelete={() => {}} 
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
                <p>No signals shared yet.</p>
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