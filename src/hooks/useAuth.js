import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; 
import { auth, googleProvider, appleProvider, db } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // نجيب بيانات اليوزر الإضافية من الداتا بيز عشان تكون متاحة في التطبيق كله
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveUserToDB = async (user, additionalData = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || additionalData.name || 'User',
        email: user.email,
        photoURL: user.photoURL || null,
        bio: '',
        birthDate: null,
        birthDatePrivacy: 'public', // public, followers, private
        followingPrivacy: 'public', // public, followers, private
        experience: [],
        followers: [], // مصفوفة فيها أيديهات الناس اللي متابعاني
        following: [], // مصفوفة فيها أيديهات الناس اللي أنا متابعهم
        createdAt: serverTimestamp()
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToDB(result.user);
      return { success: true };
    } catch (error) {
      console.error("Google Login Failed:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      await saveUserToDB(result.user);
      return { success: true };
    } catch (error) {
      console.error("Apple Login Failed:", error);
      return { success: false, error: error.message };
    }
  };

  const signupWithEmail = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
      await saveUserToDB(result.user, { name });
      await sendEmailVerification(result.user);
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        await signOut(auth);
        return { success: false, error: "Email not verified yet." };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (error) { console.error(error); }
  };

  const updateUserProfile = async (uid, data) => {
    if (!auth.currentUser || auth.currentUser.uid !== uid) return false;

    try {
      // تحديث البيانات الأساسية في Auth لو اتغيرت
      if (data.displayName && data.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      if (data.photoURL && data.photoURL !== auth.currentUser.photoURL) {
        await updateProfile(auth.currentUser, { photoURL: data.photoURL });
      }

      // تحديث Firestore
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        bio: data.bio,
        photoURL: data.photoURL, // تحديث الصورة
        birthDate: data.birthDate, // تاريخ الميلاد
        birthDatePrivacy: data.birthDatePrivacy, // خصوصية التاريخ
        followingPrivacy: data.followingPrivacy, // خصوصية المتابعة
        experience: data.experience
      });

      // تحديث الـ Local State
      setUser(prev => ({ ...prev, ...data }));
      return true;
    } catch (error) {
      console.error("Update Profile Failed:", error);
      return false;
    }
  };

  return { 
    user, loading, loginWithGoogle, loginWithApple, signupWithEmail, loginWithEmail, logout, updateUserProfile 
  };
}