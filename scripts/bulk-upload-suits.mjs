/**
 * bulk-upload-suits.mjs
 * ─────────────────────
 * Run ONCE to upload all images from assets/suits/ to Cloudinary
 * and create placeholder documents in Firestore that you can then
 * edit from the Admin Panel (name, price, category, etc.)
 *
 * Usage:
 *   node scripts/bulk-upload-suits.mjs
 *
 * Requirements: Node 18+ (for global fetch + FormData)
 *   npm install firebase-admin dotenv
 */

import fs            from 'fs';
import path          from 'path';
import { fileURLToPath } from 'url';
import dotenv        from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';

// ── Setup ───────────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

// Load .env.local so we get Firebase Admin credentials
dotenv.config({ path: path.join(ROOT, '.env.local') });

// ── Config ──────────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME   = 'dfiskvjbl';
const CLOUDINARY_UPLOAD_PRESET = 'kalanidhi_unsigned'; // unsigned preset — no secret needed
const SUITS_DIR               = path.join(ROOT, 'assets', 'suits');
const IMAGE_EXTENSIONS        = /\.(jpg|jpeg|png|webp|gif)$/i;

// ── Firebase Admin init ─────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

// ── Cloudinary upload ────────────────────────────────────────────────────────
async function uploadToCloudinary(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const blob       = new Blob([fileBuffer], { type: 'image/jpeg' });

  const form = new FormData();
  form.append('file',           blob, fileName);
  form.append('upload_preset',  CLOUDINARY_UPLOAD_PRESET);
  form.append('folder',         'kalanidhi/suits');  // organises in Cloudinary dashboard

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.secure_url;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(SUITS_DIR)) {
    console.error(`❌  Directory not found: ${SUITS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SUITS_DIR)
    .filter(f => IMAGE_EXTENSIONS.test(f))
    .sort();

  if (files.length === 0) {
    console.log('No images found in assets/suits/');
    return;
  }

  console.log(`\n🧵  Found ${files.length} images in assets/suits/`);
  console.log('    Uploading to Cloudinary → creating Firestore docs...\n');

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(SUITS_DIR, fileName);
    const label    = `[${String(i + 1).padStart(3, ' ')}/${files.length}]`;

    try {
      process.stdout.write(`${label} ${fileName.slice(0, 50).padEnd(52)} → `);

      const cloudUrl = await uploadToCloudinary(filePath, fileName);

      // Create a placeholder Firestore doc — edit name/price later in Admin Panel
      await db.collection('pieces').add({
        name:        `Suit ${String(i + 1).padStart(2, '0')}`,
        price:       0,
        coverImage:  cloudUrl,
        images:      [cloudUrl],
        description: '',
        categoryId:  '',        // assign a category from Admin Panel later
        isFeatured:  false,
        isAvailable: true,
        createdAt:   Timestamp.now(),
        updatedAt:   Timestamp.now(),
      });

      console.log(`✓  ${cloudUrl.split('/').pop()}`);
      success++;

    } catch (err) {
      console.log(`✗  FAILED — ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate-limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✅  Done! ${success} uploaded, ${failed} failed.`);
  if (success > 0) {
    console.log('    Go to /admin → Products to rename and price each item.\n');
  }
}

main().catch(err => {
  console.error('\n💥  Unexpected error:', err);
  process.exit(1);
});
