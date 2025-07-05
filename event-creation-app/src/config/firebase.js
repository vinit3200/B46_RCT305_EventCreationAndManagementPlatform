import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStore} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvoJNrJGi_ILPy-Ke2Z_9B7KQ1EsUhg8k",
  authDomain: "project-2-2c4e2.firebaseapp.com",
  projectId: "project-2-2c4e2",
  storageBucket: "project-2-2c4e2.firebasestorage.app",
  messagingSenderId: "35885518577",
  appId: "1:35885518577:web:35bfb01aecaccfa078a350"
};

const app = initializeApp(firebaseConfig);
export let auth = getAuth(app);
export let db = getFirestore(app);
export let storage = getStore(app);
export default app;