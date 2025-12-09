import { useState, useEffect } from 'react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp 
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
    const q = query(collection(db, 'journal_entries'), orderBy('date', 'desc'));
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

  // تعديل: إضافة quote
  const addEntry = async (content, date, dayNumber, category, quote) => {
    try {
      await addDoc(collection(db, 'journal_entries'), {
        content,
        date: parseDate(date),
        dayNumber: parseInt(dayNumber),
        category,
        quote: quote || null, // الحقل الجديد
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Error saving: " + error.message);
      return false;
    }
  };

  // تعديل: إضافة quote
  const updateEntry = async (id, content, date, dayNumber, category, quote) => {
    try {
      const entryRef = doc(db, 'journal_entries', id);
      await updateDoc(entryRef, {
        content,
        date: parseDate(date),
        dayNumber: parseInt(dayNumber),
        category,
        quote: quote || null, // تحديث الحقل
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Error updating: " + error.message);
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