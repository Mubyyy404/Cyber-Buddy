// /js/userActivityTracker.js
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const UserActivityTracker = (function () {
  let _db = null;
  let _appVersion = null;
  let _platform = "web";

  function init({ db, appVersion = null, platform = "web" } = {}) {
    if (!db) throw new Error('Firestore "db" instance required.');
    _db = db;
    _appVersion = appVersion;
    _platform = platform;
  }

  function _requireInit() {
    if (!_db) throw new Error("UserActivityTracker.init({ db }) must be called first.");
  }

  function getDeviceInfo() {
    if (typeof navigator === "undefined") return { userAgent: "unknown" };
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };
  }

  function _hasConsent(consent, key = "analytics") {
    return consent && consent[key] === true;
  }

  async function ensureBaseUserDoc(uid, base = {}) {
    _requireInit();
    const userRef = doc(_db, "users", uid);
    await setDoc(
      userRef,
      {
        uid,
        createdAt: serverTimestamp(),
        email: "",
        name: "",
        phone: "",
        purchasedCourses: [],
        webPentestingBookmarks: [],
        progress: {},
        lastActive: serverTimestamp(),
        appVersion: _appVersion,
        platform: _platform,
        ...base
      },
      { merge: true }
    );
    return userRef;
  }

  async function handleSignIn(user, { consent = null } = {}) {
    _requireInit();
    const userRef = doc(_db, "users", user.uid);
    const data = {
      email: user.email || "",
      name: user.displayName || "",
      phone: user.phoneNumber || "",
      lastLogin: serverTimestamp()
    };
    await setDoc(userRef, data, { merge: true });
    if (_hasConsent(consent, "analytics")) {
      await updateDoc(userRef, {
        loginHistory: arrayUnion(serverTimestamp()),
        deviceInfo: getDeviceInfo(),
        lastActive: serverTimestamp()
      });
    }
  }

  async function handleSignOut(user) {
    _requireInit();
    if (!user?.uid) return;
    await updateDoc(doc(_db, "users", user.uid), { lastActive: serverTimestamp() });
  }

  async function trackPageView(uid, path, { consent = null } = {}) {
    _requireInit();
    if (!_hasConsent(consent, "analytics")) return;
    const userRef = doc(_db, "users", uid);
    await updateDoc(userRef, {
      pageViews: arrayUnion({ path, at: serverTimestamp(), device: getDeviceInfo() }),
      lastActive: serverTimestamp()
    });
  }

  async function addPurchase(uid, courseId, { consent = null } = {}) {
    _requireInit();
    if (!_hasConsent(consent, "purchases")) return;
    const userRef = doc(_db, "users", uid);
    await updateDoc(userRef, {
      purchasedCourses: arrayUnion({ courseId, at: serverTimestamp() }),
      lastActive: serverTimestamp()
    });
  }

  async function updateProgress(uid, courseId, progressObj, { consent = null } = {}) {
    _requireInit();
    if (!_hasConsent(consent, "analytics")) return;
    const userRef = doc(_db, "users", uid);
    await updateDoc(userRef, {
      [`progress.${courseId}`]: progressObj,
      lastActive: serverTimestamp()
    });
  }

  async function addBookmark(uid, bookmark, { consent = null } = {}) {
    _requireInit();
    if (!_hasConsent(consent, "analytics")) return;
    await updateDoc(doc(_db, "users", uid), {
      webPentestingBookmarks: arrayUnion(bookmark),
      lastActive: serverTimestamp()
    });
  }

  async function removeBookmark(uid, bookmark, { consent = null } = {}) {
    _requireInit();
    if (!_hasConsent(consent, "analytics")) return;
    await updateDoc(doc(_db, "users", uid), {
      webPentestingBookmarks: arrayRemove(bookmark),
      lastActive: serverTimestamp()
    });
  }

  async function getUserDoc(uid) {
    _requireInit();
    const snap = await getDoc(doc(_db, "users", uid));
    return snap.exists() ? snap.data() : null;
  }

  return {
    init,
    handleSignIn,
    handleSignOut,
    trackPageView,
    addPurchase,
    updateProgress,
    addBookmark,
    removeBookmark,
    ensureBaseUserDoc,
    getUserDoc
  };
})();

export default UserActivityTracker;
