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

    // --- هنا الحل لمشكلة الاسم المجهول ---
    // لو مفيش اسم، بنشتق اسم من الإيميل
    const fallbackName = user.email ? user.email.split('@')[0] : 'User';
    const finalName = user.displayName || additionalData.name || fallbackName;

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: finalName, // مستحيل يكون فاضي دلوقتي
        email: user.email,
        photoURL: user.photoURL || null,
        bio: '',
        birthDate: null,
        birthDatePrivacy: 'public', 
        followingPrivacy: 'public', 
        experience: [],
        followers: [], 
        following: [], 
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
      
      // ضمان وجود اسم حتى لو المستخدم مدخلش اسم (رغم إن الفورم بتجبره)
      const finalName = name || email.split('@')[0];

      if (finalName) {
        await updateProfile(result.user, { displayName: finalName });
      }
      
      await saveUserToDB(result.user, { name: finalName });
      await sendEmailVerification(result.user);
      
      // نخرجه فوراً عشان ميقدرش يدخل غير لما يفعل
      await signOut(auth);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // التحقق من تفعيل الإيميل
      if (!result.user.emailVerified) {
        await signOut(auth);
        return { success: false, error: "Email not verified yet. Please check your inbox." };
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
      if (data.displayName && data.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      if (data.photoURL && data.photoURL !== auth.currentUser.photoURL) {
        await updateProfile(auth.currentUser, { photoURL: data.photoURL });
      }

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        bio: data.bio,
        photoURL: data.photoURL,
        birthDate: data.birthDate,
        birthDatePrivacy: data.birthDatePrivacy,
        followingPrivacy: data.followingPrivacy,
        experience: data.experience
      });

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