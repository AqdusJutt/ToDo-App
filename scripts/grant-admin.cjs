// scripts/grant-admin.cjs  (CommonJS)
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");

// Choose ONE of these env vars:
// 1) FIREBASE_ADMIN_KEY_PATH -> path to your serviceAccount.json
// 2) FIREBASE_ADMIN_CREDENTIALS_JSON -> full JSON string
const keyPath = process.env.FIREBASE_ADMIN_KEY_PATH;
const keyJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;

if (!keyPath && !keyJson) {
  console.error("Set FIREBASE_ADMIN_KEY_PATH or FIREBASE_ADMIN_CREDENTIALS_JSON");
  process.exit(1);
}

const credentials = keyJson
  ? JSON.parse(keyJson)
  : JSON.parse(fs.readFileSync(keyPath, "utf8"));

initializeApp({ credential: cert(credentials) });

// Usage: node scripts/grant-admin.cjs <email-or-uid>
const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/grant-admin.cjs <email-or-uid>");
  process.exit(1);
}

(async () => {
  try {
    let uid = target;
    if (target.includes("@")) {
      const u = await getAuth().getUserByEmail(target);
      uid = u.uid;
    }
    await getAuth().setCustomUserClaims(uid, { admin: true });
    console.log(✅ admin claim set for UID: ${uid});
    // optional: force token refresh on next login
    // await getAuth().revokeRefreshTokens(uid);
  } catch (e) {
    console.error("❌ error:", e);
    process.exit(1);
  }
})();
