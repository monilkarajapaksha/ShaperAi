
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAHTrO0pWx23Za3MMhSSWuW-1nqy_T62UI",
  authDomain: "shaperai-f3fe2.firebaseapp.com",
  projectId: "shaperai-f3fe2",
  storageBucket: "shaperai-f3fe2.firebasestorage.app",
  messagingSenderId: "305031633295",
  appId: "1:305031633295:web:7ded47ef405e212d9c13fa",
  measurementId: "G-BHLB1Q9TE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
