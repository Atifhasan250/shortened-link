// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo3H9Er4sIEa1qvZeqlgZvC8r1s3-uofk",
  authDomain: "shortend-links.firebaseapp.com",
  projectId: "shortend-links",
  storageBucket: "shortend-links.firebasestorage.app",
  messagingSenderId: "495372875371",
  appId: "1:495372875371:web:dd31e82c7ac5545f3ee32e",
  measurementId: "G-0TQXHD2T6F"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics, but only on the client side
if (typeof window !== 'undefined') {
  getAnalytics(app);
}


export { db };
