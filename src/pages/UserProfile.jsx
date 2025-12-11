import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal';
import { formatDateFull, getDayNumber } from '../lib/utils';
import EntryCard from '../components/EntryCard';
import YearGrid from '../components/YearGrid'; // تم التصحيح: شيلنا ui/
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import EditorModal from '../components/EditorModal';
import FollowListModal from '../components/FollowListModal';
import { Loader2, Layers, User, Activity, Calendar, Settings, Briefcase, Mail, UserPlus, UserCheck, MapPin, Users, Lock, Gift } from 'lucide-react';

const PROJECT_START_DATE = new Date();

export default function UserProfile() {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  
  const { addEntry } = useJournal(user);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isMyProfile = user && user.uid === uid;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setProfileData(data);
          if (user && data.followers && data.followers.includes(user.uid)) {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        } else {
          setProfileData({ displayName: 'Unknown User' });
        }

        const q = query(
          collection(db, 'journal_entries'),
          where('uid', '==', uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(postsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (uid) fetchData();
  }, [uid, user]);

  const handleFollow = async () => {
    if (!user) return;
    const targetRef = doc(db, 'users', uid);
    const myRef = doc(db, 'users', user.uid);

    try {
      if (isFollowing) {
        await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
        await updateDoc(myRef, { following: arrayRemove(uid) });
        setIsFollowing(false);
        setProfileData(prev => ({ ...prev, followers: prev.followers ? prev.followers.filter(id => id !== user.uid) : [] }));
      } else {
        await updateDoc(targetRef, { followers: arrayUnion(user.uid) });
        await updateDoc(myRef, { following: arrayUnion(uid) });
        setIsFollowing(true);
        setProfileData(prev => ({ ...prev, followers: [...(prev.followers || []), user.uid] }));

        await addDoc(collection(db, 'notifications'), {
          recipientId: uid,
          senderId: user.uid,
          senderName: user.displayName,
          senderImage: user.photoURL,
          type: 'follow',
          read: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) { console.error("Follow error:", error); }
  };

  const handleUnfollowFromModal = async (targetUid) => {
    if (!isMyProfile) return;
    const myRef = doc(db, 'users', user.uid);
    const targetRef = doc(db, 'users', targetUid);
    try {
      await updateDoc(myRef, { following: arrayRemove(targetUid) });
      await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
      setProfileData(prev => ({ ...prev, following: prev.following.filter(id => id !== targetUid) }));
    } catch (error) { console.error("Unfollow error:", error); }
  };

  const openFollowList = (type) => {
    if (!canViewPrivate(type === 'followers' ? 'public' : profileData?.followingPrivacy)) return;
    setFollowModalType(type);
    setFollowModalOpen(true);
  };

  const handleMessage = () => {
    navigate(`/messages?target=${uid}`);
  };

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

  const getProfileImage = (url) => {
    return url && url.startsWith('http') ? url : `https://ui-avatars.com/api/?name=${profileData?.displayName || 'User'}&background=random`;
  };

  const canViewPrivate = (privacySetting) => {
    if (isMyProfile) return true;
    if (privacySetting === 'public') return true;
    if (privacySetting === 'followers' && isFollowing) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0 overflow-x-hidden">
      
      {/* Mobile Top Header - Updated with Messages Icon */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center justify-between">
        <div className="w-8"></div> {/* Spacer for centering */}
        <span className="font-bold text-lg tracking-tight">PROJECT <span className="text-indigo-500">ZERO</span></span>
        <Link to="/messages" className="text-slate-400 hover:text-white transition-colors relative">
          <Mail size={22} />
          {/* ممكن هنا نضيف نقطة حمراء لو فيه رسايل جديدة مستقبلاً */}
        </Link>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen w-full">
        <main className="flex-1 max-w-[700px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0 w-full min-w-0">
          
          <div className="px-4 lg:px-6 py-6 lg:py-8 border-b border-[#1f2937] bg-[#0b0f19]/95 sticky top-14 lg:top-0 z-30 backdrop-blur-sm w-full">
            
            <div className="flex flex-col items-center md:items-start md:flex-row gap-6 mb-6 w-full relative">
               
               {/* Actions Buttons */}
               <div className="absolute top-0 right-0 flex gap-2">
                 {isMyProfile ? (
                   <Link 
                     to="/settings"
                     className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-full border border-[#333] text-xs font-bold text-white transition-colors flex items-center gap-2"
                   >
                     <Settings size={14} /> Edit Profile
                   </Link>
                 ) : (
                   <>
                     <button onClick={handleMessage} className="p-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-full border border-[#333] text-indigo-400 transition-colors">
                       <Mail size={18} />
                     </button>
                     <button 
                       onClick={handleFollow}
                       className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${isFollowing ? 'bg-transparent border border-[#333] text-white hover:border-red-500 hover:text-red-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                     >
                       {isFollowing ? 'Unfollow' : 'Follow'}
                     </button>
                   </>
                 )}
               </div>

               {/* Profile Image */}
               <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/20 shrink-0">
                  <img 
                    src={getProfileImage(profileData?.photoURL)} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover bg-[#0b0f19]"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${profileData?.displayName || 'User'}`; }} 
                  />
               </div>
               
               <div className="text-center md:text-left flex-1 min-w-0 w-full mt-2 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-1 truncate">{profileData?.displayName || 'Unknown User'}</h1>
                  
                  {/* Followers / Following Counts */}
                  <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-slate-400 mb-3 font-medium">
                    <button onClick={() => openFollowList('followers')} className="flex gap-1 hover:text-white transition-colors">
                      <strong className="text-white">{profileData?.followers?.length || 0}</strong> Followers
                    </button>
                    
                    {canViewPrivate(profileData?.followingPrivacy) ? (
                      <button onClick={() => openFollowList('following')} className="flex gap-1 hover:text-white transition-colors">
                        <strong className="text-white">{profileData?.following?.length || 0}</strong> Following
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-600 cursor-not-allowed">
                        <Lock size={12} /> Following
                      </div>
                    )}
                  </div>

                  {profileData?.bio && (
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed max-w-lg mx-auto md:mx-0 whitespace-pre-wrap">
                      {profileData.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-xs text-slate-500">
                    {canViewPrivate(profileData?.birthDatePrivacy) && profileData?.birthDate && (
                      <div className="flex items-center gap-1">
                        <Gift size={12} className="text-pink-500" />
                        <span>{profileData.birthDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
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

            {profileData?.experience && profileData.experience.length > 0 && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Briefcase size={14} /> Mission Log (Experience)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profileData.experience.map((job, idx) => (
                    <div key={idx} className="bg-[#111827]/50 border border-[#1f2937] p-3 rounded-xl flex flex-col hover:border-indigo-500/30 transition-colors">
                      <span className="text-sm font-bold text-white">{job.title}</span>
                      <span className="text-xs text-indigo-400 font-medium">{job.company}</span>
                      <span className="text-[10px] text-slate-600 mt-1 uppercase tracking-wide">{job.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 lg:p-6 overflow-hidden w-full">
               <YearGrid totalDays={365} activeDays={allActiveDayNumbers} onDayClick={scrollToDay} />
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
      
      <FollowListModal 
        isOpen={followModalOpen} 
        onClose={() => setFollowModalOpen(false)}
        userIds={followModalType === 'followers' ? profileData?.followers : profileData?.following}
        title={followModalType === 'followers' ? 'Followers' : 'Following'}
        currentUserId={user?.uid}
        onUnfollow={isMyProfile && followModalType === 'following' ? handleUnfollowFromModal : null}
      />
    </div>
  );
}