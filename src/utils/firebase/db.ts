import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from './config';

// ── CATEGORIES ─────────────────────────────────────────────────────────────

export async function getCategories() {
  // Order by 'name' — 'sortOrder' is not guaranteed to exist on every document
  const q = query(collection(db, 'categories'), orderBy('name'));
  const snap = await Promise.race([
    getDocs(q),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
  ]).catch(async () => {
    // If ordered query fails (e.g. missing index), fall back to unordered fetch
    try {
      const fallback = await getDocs(collection(db, 'categories'));
      return fallback;
    } catch {
      return { docs: [] };
    }
  });
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function getCategoryBySlug(slug: string) {
  const q = query(collection(db, 'categories'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function createCategory(data: any) {
  return addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function updateCategory(id: string, data: any) {
  return updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id: string) {
  return deleteDoc(doc(db, 'categories', id));
}

// ── PIECES ──────────────────────────────────────────────────────────────────

export async function getFeaturedPieces(count = 3) {
  // Try featured pieces first
  const featuredQ = query(
    collection(db, 'pieces'),
    where('isFeatured', '==', true),
    limit(count)
  );
  const featuredSnap = await Promise.race([
    getDocs(featuredQ),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
  ]).catch(() => ({ docs: [] }));

  if (featuredSnap.docs.length > 0) {
    return featuredSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  // Fallback: show any available pieces (handles case where isFeatured is false on all docs)
  const recentQ = query(
    collection(db, 'pieces'),
    where('isAvailable', '==', true),
    limit(count)
  );
  const recentSnap = await Promise.race([
    getDocs(recentQ),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
  ]).catch(() => ({ docs: [] }));

  // Second fallback: isAvailable might not be set either — just get any pieces
  if (recentSnap.docs.length > 0) {
    return recentSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  const anyQ = query(collection(db, 'pieces'), limit(count));
  const anySnap = await getDocs(anyQ).catch(() => ({ docs: [] }));
  return anySnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function getPiecesByCategory(categoryId: string, categorySlug?: string) {
  // Primary: query by categoryId (the Firestore document ID)
  const q = query(
    collection(db, 'pieces'),
    where('categoryId', '==', categoryId)
  );
  const snap = await Promise.race([
    getDocs(q),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
  ]).catch(() => ({ docs: [] }));

  if (snap.docs.length > 0) {
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  // Fallback: query by categorySlug (handles pieces that saved slug instead of ID)
  if (categorySlug) {
    const slugQ = query(
      collection(db, 'pieces'),
      where('categorySlug', '==', categorySlug)
    );
    const slugSnap = await getDocs(slugQ).catch(() => ({ docs: [] }));
    return slugSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  return [];
}

export async function getPieceById(id: string) {
  const snap = await getDoc(doc(db, 'pieces', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getAllPieces() {
  const q = query(collection(db, 'pieces'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function createPiece(data: any) {
  return addDoc(collection(db, 'pieces'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}


// ── TESTIMONIALS ────────────────────────────────────────────────────────────

export async function getTestimonials() {
  const q = query(
    collection(db, 'testimonials'),
    orderBy('sortOrder')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

/** Returns only testimonials marked active:true (new schema) OR isFeatured:true (legacy) */
export async function getActiveTestimonials() {
  const snap = await Promise.race([
    getDocs(collection(db, 'testimonials')),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
  ]).catch(() => ({ docs: [] }));
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as any));
  // Support both schemas
  const active = all.filter((t: any) =>
    t.active === true || t.isFeatured === true
  );
  return active.length > 0 ? active : all; // fall back to all if none marked
}

export async function createTestimonial(data: any) {
  return addDoc(collection(db, 'testimonials'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function updateTestimonial(id: string, data: any) {
  return updateDoc(doc(db, 'testimonials', id), data);
}

export async function deleteTestimonial(id: string) {
  return deleteDoc(doc(db, 'testimonials', id));
}

// ── ENQUIRIES ───────────────────────────────────────────────────────────────

export async function createEnquiry(data: any) {
  return addDoc(collection(db, 'enquiries'), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp()
  });
}

export async function getEnquiries() {
  const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function markEnquiryRead(id: string) {
  return updateDoc(doc(db, 'enquiries', id), { isRead: true });
}

// --- SETTINGS ---
export const getSettings = async () => {
  const docRef = doc(db, 'settings', 'global');
  const snap = await getDoc(docRef);
  if (snap.exists()) return snap.data();
  return null;
};

export const updateSettings = async (data: any) => {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, data, { merge: true });
};

export async function getSetting(key: string) {
  const snap = await getDoc(doc(db, 'settings', key));
  return snap.exists() ? snap.data()?.value : null;
}

export async function setSetting(key: string, value: string) {
  return setDoc(doc(db, 'settings', key), {
    value,
    updatedAt: serverTimestamp()
  });
}

// ── ADMINS ──────────────────────────────────────────────────────────────────

export async function getAdmins() {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function addAdmin(email: string) {
  return setDoc(doc(db, 'admins', email.toLowerCase()), {
    email: email.toLowerCase(),
    createdAt: serverTimestamp()
  });
}

export async function removeAdmin(email: string) {
  return deleteDoc(doc(db, 'admins', email.toLowerCase()));
}
