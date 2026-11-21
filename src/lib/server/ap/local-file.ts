// Reads a picture: /img/... (a website photo) or /path from the dashboard's public folder.
import { readPicture } from './shim/site';
export async function readLocal(url: string): Promise<Buffer | null> {
  return readPicture(url);
}
