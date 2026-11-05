import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/server/auth';
import { list, type Note } from '@/lib/server/collections';
import { when } from '@/lib/stages';
import { openNote, readAllNotes } from '../../settings-actions';

export const metadata: Metadata = { title: 'Notifications' };
const IC: Record<Note['kind'], string> = { lead: '✉', message: '✎', upload: '⇪', quote: '✓', customer: '☺', request: '◇', whatsapp: '✆', chat: '✦', booking: '◷' };

export default async function Notes() {
  await requireAdmin();
  const notes = await list<Note>('notifications');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Notifications</p><h1>What happened <span className="gold">while you were away.</span></h1></div>
        <form action={readAllNotes}><button className="btn" type="submit">Mark all as read</button></form></div>
      {notes.length === 0 ? <p className="empty">Nothing yet.</p> : (
        <div className="files">
          {notes.slice(0, 300).map((n) => (
            <form key={n.id} action={openNote}><input type="hidden" name="id" value={n.id} />
              <button type="submit" className="file" style={{ width: '100%', textAlign: 'start', cursor: 'pointer', font: 'inherit', background: n.read ? '#fff' : '#fffaf0' }}>
                <span className="fi">{IC[n.kind]}</span><span className="fn"><b>{n.text}</b><small>{when(n.at)}</small></span>{!n.read && <span className="pill new">New</span>}
              </button>
            </form>
          ))}
        </div>
      )}
    </>
  );
}
