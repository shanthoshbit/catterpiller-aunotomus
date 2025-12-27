// Auto-logout configuration
const INACTIVITY_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
let logoutTimer;

// Function to start the logout timer
function startLogoutTimer() {
  // Clear any existing timer
  clearTimeout(logoutTimer);
  
  // Set a new timer
  logoutTimer = setTimeout(() => {
    logout();
  }, INACTIVITY_TIMEOUT);
}

// Function to reset the logout timer on user activity
function resetLogoutTimer() {
  startLogoutTimer();
}

// Add event listeners for user activity
const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
activityEvents.forEach(event => {
  document.addEventListener(event, resetLogoutTimer, false);
});

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAMYHs4Ir3wwt0y9Ss-jrbzsyn7nOQD6c",
  authDomain: "sand-rover-control.firebaseapp.com",
  databaseURL: "https://sand-rover-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sand-rover-control"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Check authentication state
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    initializeApp();
  }
});

// Initialize application after authentication
function initializeApp() {
  // Start the logout timer when the app initializes
  startLogoutTimer();
  // AUTO button
  document.getElementById("autoBtn").addEventListener("click", () => {
    db.ref("rover").set({
      mode: "AUTO",
      autoCommand: true,
      status: "AUTO STARTED"
    });
  });

  // MANUAL button
  document.getElementById("manualBtn").addEventListener("click", () => {
    db.ref("rover").set({
      mode: "MANUAL",
      autoCommand: false,
      status: "MANUAL MODE"
    });
  });

  // Read status
  db.ref("rover/status").on("value", snapshot => {
    const statusElement = document.getElementById("status");
    if (statusElement && snapshot.exists()) {
      statusElement.innerText = snapshot.val();
    }
  });
}

// Logout function
function logout() {
  // Clear the logout timer
  clearTimeout(logoutTimer);
  
  // Sign out from Firebase
  auth.signOut().then(() => {
    window.location.href = "login.html";
  }).catch(error => {
    console.error("Logout failed:", error);
  });
}

// Start the logout timer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLogoutTimer);
} else {
  startLogoutTimer();
}
