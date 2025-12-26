// Firebase Configuration for Minefield Race
const firebaseConfig = {
    apiKey: "AIzaSyBcydGkkGFTmcX1Z83gDECQGY1nOvUwdoo",
    authDomain: "family-games-f00e7.firebaseapp.com",
    databaseURL: "https://family-games-f00e7-default-rtdb.firebaseio.com",
    projectId: "family-games-f00e7",
    storageBucket: "family-games-f00e7.firebasestorage.app",
    messagingSenderId: "1013472677357",
    appId: "1:1013472677357:web:62c85f71ec5d96db0f8fab"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, update, remove, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue, update, remove, get };
