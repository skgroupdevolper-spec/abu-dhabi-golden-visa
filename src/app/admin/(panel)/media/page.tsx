import type { Metadata } from 'next';
import { ActionForm, CopyButton, Submit } from '@/components/dash/ActionForm';
import { requireAdmin } from '@/lib/server/auth';
import { list } from '@/lib/server/collections';
import type { MediaItem } from '@/lib/server/content';
import { sizeLabel } from '@/lib/server/files';
import { SITE } from '@/lib/site';
import { deleteMedia, uploadMedia } from '../../content-actions';

export const metadata: Metadata = { title: 'Media library' };

export default async function Media() {
  await requireAdmin();
  const items = await list<MediaItem>('media');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Media library</p><h1>Your images, <span className="gold">one place.</span></h1></div></div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <ActionForm action={uploadMedia} className="row" reset>
          <input type="file" name="files" multiple accept="image/*,.pdf,.mp4" required style={{ flex: 1, minWidth: 220 }} />
          <input name="alt" placeholder="Description (for accessibility)" style={{ flex: 1, minWidth: 200 }} />
          <Submit>Upload</Submit>
        </ActionForm>
        <p className="help">Images, PDF or MP4, up to 20 MB each. Use only images you own or have permission to use.</p>
      </div>
      {items.length === 0 ? <p className="empty">No files yet.</p> : (
        <div className="grid4">{items.map((m) => {
          const url = `/media/${m.file}`;
          return (
            <div className="panel" key={m.id} style={{ padding: 12 }}>
              {m.type.startsWith('image/') ? <img src={url} alt={m.alt} style={{ width: '100%', height: 140, objectFit: 'contain', background: '#fbf4df', borderRadius: 12 }} /> : <div className="empty" style={{ height: 140 }}>{m.file.split('.').pop()?.toUpperCase()}</div>}
              <p className="small" style={{ margin: '8px 0 4px', overflowWrap: 'anywhere' }}><b>{m.name}</b><br /><span className="muted">{sizeLabel(m.size)}</span></p>
              <div className="row"><CopyButton text={`${SITE.url}${url}`} label="Copy link" /><form action={deleteMedia}><input type="hidden" name="id" value={m.id} /><button className="btn btn-sm btn-ghost btn-danger" type="submit">Delete</button></form></div>
            </div>
          );
        })}</div>
      )}
    </>
  );
}
