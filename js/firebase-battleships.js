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
import { getDatabase, ref, set, onValue, update, onDisconnect, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Connection state monitoring
let isConnected = true;
const connectedRef = ref(database, '.info/connected');

onValue(connectedRef, (snapshot) => {
    isConnected = snapshot.val() === true;

    if (isConnected) {
        console.log('🟢 Firebase connected');
        // Show connection restored notification if was disconnected
        if (document.getElementById('connectionStatus')) {
            document.getElementById('connectionStatus').style.display = 'none';
        }
    } else {
        console.log('🔴 Firebase disconnected');
        // Show disconnection warning
        showConnectionWarning();
    }
});

function showConnectionWarning() {
    let statusDiv = document.getElementById('connectionStatus');

    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'connectionStatus';
        statusDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f44336;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        statusDiv.innerHTML = '⚠️ Connection lost - Reconnecting...';
        document.body.appendChild(statusDiv);
    } else {
        statusDiv.style.display = 'block';
    }
}

// Safe update with retry logic
async function safeUpdate(path, data, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await update(path, data);
            return true;
        } catch (error) {
            console.error(`Update attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
                alert('Connection error. Please check your internet and try again.');
                return false;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
    return false;
}

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

export { database, ref, set, onValue, update, onDisconnect, get, remove, safeUpdate, isConnected, cleanupOldRooms };
