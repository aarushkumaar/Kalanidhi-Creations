import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';

export const dynamic = 'force-dynamic';

function verifyAdminPassword(req: NextRequest): boolean {
  const pw = req.headers.get('x-admin-password');
  return pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('testimonials').orderBy('createdAt', 'desc').get();
    const testimonials = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ testimonials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const body = await req.json();
    // Persist new schema fields + legacy aliases for backward compat
    const ref = await db.collection('testimonials').add({
      name:         body.name        ?? body.authorName   ?? '',
      authorName:   body.name        ?? body.authorName   ?? '',
      location:     body.location    ?? body.authorDetail ?? '',
      authorDetail: body.location    ?? body.authorDetail ?? '',
      message:      body.message     ?? body.quote        ?? '',
      quote:        body.message     ?? body.quote        ?? '',
      active:       body.active      ?? true,
      isFeatured:   body.isFeatured  ?? body.active ?? true,
      createdAt:    new Date(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('testimonials').doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('testimonials').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
