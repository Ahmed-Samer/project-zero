import { useState, useEffect } from 'react';
import { 
  doc, updateDoc, arrayUnion, arrayRemove, 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useInteraction(postId, user) {
  const [rawComments, setRawComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // دالة مساعدة لإنشاء إشعار
  const createNotification = async (recipientId, type, text = '') => {
    if (!user || user.uid === recipientId) return; // متبعتش إشعار لنفسك

    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId,
        senderId: user.uid,
        senderName: user.displayName,
        senderImage: user.photoURL,
        type, // 'like' | 'comment' | 'follow'
        text, // اختياري (محتوى الكومنت)
        postId: postId || null,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

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
        likes: doc.data().likes || []
      }));
      setRawComments(data);
      setLoadingComments(false);
    });
    return () => unsubscribe();
  }, [postId]);

  // --- التعديل: إرسال إشعار عند اللايك ---
  const toggleLike = async (currentLikes = []) => {
    if (!user) return;
    const postRef = doc(db, 'journal_entries', postId);
    const isLiked = currentLikes.includes(user.uid);
    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
        
        // نجيب صاحب البوست عشان نبعتله إشعار
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postOwnerId = postSnap.data().uid;
          createNotification(postOwnerId, 'like');
        }
      }
    } catch (error) { console.error("Error liking post:", error); }
  };

  const toggleCommentLike = async (commentId, currentLikes = []) => {
    if (!user) return;
    const commentRef = doc(db, 'journal_entries', postId, 'comments', commentId);
    const isLiked = currentLikes.includes(user.uid);
    try {
      if (isLiked) await updateDoc(commentRef, { likes: arrayRemove(user.uid) });
      else await updateDoc(commentRef, { likes: arrayUnion(user.uid) });
    } catch (error) { console.error("Error liking comment:", error); }
  };

  // --- التعديل: إرسال إشعار عند الكومنت ---
  const addComment = async (text, parentId = null) => {
    if (!user || !text.trim()) return;
    try {
      await addDoc(collection(db, 'journal_entries', postId, 'comments'), {
        text,
        uid: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorImage: user.photoURL || null,
        parentId,
        likes: [],
        createdAt: serverTimestamp()
      });

      // إشعار لصاحب البوست
      const postRef = doc(db, 'journal_entries', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postOwnerId = postSnap.data().uid;
        createNotification(postOwnerId, 'comment', text);
      }

      return true;
    } catch (error) { console.error("Error adding comment:", error); return false; }
  };

  return { rawComments, loadingComments, toggleLike, toggleCommentLike, addComment };
}