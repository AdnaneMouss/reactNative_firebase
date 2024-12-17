// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5pTo8-XHIFUJNnOasKLfOiEhagpasR6o",
  authDomain: "e-commercenative.firebaseapp.com",
  projectId: "e-commercenative",
  storageBucket: "e-commercenative.firebasestorage.app",
  messagingSenderId: "434685741326",
  appId: "1:434685741326:web:15e1f46c8a64e890626f5f",
  measurementId: "G-L8QNL414WJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default app;