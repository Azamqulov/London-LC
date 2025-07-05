import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEyIJ-p992X8EGxKjLamCpgUAD5eJMA8U",
  authDomain: "london-lc.firebaseapp.com",
  projectId: "london-lc",
  storageBucket: "london-lc.firebasestorage.app",
  messagingSenderId: "424732076149",
  appId: "1:424732076149:web:65603dc8bc8505f932f03c",
  measurementId: "G-KC4NS3QNQM",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
