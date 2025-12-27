// Notification system
function showToast(message, type = 'info', duration = 5000) {
  // Only try to show desktop notification if we're in a secure context
  const canShowNotification = window.isSecureContext && 
                            'Notification' in window && 
                            Notification.permission === 'granted';
  
  if (type === 'info' && canShowNotification) {
    try {
      new Notification('Sand Rover Update', {
        body: message,
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
      });
    } catch (error) {
      console.log('Desktop notifications not supported:', error);
      // Continue with toast notification
    }
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Add message
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => toast.remove();
  toast.appendChild(closeBtn);
  
  // Add to container
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  return toast;
}

// Request notification permission
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return;
  }

  if (Notification.permission !== 'denied' && window.isSecureContext) {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    }).catch(error => {
      console.log('Error requesting notification permission:', error);
    });
  }
}

// Initialize notification system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requestNotificationPermission);
} else {
  requestNotificationPermission();
}

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
    }).then(() => {
      showToast('Auto mode activated', 'success');
    }).catch((error) => {
      showToast('Failed to activate auto mode: ' + error.message, 'error');
    });
  });

  // MANUAL button
  document.getElementById("manualBtn").addEventListener("click", () => {
    const manualData = {
      mode: "MANUAL",
      autoCommand: false,
      status: "MANUAL MODE",
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    db.ref("rover").set(manualData)
      .then(() => {
        showToast('Manual mode activated', 'info');
      })
      .catch((error) => {
        console.error('Manual mode activation error:', error);
        showToast('Failed to activate manual mode. Please try again.', 'error');
      });
  });

  // Track previous status
  let previousStatus = '';
  
  // Read status
  db.ref("rover").on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;
    
    const statusElement = document.getElementById("status");
    if (statusElement && data.status) {
      // Update status display
      statusElement.innerText = data.status;
      
      // Show notification when status changes
      if (data.status !== previousStatus) {
        const message = `Mode changed to: ${data.status}`;
        showToast(message, 'info');
        previousStatus = data.status;
      }
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
