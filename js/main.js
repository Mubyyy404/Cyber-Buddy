// /js/main.js
import { auth, db } from "./firebase.js";
import UserActivityTracker from "./userActivityTracker.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

UserActivityTracker.init({ db, appVersion: "1.0.0", platform: "web" });

const CONSENT = { analytics: true, purchases: true };

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await UserActivityTracker.handleSignIn(user, { consent: CONSENT });
    await UserActivityTracker.trackPageView(user.uid, window.location.pathname, { consent: CONSENT });
  } else {
    console.log("User signed out or not logged in");
  }
});
