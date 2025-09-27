// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqpw4xcG5XPJedS5qWd7wlNb7b8ORGGhY",
  authDomain: "truematch-b430b.firebaseapp.com",
  projectId: "truematch-b430b",
  storageBucket: "truematch-b430b.firebasestorage.app",
  messagingSenderId: "484432074419",
  appId: "1:484432074419:web:90948440486c0859dec2c6",
  measurementId: "G-7GBF83GW7V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
