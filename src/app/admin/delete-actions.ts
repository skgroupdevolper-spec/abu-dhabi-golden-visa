'use server';

// Delete and clear-out actions for admin lists (notifications, enquiries, applications, subscribers, WhatsApp log, chats, bookings).
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { EDIT, FULL, requireAdmin } from '@/lib/server/auth';
import type { Role } from '@/lib/server/collections';
import { UPLOAD_DIR, updateJsonFile } from '@/lib/server/store';

type Item = { id: string; read?: boolean; status?: string; archived?: boolean };
const KINDS: Record<string, { file: string; page: string; roles: Role[] }> = {
  notifications: { file: 'notifications.json', page: '/admin/notifications/', roles: ['owner', 'admin', 'staff', 'viewer'] },
  leads: { file: 'leads.json', page: '/admin/leads/', roles: EDIT },
  applications: { file: 'applications.json', page: '/admin/applications/', roles: FULL },
  subscribers: { file: 'subscribers.json', page: '/admin/subscribers/', roles: FULL },
  walog: { file: 'whatsapp-log.json', page: '/admin/whatsapp/?tab=log', roles: FULL },
  chats: { file: 'chats.json', page: '/admin/chatbot/', roles: FULL },
  bookings: { file: 'bookings.json', page: '/admin/bookings/', roles: EDIT },
};

async function drop(kind: string, keep: (x: Item) => boolean) {
  const k = KINDS[kind];
  if (!k) throw new Error('Unknown list');
  await requireAdmin(k.roles);
  const gone: string[] = [];
  await updateJsonFile<Item[]>(k.file, [], (all) => all.filter((x) => { const stay = keep(x); if (!stay) gone.push(x.id); return stay; }));
  // Applications: remove their uploaded documents too.
  if (kind === 'applications') for (const id of gone) await rm(path.join(UPLOAD_DIR, path.basename(id)), { recursive: true, force: true }).catch(() => {});
  revalidatePath('/admin', 'layout');
  return { k, n: gone.length };
}

/** Delete one or more items (form fields: kind, id…, back?). */
export async function deleteItems(f: FormData) {
  const kind = String(f.get('kind') || '');
  const ids = new Set(f.getAll('id').map(String).filter(Boolean));
  if (!ids.size) return;
  const { k } = await drop(kind, (x) => !ids.has(x.id));
  const back = String(f.get('back') || '');
  if (back.startsWith('/admin/')) redirect(back);
  if (kind === 'applications' && f.get('detail')) redirect(k.page);
}

/** Clear many at once (scope: all | read | status:<name> | archived). */
export async function clearItems(f: FormData) {
  const kind = String(f.get('kind') || ''), scope = String(f.get('scope') || '');
  const st = scope.startsWith('status:') ? scope.slice(7) : '';
  await drop(kind, (x) => !(scope === 'all' || (scope === 'read' && x.read) || (st && x.status === st) || (scope === 'archived' && x.archived)));
}

/** Delete (on=1) or restore (on=0) a built-in page or guide. Built-in pages are part of the code, so
 * "delete" takes them off the website (404, out of the sitemap, menus and blog list) and Restore brings them back. */
export async function setPageDeleted(f: FormData) {
  await requireAdmin(FULL);
  const p = String(f.get('path') || '');
  if (!p.startsWith('/') || p === '/') return;
  const on = f.get('on') === '1';
  const { now } = await import('@/lib/server/store');
  await updateJsonFile<Record<string, { hidden?: boolean; at?: string }>>('content.json', {}, (all) => { all[p] = { ...(all[p] ?? {}), hidden: on, at: now() }; return all; });
  revalidatePath('/', 'layout');
}
/** @deprecated kept for old forms */
export const togglePageHidden = setPageDeleted;
