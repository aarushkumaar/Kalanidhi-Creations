import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from './config';

// ── CATEGORIES ─────────────────────────────────────────────────────────────

export async function getCategories() {
  const q = query(collection(db, 'categories'), orderBy('sortOrder'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  const q = query(
    collection(db, 'pieces'),
    where('isFeatured', '==', true),
    where('isAvailable', '==', true),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPiecesByCategory(categoryId: string) {
  const q = query(
    collection(db, 'pieces'),
    where('categoryId', '==', categoryId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPieceById(id: string) {
  const snap = await getDoc(doc(db, 'pieces', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getAllPieces() {
  const q = query(collection(db, 'pieces'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
