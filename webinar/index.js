// functions/index.js — Cyber Buddy Academy
// Fires automatically whenever a new document is added to the
// "registrations" Firestore collection, and emails the registrant
// via Gmail SMTP (Nodemailer). Deploy with the Firebase CLI.
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

// Set these once with:
//   firebase functions:secrets:set GMAIL_USER
//   firebase functions:secrets:set GMAIL_PASS   (16-char Gmail App Password, not your login password)
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

exports.sendRegistrationEmail = onDocumentCreated(
  { document: "registrations/{id}", secrets: [GMAIL_USER, GMAIL_PASS] },
  async (event) => {
    const data = event.data?.data();
    if (!data?.email) return;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER.value(), pass: GMAIL_PASS.value() }
    });

    // TODO: replace this with the HTML email template you'll share later.
    const html = buildEmailHtml(data);

    await transporter.sendMail({
      from: `"Cyber Buddy Academy" <${GMAIL_USER.value()}>`,
      to: data.email,
      subject: "You're registered — Introduction to Cybersecurity Webinar",
      html
    });
  }
);

function buildEmailHtml({ name }) {
  return `
  <div style="font-family:Arial,sans-serif;background:#050810;color:#eaf6ff;padding:32px;border-radius:12px;max-width:520px;margin:auto">
    <h2 style="margin:0 0 12px">Hi ${escapeHtml(name)}, you're in! 🛡️</h2>
    <p style="color:#8ea3bd;line-height:1.6">
      Thanks for registering for <strong>Introduction to Cybersecurity</strong> — a free live webinar by Cyber Buddy Academy.
    </p>
    <p style="line-height:1.8">
      📅 <strong>12 September 2026, 6:00 PM</strong><br>
      💻 <strong>Online — Microsoft Teams</strong> (link shared closer to the date)
    </p>
    <p style="color:#8ea3bd;line-height:1.6">We'll send the Teams join link and any updates to this email. See you there!</p>
    <p style="margin-top:24px;color:#38e1ff;font-weight:bold">Cyber Buddy Academy — Learn · Hack · Secure</p>
  </div>`;
}

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
