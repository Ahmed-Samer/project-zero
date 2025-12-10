import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // ضفنا GoogleAuthProvider
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      // حط مفاتيحك هنا لو مش موجودة
   apiKey: "AIzaSyBrtAzyHVAvflkGIieb31v7Y37PCwRHl3A",
  authDomain: "my-journal-8c6c0.firebaseapp.com",
  projectId: "my-journal-8c6c0",
  storageBucket: "my-journal-8c6c0.firebasestorage.app",
  messagingSenderId: "563598609508",
  appId: "1:563598609508:web:6a460756899f2190f8a371",
  measurementId: "G-E82SCZZGEF"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider(); // جهزنا جوجل

export { auth, db, googleProvider };