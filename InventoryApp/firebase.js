import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxgFtG4h6irDcV8YwRLqhhQotorrsnqD4",
  authDomain: "inventory-tracker-65080.firebaseapp.com",
  projectId: "inventory-tracker-65080",
  storageBucket: "inventory-tracker-65080.appspot.com",
  messagingSenderId: "189600707952",
  appId: "1:189600707952:web:4999878bc4d5f351fc0bb5",
  // measurementId: "G-MW96XWJZ2P"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
