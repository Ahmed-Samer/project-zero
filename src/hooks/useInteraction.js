import { useState, useEffect, useMemo } from 'react';
import { 
  doc, updateDoc, arrayUnion, arrayRemove, 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useInteraction(postId, user) {
  const [rawComments, setRawComments] = useState([]); // كل الكومنتات سايحة على بعض
  const [loadingComments, setLoadingComments] = useState(true);

  // 1. جلب كل التعليقات (الرئيسية والردود)
  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'journal_entries', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        likes: doc.data().likes || [] // ضمان وجود مصفوفة اللايكات
      }));
      setRawComments(data);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [postId]);

  // 2. عمل لايك للبوست نفسه
  const toggleLike = async (currentLikes = []) => {
    if (!user) return;
    const postRef = doc(db, 'journal_entries', postId);
    const isLiked = currentLikes.includes(user.uid);
    try {
      if (isLiked) await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      else await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    } catch (error) { console.error("Error liking post:", error); }
  };

  // 3. عمل لايك لتعليق معين
  const toggleCommentLike = async (commentId, currentLikes = []) => {
    if (!user) return;
    const commentRef = doc(db, 'journal_entries', postId, 'comments', commentId);
    const isLiked = currentLikes.includes(user.uid);
    try {
      if (isLiked) await updateDoc(commentRef, { likes: arrayRemove(user.uid) });
      else await updateDoc(commentRef, { likes: arrayUnion(user.uid) });
    } catch (error) { console.error("Error liking comment:", error); }
  };

  // 4. إضافة تعليق أو رد (يقبل parentId)
  const addComment = async (text, parentId = null) => {
    if (!user || !text.trim()) return;
    try {
      await addDoc(collection(db, 'journal_entries', postId, 'comments'), {
        text,
        uid: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorImage: user.photoURL || null,
        parentId, // لو null يبقى تعليق رئيسي، لو فيه ID يبقى رد
        likes: [],
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) { console.error("Error adding comment:", error); return false; }
  };

  return { rawComments, loadingComments, toggleLike, toggleCommentLike, addComment };
}