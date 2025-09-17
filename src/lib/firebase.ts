import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-6509060072-5b113",
  appId: "1:904578159629:web:2837397246dc07e7c1b144",
  storageBucket: "studio-6509060072-5b113.firebasestorage.app",
  apiKey: "AIzaSyCUSc8_E0cfLe91V78OWAAC0nbv0ExjIXE",
  authDomain: "studio-6509060072-5b113.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "904578159629"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Explicitly specify the database ID to connect to the correct instance.
const db = getFirestore(app, '(default)');

export { db };
