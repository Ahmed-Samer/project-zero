import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Search, User, Loader2, ChevronRight } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // تنفيذ البحث لما الكتابة تتغير
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // ملحوظة: بما إننا معندناش جدول مستخدمين منفصل، هنبحث في البوستات عشان نلاقي المؤلفين
        // في التطبيق الحقيقي يفضل يكون فيه Users Collection
        const q = query(
          collection(db, 'journal_entries'),
          where('authorName', '>=', searchTerm),
          where('authorName', '<=', searchTerm + '\uf8ff'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        
        // استخراج المستخدمين الفريدين (عشان الاسم ميتكررش لو عنده كذا بوست)
        const uniqueUsers = [];
        const seenUids = new Set();

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!seenUids.has(data.uid)) {
            seenUids.add(data.uid);
            uniqueUsers.push({
              uid: data.uid,
              name: data.authorName,
              image: data.authorImage
            });
          }
        });

        setResults(uniqueUsers.slice(0, 5)); // نعرض أول 5 فقط
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 500); // Debounce (نستنى نص ثانية بعد الكتابة)
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* خلفية معتمة */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* صندوق البحث */}
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* الهيدر والإنبوت */}
        <div className="flex items-center px-4 py-4 border-b border-[#222]">
          <Search className="text-slate-500 mr-3" size={20} />
          <input 
            type="text" 
            placeholder="Search for creators..." 
            className="flex-1 bg-transparent text-white outline-none text-lg placeholder:text-slate-600"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-[#222] rounded text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* النتائج */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-blue-500"><Loader2 className="animate-spin mx-auto" /></div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">People</p>
              {results.map(user => (
                <button
                  key={user.uid}
                  onClick={() => { navigate(`/profile/${user.uid}`); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#151515] rounded-xl transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-900/20 overflow-hidden">
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{user.name}</h4>
                    <span className="text-xs text-slate-500">View Profile</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
              
              {/* زرار عرض المزيد */}
              <button className="w-full py-3 mt-2 text-xs font-bold text-blue-500 hover:text-white hover:bg-blue-500/10 rounded-lg transition-colors border border-dashed border-blue-500/30">
                See all results for "{searchTerm}"
              </button>
            </div>
          ) : searchTerm.length > 1 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No explorers found.</p>
            </div>
          ) : (
            <div className="py-12 text-center opacity-30">
              <User size={40} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Type to search the network...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;