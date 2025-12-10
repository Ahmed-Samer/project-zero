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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
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

  // --- دالة التسجيل (التعديل هنا) ---
  const signupWithEmail = async (email, password, name) => {
    try {
      // 1. إنشاء الحساب
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. تحديث الاسم
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      
      // 3. حفظ في الداتا بيز
      await saveUserToDB(result.user, { name });

      // 4. إرسال الإيميل (مهم جداً السطر ده)
      await sendEmailVerification(result.user);

      // 5. خروج فوري عشان ميدخلش الداشبورد
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

  // --- دالة الدخول ---
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // لو الإيميل مش مفعل، اطرده ورجع خطأ
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

  const updateName = async (newName) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { displayName: newName }, { merge: true });
      setUser({ ...auth.currentUser, displayName: newName });
      return true;
    } catch (error) {
      console.error("Update Name Failed:", error);
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
    updateName 
  };
}

