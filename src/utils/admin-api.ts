/**
 * Client-side helpers that call the server-side admin API routes.
 * All write operations include the admin password from sessionStorage.
 */

function getAdminPassword(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('kalanidhi-admin-pw') || '';
}

function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-password': getAdminPassword(),
  };
}

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// ── PIECES ─────────────────────────────────────────────────────────────────

export async function adminGetPieces() {
  const res = await fetch('/api/admin/pieces');
  return handleResponse(res);
}

export async function adminCreatePiece(data: Record<string, unknown>) {
  const res = await fetch('/api/admin/pieces', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminUpdatePiece(id: string, data: Record<string, unknown>) {
  const res = await fetch('/api/admin/pieces', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
  return handleResponse(res);
}

export async function adminDeletePiece(id: string) {
  const res = await fetch(`/api/admin/pieces?id=${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return handleResponse(res);
}

// ── CATEGORIES ─────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  const res = await fetch('/api/admin/categories');
  return handleResponse(res);
}

export async function adminCreateCategory(data: Record<string, unknown>) {
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminUpdateCategory(id: string, data: Record<string, unknown>) {
  const res = await fetch('/api/admin/categories', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
  return handleResponse(res);
}

export async function adminDeleteCategory(id: string) {
  const res = await fetch(`/api/admin/categories?id=${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return handleResponse(res);
}

// ── TESTIMONIALS ────────────────────────────────────────────────────────────

export async function adminGetTestimonials() {
  const res = await fetch('/api/admin/testimonials');
  return handleResponse(res);
}

export async function adminCreateTestimonial(data: Record<string, unknown>) {
  const res = await fetch('/api/admin/testimonials', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminUpdateTestimonial(id: string, data: Record<string, unknown>) {
  const res = await fetch('/api/admin/testimonials', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
  return handleResponse(res);
}

export async function adminDeleteTestimonial(id: string) {
  const res = await fetch(`/api/admin/testimonials?id=${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return handleResponse(res);
}

// ── ENQUIRIES ───────────────────────────────────────────────────────────────

export async function adminGetEnquiries() {
  const res = await fetch('/api/admin/enquiries', { headers: adminHeaders() });
  return handleResponse(res);
}

export async function adminMarkEnquiryRead(id: string) {
  const res = await fetch('/api/admin/enquiries', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id, isRead: true }),
  });
  return handleResponse(res);
}

export async function adminDeleteEnquiry(id: string) {
  const res = await fetch(`/api/admin/enquiries?id=${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return handleResponse(res);
}

// ── SETTINGS ────────────────────────────────────────────────────────────────

export async function adminGetSettings() {
  const res = await fetch('/api/admin/settings');
  return handleResponse(res);
}

export async function adminUpdateSettings(data: Record<string, unknown>) {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
