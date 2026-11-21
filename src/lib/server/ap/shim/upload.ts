import 'server-only';
export { savePublicFile } from './site';
import { readPicture } from './site';
export const readStored = (rel: string) => readPicture(rel);
