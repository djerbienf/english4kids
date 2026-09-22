import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdCuixdijM0YNDwEmQoJOuGVyRHPzvN4M",
  authDomain: "english4kids-ad606.firebaseapp.com",
  projectId: "english4kids-ad606",
  storageBucket: "english4kids-ad606.firebasestorage.app",
  messagingSenderId: "260427422107",
  appId: "1:260427422107:web:db436bb3347b0f1303293e",
  measurementId: "G-ZSMPW2C7HV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
