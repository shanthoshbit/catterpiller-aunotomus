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

// Check if user is already logged in
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = 'index.html';
  }
});

// Handle login form submission
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const msgElement = document.getElementById('msg');
  
  // Reset message and disable button during login
  msgElement.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  // Basic validation
  if (!email || !password) {
    showError('Please enter both email and password');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
    return;
  }

  // Attempt to sign in
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Success - redirect handled by onAuthStateChanged
    })
    .catch(error => {
      let errorMessage = '';
      
      // Only show specific error messages for certain cases
      switch (error.code) {
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        // For invalid email, user not found, or wrong password, we'll show a generic message
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Login failed. Please check your credentials.';
          break;
        default:
          errorMessage = 'An error occurred. Please try again.';
      }
      
      showError(errorMessage);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    });
}

// Helper function to display error messages
function showError(message) {
  const msgElement = document.getElementById('msg');
  msgElement.textContent = message;
  msgElement.style.opacity = '1';
  
  // Auto-hide error after 5 seconds
  setTimeout(() => {
    msgElement.style.opacity = '0';
    setTimeout(() => {
      msgElement.textContent = '';
      msgElement.style.opacity = '1';
    }, 500);
  }, 5000);
}

// Allow form submission with Enter key
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
  
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
});
