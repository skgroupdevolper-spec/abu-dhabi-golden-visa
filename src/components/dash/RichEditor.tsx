'use client';

// Visual editor (what you see is what you get) for articles and text sections. Produces clean HTML.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { MediaPicker } from './MediaPicker';

const toHtml = (v: string) => (/^\s*</.test(v) ? v : v.split(/\n{2,}/).map((b) => (/^## /.test(b) ? `<h2>${b.slice(3)}</h2>` : /^### /.test(b) ? `<h3>${b.slice(4)}</h3>` : /^[-*] /m.test(b) ? `<ul>${b.split('\n').map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')}</ul>` : `<p>${b.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>').replace(/\n/g, '<br>')}</p>`)).join(''));

export function RichEditor({ value, onChange, minHeight = 360 }: { value: string; onChange: (html: string) => void; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState(false);
  const [img, setImg] = useState(false);
  useEffect(() => { if (ref.current && !src) ref.current.innerHTML = toHtml(value || ''); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [src]);
  const emit = () => ref.current && onChange(ref.current.innerHTML);
  const cmd = (c: string, v?: string) => { ref.current?.focus(); document.execCommand(c, false, v); emit(); };
  const B = ({ c, v, t, children }: { c: string; v?: string; t: string; children: React.ReactNode }) => <button type="button" title={t} aria-label={t} onMouseDown={(e) => { e.preventDefault(); cmd(c, v); }}>{children}</button>;
  return (
    <div className="rte">
      <div className="md-bar">
        <B c="formatBlock" v="H2" t="Heading">H2</B><B c="formatBlock" v="H3" t="Sub-heading">H3</B><B c="formatBlock" v="P" t="Paragraph">¶</B>
        <B c="bold" t="Bold"><b>B</b></B><B c="italic" t="Italic"><i>I</i></B><B c="underline" t="Underline"><u>U</u></B>
        <B c="insertUnorderedList" t="Bullet list">• List</B><B c="insertOrderedList" t="Numbered list">1. List</B><B c="formatBlock" v="BLOCKQUOTE" t="Quote">❝</B>
        <B c="justifyLeft" t="Align left">⇤</B><B c="justifyCenter" t="Align centre">↔</B>
        <button type="button" title="Link" onMouseDown={(e) => { e.preventDefault(); const u = prompt('Link address (e.g. /apply/ or https://…)'); if (u) cmd('createLink', u); }}>Link</button>
        <B c="unlink" t="Remove link">Unlink</B>
        <button type="button" title="Image" onMouseDown={(e) => { e.preventDefault(); setImg((x) => !x); }}>Image</button>
        <button type="button" title="Table" onMouseDown={(e) => { e.preventDefault(); cmd('insertHTML', '<table><thead><tr><th>Item</th><th>Details</th></tr></thead><tbody><tr><td>…</td><td>…</td></tr><tr><td>…</td><td>…</td></tr></tbody></table><p></p>'); }}>Table</button>
        <B c="insertHorizontalRule" t="Divider">―</B><B c="removeFormat" t="Clear formatting">Clear</B>
        <B c="undo" t="Undo">↶</B><B c="redo" t="Redo">↷</B>
        <button type="button" className={src ? 'on' : ''} title="HTML source" onMouseDown={(e) => { e.preventDefault(); if (!src) emit(); setSrc((x) => !x); }}>{'</>'}</button>
      </div>
      {img && <div style={{ padding: 8, borderBottom: '1px solid #ece6d6' }}><MediaPicker value="" onChange={(u, alt) => { if (u) cmd('insertHTML', `<figure><img src="${u}" alt="${(alt || '').replace(/"/g, '')}"></figure><p></p>`); setImg(false); }} /></div>}
      {src
        ? <textarea className="mono" style={{ minHeight, border: 0, borderRadius: 0 }} value={value} onChange={(e) => onChange(e.target.value)} />
        : <div ref={ref} className="rte-area" contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit} style={{ minHeight }} />}
      <span hidden><Icon name="text" /></span>
    </div>
  );
}
