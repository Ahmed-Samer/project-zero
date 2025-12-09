import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. أول ما الموقع يفتح، بنحاول نسجل دخول "مجهول"
    // ده بيسمحلك تتعامل مع قاعدة البيانات بالأذونات اللي فتحناها
    const signIn = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };

    signIn();

    // 2. بنراقب حالة المستخدم (هل دخل ولا لسه؟)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // تنضيف الذاكرة لما تقفل الصفحة
    return () => unsubscribe();
  }, []);

  return { user, loading };
}