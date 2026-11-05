import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR, newId, now, type Doc } from './store';

export const MAX_UPLOAD = 15 * 1024 * 1024;
const OK = /\.(pdf|jpe?g|png|webp|heic|heif|gif|docx?|xlsx?|txt)$/i;

/** Saves an uploaded file under DATA_DIR/uploads/<application>/ and returns its record. */
export async function saveUpload(appId: string, file: File, by: Doc['by'], shared: boolean, label?: string): Promise<Doc> {
  if (!file || file.size === 0) throw new Error('Please choose a file.');
  if (file.size > MAX_UPLOAD) throw new Error('Files can be up to 15 MB.');
  const clean = file.name.normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').slice(-80) || 'file';
  if (!OK.test(clean)) throw new Error('Please upload a PDF, photo, Word or Excel file.');
  const id = newId(8);
  const dir = path.join(UPLOAD_DIR, appId);
  await mkdir(dir, { recursive: true });
  const stored = `${id}-${clean}`;
  await writeFile(path.join(dir, stored), Buffer.from(await file.arrayBuffer()));
  return { id, name: (label?.trim() || file.name).slice(0, 120), file: stored, size: file.size, type: file.type || 'application/octet-stream', by, at: now(), shared };
}

export async function readUpload(appId: string, doc: Doc) {
  return readFile(path.join(UPLOAD_DIR, appId, path.basename(doc.file)));
}

export const sizeLabel = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
