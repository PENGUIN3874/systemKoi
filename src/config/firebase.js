
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import  { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyC13LUFc6YBHORpsYnKQrHk8LadiLRvjsA",
  authDomain: "koifish-28bd0.firebaseapp.com",
  projectId: "koifish-28bd0",
  storageBucket: "koifish-28bd0.appspot.com",
  messagingSenderId: "924584669290",
  appId: "1:924584669290:web:9fefbad3b94264662a5a13",
  measurementId: "G-6JWBWG8DGT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider=new GoogleAuthProvider();
const auth = getAuth(app);
export {storage, googleProvider,auth};