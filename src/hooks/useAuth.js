import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // استيراد أدوات الداتا بيز
import { auth, googleProvider, db } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- حفظ بيانات المستخدم عند الدخول ---
  const saveUserToDB = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // لو المستخدم جديد (مش متسجل قبل كدا)، نسجله
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        followers: [], // مصفوفة المتابعين
        following: [], // مصفوفة اللي بيتابعهم
        createdAt: serverTimestamp()
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // بعد الدخول الناجح، نحفظ بياناته
      await saveUserToDB(result.user);
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  const updateName = async (newName) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      
      // نحدث الاسم في الداتا بيز كمان
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { displayName: newName }, { merge: true });
      
      setUser({ ...auth.currentUser, displayName: newName });
      return true;
    } catch (error) {
      console.error("Update Name Failed:", error);
      return false;
    }
  };

  return { user, loading, loginWithGoogle, logout, updateName };
}