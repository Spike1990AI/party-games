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

// Clean up rooms older than 30 minutes
async function cleanupOldRooms() {
    try {
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        const roomsRef = ref(database, 'rooms');
        const snapshot = await get(roomsRef);

        if (snapshot.exists()) {
            const rooms = snapshot.val();
            let deletedCount = 0;

            for (const [code, room] of Object.entries(rooms)) {
                if (room.created && room.created < thirtyMinutesAgo) {
                    await remove(ref(database, `rooms/${code}`));
                    deletedCount++;
                }
            }

            if (deletedCount > 0) {
                console.log(`🧹 Cleaned up ${deletedCount} old room(s)`);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

export { database, ref, set, onValue, update, remove, get, cleanupOldRooms };
