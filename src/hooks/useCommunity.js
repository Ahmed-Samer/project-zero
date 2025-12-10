import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // هنا بنجيب كل البوستات من كل الناس، مترتبة بالأحدث
    const q = query(
      collection(db, 'journal_entries'),
      orderBy('date', 'desc'),
      limit(50) // بنجيب آخر 50 بوست مبدئياً عشان الموقع ميهنجش
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching community feed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { posts, loading };
}