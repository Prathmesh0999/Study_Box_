const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const pendingOtps = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

app.post("/api/send-verification-code", async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ ok: false, message: "Name and email are required." });
  }

  if (!String(email).toLowerCase().endsWith("@gmail.com")) {
    return res.status(400).json({ ok: false, message: "Please use a Gmail address." });
  }

  try {
    const transporter = createTransporter();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    pendingOtps.set(String(email).toLowerCase(), {
      code,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Study Box verification code",
      text: `Hello ${name}, your Study Box verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#162130">
          <h2 style="margin:0 0 12px;color:#142b46">Study Box Verification</h2>
          <p style="margin:0 0 16px">Hello ${name},</p>
          <p style="margin:0 0 16px">Use this code to complete your student signup:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:6px;padding:18px 20px;background:#f5f7fb;border:1px solid #d7dfeb;border-radius:12px;text-align:center">${code}</div>
          <p style="margin:16px 0 0;color:#617084">This code will expire in 10 minutes.</p>
        </div>
      `
    });

    return res.json({ ok: true, message: "Verification code sent to Gmail." });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message.includes("Missing GMAIL_USER") ? error.message : "Failed to send verification email."
    });
  }
});

app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase();
  const entry = pendingOtps.get(normalizedEmail);

  if (!entry) {
    return res.status(400).json({ ok: false, message: "No verification request found for this email." });
  }

  if (Date.now() > entry.expiresAt) {
    pendingOtps.delete(normalizedEmail);
    return res.status(400).json({ ok: false, message: "Verification code expired. Please request a new one." });
  }

  if (String(code || "").trim() !== entry.code) {
    return res.status(400).json({ ok: false, message: "Verification code is incorrect." });
  }

  pendingOtps.delete(normalizedEmail);
  return res.json({ ok: true, message: "Verification successful." });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Study Box portal running at http://localhost:${PORT}`);
});
