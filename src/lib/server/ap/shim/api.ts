import 'server-only';
import { revalidatePath } from '../../revalidate';
/** New or changed articles show at once on the blog and its pages. */
export function refreshSite() { try { revalidatePath('/', 'layout'); } catch { /* outside a request */ } }
