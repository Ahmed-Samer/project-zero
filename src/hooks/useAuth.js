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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      
      await saveUserToDB(result.user, { name });
      await sendEmailVerification(result.user);
      await signOut(auth);
      
      return { success: true };
    } catch (error) {
      console.error("Signup Failed:", error);
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Email is already registered.';
      if (error.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (!result.user.emailVerified) {
        await signOut(auth);
        return { 
          success: false, 
          error: "Email not verified yet. Please check your inbox and click the link." 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Email Login Failed:", error);
      let errorMessage = "Invalid email or password.";
      if (error.code === 'auth/user-not-found') errorMessage = "No account found with this email.";
      if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      if (error.code === 'auth/too-many-requests') errorMessage = "Too many failed attempts. Try again later.";
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  // --- دالة تحديث البروفايل الجديدة ---
  const updateUserProfile = async (uid, data) => {
    if (!auth.currentUser || auth.currentUser.uid !== uid) return false;

    try {
      // 1. تحديث الاسم في الـ Auth لو اتغير
      if (data.displayName && data.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }

      // 2. تحديث باقي البيانات في Firestore (الاسم، البايو، الوظائف)
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        bio: data.bio,
        experience: data.experience
      });

      // 3. تحديث الـ State المحلي عشان التغيير يظهر فوراً
      setUser(prev => ({ ...prev, displayName: data.displayName }));
      
      return true;
    } catch (error) {
      console.error("Update Profile Failed:", error);
      return false;
    }
  };

  return { 
    user, 
    loading, 
    loginWithGoogle, 
    loginWithApple, 
    signupWithEmail, 
    loginWithEmail, 
    logout,
    updateUserProfile // صدرنا الدالة الجديدة
  };
}