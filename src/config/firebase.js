import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDUqlpTWmXr4vicykOx0dBqlVnJQyVkZDI",
  authDomain: "thesis-app-3b413.firebaseapp.com",
  databaseURL: "https://thesis-app-3b413-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thesis-app-3b413",
  storageBucket: "thesis-app-3b413.firebasestorage.app",
  messagingSenderId: "121594504364",
  appId: "1:121594504364:web:f0be7ee474bfc7e33fab09",
  measurementId: "G-4S6E11BHRD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);