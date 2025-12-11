import { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useChat(user, targetUserId) {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]); // قائمة المحادثات
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);

  // 1. جلب قائمة المحادثات (Sidebar)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherUserId = data.participants.find(id => id !== user.uid);
        // نجيب بيانات الشخص التاني
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        return { 
          id: docSnap.id, 
          ...data, 
          otherUser: userDoc.exists() ? userDoc.data() : { displayName: 'User' } 
        };
      }));
      setChats(chatsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. جلب رسائل محادثة معينة
  useEffect(() => {
    if (!user || !targetUserId) return;

    // ندور على الشات الموجود أو نحدد إن مفيش
    const findChat = async () => {
      // بما إن كويري firestore مع array-contains مقيد، هنفلتر في الفرونت مؤقتاً أو نعتمد على chatId لو معانا
      // للتبسيط: هنفترض إننا بنجيب الشات بالـ ID لو موجود في الـ chats state
      const existingChat = chats.find(c => c.participants.includes(targetUserId));
      
      if (existingChat) {
        setChatId(existingChat.id);
        const msgsQuery = query(
          collection(db, 'chats', existingChat.id, 'messages'),
          orderBy('createdAt', 'asc')
        );
        const unsubMsgs = onSnapshot(msgsQuery, (snapshot) => {
          setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubMsgs;
      } else {
        setMessages([]);
        setChatId(null);
      }
    };

    findChat();
  }, [user, targetUserId, chats]);

  // 3. إرسال رسالة
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    let currentChatId = chatId;

    // لو مفيش شات، نكريت واحد جديد
    if (!currentChatId) {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, targetUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: text
      });
      currentChatId = newChatRef.id;
      setChatId(currentChatId);
    }

    // إضافة الرسالة
    await addDoc(collection(db, 'chats', currentChatId, 'messages'), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      read: false
    });

    // تحديث آخر رسالة في الشات الرئيسي
    await updateDoc(doc(db, 'chats', currentChatId), {
      lastMessage: text,
      updatedAt: serverTimestamp()
    });
  };

  return { chats, messages, sendMessage, loading };
}