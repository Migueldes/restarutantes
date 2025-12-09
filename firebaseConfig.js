// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);