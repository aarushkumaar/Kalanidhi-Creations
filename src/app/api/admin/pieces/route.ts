import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminStorage } from '@/utils/firebase/admin';

export const dynamic = 'force-dynamic';

function verifyAdminPassword(req: NextRequest): boolean {
  const pw = req.headers.get('x-admin-password');
  return pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

// GET /api/admin/pieces — list all pieces
export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('pieces').orderBy('createdAt', 'desc').get();
    const pieces = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ pieces });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/pieces — create piece
export async function POST(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const body = await req.json();
    const ref = await db.collection('pieces').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/pieces — update piece
export async function PUT(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing piece id' }, { status: 400 });
    await db.collection('pieces').doc(id).update({ ...data, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/pieces?id=xxx
export async function DELETE(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing piece id' }, { status: 400 });

    // Try to delete the piece's images from Storage
    const doc = await db.collection('pieces').doc(id).get();
    const data = doc.data();
    if (data?.coverImage) {
      try {
        const storage = getAdminStorage();
        const bucket = storage.bucket();
        const urlPath = decodeURIComponent(new URL(data.coverImage).pathname.split('/o/')[1]?.split('?')[0] || '');
        if (urlPath) await bucket.file(urlPath).delete();
      } catch {
        // Ignore storage deletion errors — delete the Firestore doc regardless
      }
    }

    await db.collection('pieces').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
