/*************************************************
 * SAND ROVER CONTROL – app.js
 * Firebase v8 (STABLE)
 *************************************************/

/**************** FIREBASE CONFIG ****************/
const firebaseConfig = {
  apiKey: "AIzaSyCAMYHs4Ir3wwt0y9Ss-jrbzsyn7nOQD6c",
  authDomain: "sand-rover-control.firebaseapp.com",
  databaseURL: "https://sand-rover-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sand-rover-control"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.database();

/**************** AUTO LOGOUT ****************/
const INACTIVITY_TIMEOUT = 6 * 60 * 60 * 1000;
let logoutTimer;

function startLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
}

['mousedown','mousemove','keydown','scroll','touchstart']
  .forEach(evt => document.addEventListener(evt, startLogoutTimer));

/**************** DEVICE ONLINE / OFFLINE ****************/
const statusEl = document.getElementById("deviceStatus");
let lastSeenTime = 0;      // milliseconds
let deviceOnline = false;

/* 🔴 FIX: convert seconds → milliseconds */
db.ref("rover/device/lastSeen").on("value", snap => {
  const val = snap.val();
  if (typeof val === "number") {
    lastSeenTime = val * 1000;   // 🔥 FIX HERE
  }
});

/* Check every 3 seconds */
setInterval(() => {
  const now = Date.now();

  if (lastSeenTime && (now - lastSeenTime < 15000)) {
    setOnline();
  } else {
    setOffline();
  }
}, 3000);

function setOnline() {
  if (deviceOnline) return;
  deviceOnline = true;
  statusEl.textContent = "● DEVICE ONLINE";
  statusEl.className = "status online";
}

function setOffline() {
  if (!deviceOnline) return;
  deviceOnline = false;
  statusEl.textContent = "● DEVICE OFFLINE";
  statusEl.className = "status offline";
}

/**************** AUTH CHECK ****************/
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    initializeApp();
  }
});

/**************** INITIALIZE APP ****************/
function initializeApp() {
  startLogoutTimer();

  document.getElementById("autoBtn").onclick = () => {
    db.ref("rover").update({
      mode: "AUTO",
      emergencyStop: false,
      move: "STOP",
      status: "AUTO MODE ACTIVE"
    });
  };

  document.getElementById("manualBtn").onclick = () => {
    db.ref("rover").update({
      mode: "MANUAL",
      emergencyStop: false,
      move: "STOP",
      status: "MANUAL MODE ACTIVE"
    });
  };

  document.getElementById("emergencyBtn").onclick = () => {
    db.ref("rover").update({
      mode: "MANUAL",
      emergencyStop: true,
      move: "STOP",
      status: "🚨 EMERGENCY STOP ACTIVATED"
    });
  };

  attachMoveButton("forwardBtn", "FORWARD");
  attachMoveButton("backBtn", "BACK");
  attachMoveButton("leftBtn", "LEFT");
  attachMoveButton("rightBtn", "RIGHT");
  attachMoveButton("stopBtn", "STOP");

  db.ref("rover/status").on("value", snap => {
    if (snap.exists()) {
      document.getElementById("status").innerText = snap.val();
    }
  });
}

/**************** MOVE HANDLER ****************/
function attachMoveButton(id, direction) {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.onclick = () => {
    if (!deviceOnline) {
      alert("❌ Device OFFLINE");
      return;
    }

    db.ref("rover").once("value").then(snap => {
      const data = snap.val();
      if (!data) return;

      if (data.emergencyStop) {
        alert("🚨 Emergency Stop ACTIVE");
        return;
      }

      if (data.mode !== "MANUAL") {
        alert("Switch to MANUAL mode first");
        return;
      }

      db.ref("rover").update({
        move: direction,
        status: "MANUAL: " + direction
      });
    });
  };
}

/**************** LOGOUT ****************/
function logout() {
  clearTimeout(logoutTimer);
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
