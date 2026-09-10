# Cyber Buddy Academy — Webinar Registration

Files:
- `index.html` — the registration page (host this on GitHub Pages)
- `firebase.js` — Firebase config + Firestore read/write helpers (imported by index.html and admin.html)
- `admin.html` — password-gated page to view registrations and download them as Excel
- `functions/` — Firebase Cloud Function that emails each registrant via Gmail SMTP
- `firestore.rules` — locks the database so the public can only submit, never read/edit/delete

## 1. Host the page on GitHub
Push these files (except `functions/`) to a GitHub repo → Settings → Pages → deploy from branch.
`admin.html` and `firebase.js` can go in the same repo; nothing in them is secret (the Gmail
password is **not** in these files — it lives only in the Cloud Function, set as a secret).

## 2. Set up Firebase
1. In the Firebase Console, enable **Firestore Database** (production mode).
2. Deploy the rules: `firebase deploy --only firestore:rules` (after `firebase init firestore` and pointing it at `firestore.rules`).
3. Go to **Authentication → Sign-in method → Email/Password**, enable it, then **Users → Add user** to create yourself an admin login for `admin.html`.

## 3. Deploy the email Cloud Function
Cloud Functions require the **Blaze (pay-as-you-go) plan** — it has a generous free tier, and Gmail SMTP sending is essentially free at this volume.

```
npm install -g firebase-tools
firebase login
firebase init functions      # choose "Use an existing project" → your project, JavaScript, don't overwrite functions/index.js
cd functions && npm install
firebase functions:secrets:set GMAIL_USER      # enter: cyberbuddyyy@gmail.com
firebase functions:secrets:set GMAIL_PASS      # enter your 16-character Gmail App Password (not your normal Gmail password)
firebase deploy --only functions
```

Every time someone registers, Firestore gets a new document and the function fires automatically — no extra code needed on the webpage.

**When you send me the final HTML email design**, I'll drop it into `buildEmailHtml()` in `functions/index.js` — just redeploy with `firebase deploy --only functions` after.

## 4. Excel export
Open `admin.html`, sign in with the admin account you created, and click **Download Excel** — it pulls every registration from Firestore and saves a `.xlsx` file.

## Notes
- The Gmail App Password you shared is a dummy — swap it via `firebase functions:secrets:set GMAIL_PASS` before going live; it's never stored in any file that gets pushed to GitHub.
- Contact number is validated as a 10-digit Indian mobile number (starts 6–9). Tell me if you want a different format.
- "Degree with specialization" is optional per the brief — left blank, it's stored as "Not specified".
