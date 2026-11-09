'use client';

// One image setting: media-library picker / upload, a live preview and a hidden field for the form.
import { useState } from 'react';
import { MediaPicker } from './MediaPicker';

export function ImageField({ name, label, help, initial, fallback, dark }: { name: string; label: string; help?: string; initial: string; fallback: string; dark?: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <div className="field full img-field">
      <label>{label}</label>
      <div className="img-field-row">
        <div className={`img-prev${dark ? ' dark' : ''}`}><img src={v || fallback} alt="" /></div>
        <div className="img-field-ctl">
          <MediaPicker value={v} onChange={(u) => setV(u)} label={label} />
          <input type="hidden" name={name} value={v} />
          <p className="help">{help} {v ? <button type="button" className="linkish" onClick={() => setV('')}>Use the built-in image</button> : <span className="muted">Using the built-in image.</span>}</p>
        </div>
      </div>
    </div>
  );
}
