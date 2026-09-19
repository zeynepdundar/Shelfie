import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCY7ZnqQ2Bz5IQQJIhVzyAKYriUghrQ_y8",
  authDomain: "shelfie-7bb6c.firebaseapp.com",
  projectId: "shelfie-7bb6c",
  storageBucket: "shelfie-7bb6c.firebasestorage.app",
  messagingSenderId: "535811303475",
  appId: "1:535811303475:web:7836ac602e863c94ef5b46",
  measurementId: "G-G2095XEX3P"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;