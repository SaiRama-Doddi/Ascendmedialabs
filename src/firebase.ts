import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDf95vU9i3DE1rwazm_9_i4AiBnvhcVVc8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ascendmedialabs-2ccc3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ascendmedialabs-2ccc3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ascendmedialabs-2ccc3.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "637273673767",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:637273673767:web:1b603e6b075b4dd967fe02",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T0X0ZB83DM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
