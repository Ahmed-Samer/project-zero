import { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // جلب الإشعارات الخاصة بالمستخدم الحالي فقط
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(data);
      
      // حساب عدد الإشعارات غير المقروءة
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // دالة لتعليم إشعار واحد كمقروء
  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // دالة لتعليم الكل كمقروء
  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    const unreadNotifications = notifications.filter(n => !n.read);

    unreadNotifications.forEach(n => {
      const notifRef = doc(db, 'notifications', n.id);
      batch.update(notifRef, { read: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}