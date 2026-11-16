'use client';

// A message box with WhatsApp formatting: bold, italic, strike, monospace, quote, list, new line and emojis,
// plus a live preview that looks like the WhatsApp bubble the client will see.
// WhatsApp itself has no colours or font sizes, so those are not offered.
import { useRef, useState } from 'react';
import { waHtml } from '@/lib/wa-format';

const EMOJI: [string, string[]][] = [
  ['Popular', '✅ 📄 💳 📅 📍 ⏳ 🎉 🙏 🌹 👉 📞 ⚠️ ⭐ 🔔 📌 ✨ 💼 🏠 🆔 🛂'.split(' ')],
  ['Smileys', '😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🥵 🥶 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠'.split(' ')],
  ['Hands & people', '👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💪 👀 🧑 👨 👩 👪 👨‍👩‍👧 👨‍👩‍👧‍👦 👶 🧒 👦 👧 🧑‍💼 👨‍💼 👩‍💼 🧑‍⚕️ 👮 🕵️ 🧕 🤵 👰'.split(' ')],
  ['Hearts & symbols', '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✔️ ☑️ ✅ ❌ ❎ ➕ ➖ ➗ ✖️ ❗ ❓ ‼️ ⁉️ 💯 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🔶 🔷 🔸 🔹 ▶️ ⏩ ⏪ 🔼 🔽 ⬆️ ⬇️ ➡️ ⬅️ ↗️ ↘️ 🔄 🆕 🆗 🆙 🆓 ℹ️ 🔟 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ ©️ ®️ ™️'.split(' ')],
  ['Work & money', '💼 📁 📂 🗂️ 📄 📃 📑 🧾 📊 📈 📉 🗒️ 📝 ✏️ 🖊️ 🖋️ 📎 🖇️ 📌 📍 ✂️ 🗃️ 🗄️ 🗑️ 🔒 🔓 🔑 🗝️ 🏷️ 💳 💰 💵 💶 💷 💸 🪙 🏦 🧮 💹 📧 📨 📩 📤 📥 📦 📬 📮 🖨️ 💻 🖥️ ⌨️ 📱 ☎️ 📞 📠 🔔 📢 📣 ⏰ ⏱️ ⌛ ⏳ 📅 📆 🗓️'.split(' ')],
  ['Travel & places', '✈️ 🛫 🛬 🛂 🛃 🛄 🛅 🧳 🌍 🌎 🌏 🗺️ 🧭 🏙️ 🌆 🌇 🏢 🏬 🏛️ 🕌 🏠 🏡 🏘️ 🏗️ 🏥 🏫 🏨 🏪 🚗 🚕 🚙 🚌 🚆 🚇 🚢 ⛴️ 🚀 🏝️ 🏖️ 🏜️ ⛰️ 🌅 🌄 🌙 ☀️ ⭐ 🌟 🌈 ☁️ 🌧️ ⛈️ 🔥 💧 🌊'.split(' ')],
  ['Celebrate & nature', '🎉 🎊 🎈 🎁 🎀 🏆 🥇 🥈 🥉 🏅 🎖️ 🎗️ 🎯 ✨ 🎆 🎇 🌹 🌷 🌸 💐 🌺 🌻 🌼 🍀 🌿 🌴 🌵 🍃 🐪 🦅 🐎 ☕ 🍵 🍰 🎂 🍫 🍬 🥤 🍽️'.split(' ')],
  ['Flags', '🇦🇪 🇸🇦 🇶🇦 🇰🇼 🇧🇭 🇴🇲 🇵🇰 🇮🇳 🇧🇩 🇱🇰 🇳🇵 🇵🇭 🇮🇩 🇪🇬 🇯🇴 🇱🇧 🇸🇾 🇮🇶 🇮🇷 🇹🇷 🇬🇧 🇺🇸 🇨🇦 🇦🇺 🇩🇪 🇫🇷 🇮🇹 🇪🇸 🇳🇱 🇷🇺 🇺🇦 🇨🇳 🇯🇵 🇰🇷 🇳🇬 🇰🇪 🇺🇬 🇿🇦 🏳️ 🏴 🏁'.split(' ')],
];

type Props = { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; name?: string; label?: string; id?: string };

export function WaEditor({ value, onChange, rows = 3, placeholder, name, label, id }: Props) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const [emo, setEmo] = useState(false);
  const [cat, setCat] = useState('Popular');
  const wrap = (a: string, b = a, empty = 'text') => {
    const el = ta.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = value.slice(s, e) || empty;
    const next = value.slice(0, s) + a + sel + b + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + a.length, s + a.length + sel.length); });
  };
  const insert = (x: string) => {
    const el = ta.current;
    if (!el) return onChange(value + x);
    const s = el.selectionStart;
    onChange(value.slice(0, s) + x + value.slice(el.selectionEnd));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + x.length, s + x.length); });
  };
  const linePrefix = (p: string) => {
    const el = ta.current;
    const s = el ? el.selectionStart : value.length;
    const start = value.lastIndexOf('\n', s - 1) + 1;
    onChange(value.slice(0, start) + p + value.slice(start));
  };
  return (
    <div className="wt">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="wt-bar" role="toolbar" aria-label="WhatsApp formatting">
        <button type="button" title="Bold (*text*)" onClick={() => wrap('*')}><b>B</b></button>
        <button type="button" title="Italic (_text_)" onClick={() => wrap('_')}><i>I</i></button>
        <button type="button" title="Strike (~text~)" onClick={() => wrap('~')}><s>S</s></button>
        <button type="button" title="Monospace (```text```)" onClick={() => wrap('```')}><code>{'</>'}</code></button>
        <button type="button" title="Quote line (> )" onClick={() => linePrefix('> ')}>❝</button>
        <button type="button" title="List item (- )" onClick={() => linePrefix('- ')}>•</button>
        <button type="button" title="New line (same as <br>)" onClick={() => insert('\n')}>↵</button>
        <button type="button" title="Emoji" aria-expanded={emo} onClick={() => setEmo((v) => !v)}>🙂</button>
        {emo && (
          <span className="wt-emo" role="dialog" aria-label="Emojis">
            <span className="wt-emo-tabs">{EMOJI.map(([g, list]) => <button type="button" key={g} className={g === cat ? 'on' : ''} title={g} onClick={() => setCat(g)}>{list[0]}</button>)}</span>
            <span className="wt-emo-h">{cat}</span>
            <span className="wt-emo-grid">{(EMOJI.find(([g]) => g === cat)?.[1] ?? []).map((x, i) => <button type="button" key={x + i} onClick={() => insert(x)}>{x}</button>)}</span>
            <small className="wt-emo-tip">Tip: your keyboard&rsquo;s own emoji panel works too (Windows&nbsp;+&nbsp;. or Ctrl&nbsp;+&nbsp;Cmd&nbsp;+&nbsp;Space).</small>
          </span>
        )}
      </div>
      <textarea ref={ta} id={id} name={name} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <div className="wt-prev" aria-label="Preview on WhatsApp"><span className="wt-tag">WhatsApp preview</span><div className="wt-bub" dangerouslySetInnerHTML={{ __html: waHtml(value || placeholder || '') }} /></div>
    </div>
  );
}

/** Same editor for plain server forms (keeps its own state, posts under `name`). */
export function WaText({ name, value = '', rows = 3, label, placeholder, help }: { name: string; value?: string; rows?: number; label?: string; placeholder?: string; help?: string }) {
  const [v, setV] = useState(value);
  return (
    <div className="field full">
      <WaEditor name={name} id={name} value={v} onChange={setV} rows={rows} label={label} placeholder={placeholder} />
      {help && <small className="help">{help}</small>}
    </div>
  );
}
