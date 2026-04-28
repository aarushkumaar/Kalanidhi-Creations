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
    const snap = await db.collection('settings').doc('global').get();
    return NextResponse.json({ settings: snap.exists ? snap.data() : {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb();
    const body = await req.json();
    await db.collection('settings').doc('global').set(body, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
