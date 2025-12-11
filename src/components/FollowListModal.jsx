import React, { useState, useEffect } from 'react';
import { X, UserMinus, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const FollowListModal = ({ isOpen, onClose, userIds, title, currentUserId, onUnfollow }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !userIds || userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const usersData = await Promise.all(
          userIds.map(async (uid) => {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? { uid, ...docSnap.data() } : null;
          })
        );
        setUsers(usersData.filter(u => u !== null));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b0f19] border border-[#1f2937] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="p-4 border-b border-[#1f2937] flex justify-between items-center bg-[#111827]">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : users.length > 0 ? (
            users.map((u) => (
              <div key={u.uid} className="flex items-center justify-between p-2 hover:bg-[#1f2937] rounded-lg transition-colors group">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => { navigate(`/profile/${u.uid}`); onClose(); }}
                >
                  <img 
                    src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=random`} 
                    alt={u.displayName} 
                    className="w-10 h-10 rounded-full object-cover bg-slate-800"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{u.displayName}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{u.bio || 'No bio'}</p>
                  </div>
                </div>

                {/* زرار إلغاء المتابعة يظهر فقط لو القائمة دي هي Following بتاعتي أنا */}
                {onUnfollow && title === 'Following' && (
                  <button 
                    onClick={() => onUnfollow(u.uid)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Unfollow"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <User size={32} className="mb-2 opacity-50" />
              <p className="text-sm">List is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;