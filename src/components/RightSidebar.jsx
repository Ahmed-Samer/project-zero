import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs, updateDoc, doc, arrayUnion, arrayRemove, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Flame, UserPlus } from 'lucide-react';

const RightSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'users'), where('uid', '!=', user.uid), limit(5));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => doc.data());
        setSuggestedUsers(users);

        const myDoc = await getDoc(doc(db, 'users', user.uid));
        if (myDoc.exists()) {
          setFollowingIds(myDoc.data().following || []);
        }
      } catch (error) { console.error("Error fetching suggestions:", error); }
    };
    fetchUsers();
  }, [user]);

  // --- التعديل: إرسال إشعار عند المتابعة ---
  const handleFollow = async (targetUid) => {
    if (!user) return;
    const myRef = doc(db, 'users', user.uid);
    const targetRef = doc(db, 'users', targetUid); // مرجع للشخص اللي بنتابعه عشان نضيف في الـ followers بتوعه لو حابب
    
    const isFollowing = followingIds.includes(targetUid);

    try {
      if (isFollowing) {
        // Unfollow
        await updateDoc(myRef, { following: arrayRemove(targetUid) });
        // (اختياري) تشيل نفسك من عنده
        await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
        
        setFollowingIds(prev => prev.filter(id => id !== targetUid));
      } else {
        // Follow
        await updateDoc(myRef, { following: arrayUnion(targetUid) });
        // (اختياري) تضيف نفسك عنده
        await updateDoc(targetRef, { followers: arrayUnion(user.uid) });
        
        setFollowingIds(prev => [...prev, targetUid]);

        // إرسال إشعار
        await addDoc(collection(db, 'notifications'), {
          recipientId: targetUid,
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

  return (
    <aside className="hidden lg:block w-80 sticky top-0 h-screen border-l border-[#1f2937] bg-[#0b0f19] p-6 overflow-y-auto">
      
      {/* Trending Topics */}
      <div className="modern-card rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Flame className="text-orange-500" size={18} /> Trending Now
        </h3>
        <div className="space-y-4">
          {['#ProjectZero', '#BuildInPublic', '#DevLife', '#Growth'].map((tag, i) => (
            <div key={i} className="flex justify-between items-center cursor-pointer group">
              <div>
                <p className="text-sm font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">{tag}</p>
                <p className="text-xs text-slate-600">2.1k Posts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="modern-card rounded-2xl p-4">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <UserPlus className="text-indigo-500" size={18} /> Who to follow
        </h3>
        
        <div className="space-y-4">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((u) => {
              const isFollowing = followingIds.includes(u.uid);
              return (
                <div key={u.uid} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${u.uid}`)}>
                    <img 
                      src={u.photoURL || 'https://via.placeholder.com/40'} 
                      alt={u.displayName} 
                      className="w-10 h-10 rounded-full bg-slate-800 object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate hover:underline">{u.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">@{u.displayName?.replace(/\s/g, '').toLowerCase()}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleFollow(u.uid)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${isFollowing 
                        ? 'bg-transparent border border-slate-600 text-slate-400 hover:border-red-500 hover:text-red-500' 
                        : 'bg-white text-black hover:bg-indigo-50'
                      }
                    `}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-600 text-center">No new users found.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[10px] text-slate-600 text-center">
        &copy; 2025 Project Zero Inc. <br/> Designed for the future.
      </div>
    </aside>
  );
};

export default RightSidebar;