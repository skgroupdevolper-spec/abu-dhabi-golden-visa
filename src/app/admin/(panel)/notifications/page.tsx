import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { clearItems, deleteItems } from '@/app/admin/delete-actions';
import { myScope } from '@/lib/server/scope';
import { list, type Note } from '@/lib/server/collections';
import { when } from '@/lib/stages';
import { openNote, readAllNotes } from '../../settings-actions';

export const metadata: Metadata = { title: 'Notifications' };
const IC: Record<Note['kind'], string> = { lead: '✉', message: '✎', upload: '⇪', quote: '✓', customer: '☺', request: '◇', whatsapp: '✆', chat: '✦', booking: '◷', payment: '₳' };

export default async function Notes() {
  const sc = await myScope();
  const notes = (await list<Note>('notifications')).filter(sc.note);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Notifications</p><h1>What happened <span className="gold">while you were away.</span></h1></div>
        <div className="row">
          <form action={readAllNotes}><button className="btn" type="submit">Mark all as read</button></form>
          {sc.full && notes.some((n) => n.read) && <form action={clearItems}><input type="hidden" name="kind" value="notifications" /><input type="hidden" name="scope" value="read" /><DeleteButton label="Delete read" className="btn btn-danger" /></form>}
          {notes.length > 0 && <form action={clearItems}><input type="hidden" name="kind" value="notifications" /><input type="hidden" name="scope" value="all" /><DeleteButton label="Delete all" className="btn btn-danger" /></form>}
        </div></div>
      {notes.length === 0 ? <p className="empty">Nothing yet.</p> : (
        <div className="files">
          {notes.slice(0, 300).map((n) => (
            <div key={n.id} className="row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'stretch' }}>
              <form action={openNote} style={{ flex: 1, minWidth: 0 }}><input type="hidden" name="id" value={n.id} />
                <button type="submit" className="file" style={{ width: '100%', textAlign: 'start', cursor: 'pointer', font: 'inherit', background: n.read ? '#fff' : '#fffaf0' }}>
                  <span className="fi">{IC[n.kind]}</span><span className="fn"><b>{n.text}</b><small>{when(n.at)}</small></span>{!n.read && <span className="pill new">New</span>}
                </button>
              </form>
              {sc.full && <form action={deleteItems} className="row-del"><input type="hidden" name="kind" value="notifications" /><input type="hidden" name="id" value={n.id} /><DeleteButton label="✕" confirm="Delete?" /></form>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
