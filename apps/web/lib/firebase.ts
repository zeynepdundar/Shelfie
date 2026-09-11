import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKTECLKdAgXJJcN9EWX1T7-XyOJQgaJGM",
  authDomain: "book-folk.firebaseapp.com",
  projectId: "book-folk",
  storageBucket: "book-folk.appspot.com",
  messagingSenderId: "679648887274",
  appId: "1:679648887274:web:af926ea54e536cb2343293",
  measurementId: "G-EVDZEMZF2B",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;