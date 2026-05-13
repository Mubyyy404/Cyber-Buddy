// ── firebase.js ─────────────────────────────────────────────
// FIX 1: All SDK imports now use the SAME version (10.12.2)
//         Previously firebase.js used 9.23.0 while all other
//         files imported from 10.12.2 — causing silent failures.
// FIX 2: Place this file at  /js/firebase.js  (all pages import
//         from "./js/firebase.js").  Do NOT put it in the root.

import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIY6AiBsGrq7wM0BBYGW2lM_0FLWjnH0k",
  authDomain: "cybermonitor-1ab3c.firebaseapp.com",
  projectId: "cybermonitor-1ab3c",
  storageBucket: "cybermonitor-1ab3c.firebasestorage.app",
  messagingSenderId: "569408987884",
  appId: "1:569408987884:web:0839eb7932c206fc157bc9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
