import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
//import './App.css'
import './index.css'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAplgvJN4lrmD1YlkEINyxe8iWI2txg5pI",
  authDomain: "full-stack-react-95980.firebaseapp.com",
  projectId: "full-stack-react-95980",
  storageBucket: "full-stack-react-95980.firebasestorage.app",
  messagingSenderId: "130603670155",
  appId: "1:130603670155:web:6ff7e62144bcaf9276128e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
