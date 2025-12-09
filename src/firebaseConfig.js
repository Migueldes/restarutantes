// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
// 1. IMPORTANTE: Importamos la función de autenticación
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyAw8VasdWO9R5IW6_7zb1HXWz01Y7-8H2o",
  authDomain: "restaurantesapp-63db6.firebaseapp.com",
  projectId: "restaurantesapp-63db6",
  storageBucket: "restaurantesapp-63db6.firebasestorage.app",
  messagingSenderId: "375992841368",
  appId: "1:375992841368:web:fcbb14efe649c6afa7cced",
  measurementId: "G-53WWDGGQ88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. IMPORTANTE: Inicializamos y exportamos 'auth'
export const auth = getAuth(app);