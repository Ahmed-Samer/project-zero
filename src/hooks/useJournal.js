import { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useJournal(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'journal_entries'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching entries:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const parseDate = (dateInput) => {
    if (!dateInput) return new Date();
    if (dateInput.toDate) return dateInput.toDate();
    return new Date(dateInput);
  };

  // شيلنا الـ category من المدخلات
  const addEntry = async (content, date, dayNumber, quote) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'journal_entries'), {
        content,
        date: parseDate(date),
        dayNumber: parseInt(dayNumber),
        category: 'Post', // قيمة ثابتة عشان لو حبينا نرجعها بعدين
        quote: quote || null,
        uid: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorImage: user.photoURL || null,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Error saving: " + error.message);
      return false;
    }
  };

  const updateEntry = async (id, content, date, dayNumber, quote) => {
    try {
      const entryRef = doc(db, 'journal_entries', id);
      await updateDoc(entryRef, {
        content,
        date: parseDate(date),
        dayNumber: parseInt(dayNumber),
        quote: quote || null,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating entry:", error);
      return false;
    }
  };

  const deleteEntry = async (id) => {
    if(!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'journal_entries', id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry };
}