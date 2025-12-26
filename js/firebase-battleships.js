// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcydGkkGFTmcX1Z83gDECQGY1nOvUwdoo",
    authDomain: "family-games-f00e7.firebaseapp.com",
    databaseURL: "https://family-games-f00e7-default-rtdb.firebaseio.com",
    projectId: "family-games-f00e7",
    storageBucket: "family-games-f00e7.firebasestorage.app",
    messagingSenderId: "290169222484",
    appId: "1:290169222484:web:0c27cfa01a141ec49104c1"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue, update };
