'use client';

// Two-click delete (no browser pop-up): first click arms the button, second click submits.
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

export function DeleteButton({ label = 'Delete', confirm = 'Click again to delete', className = 'btn btn-sm btn-danger', name, value, title }: { label?: string; confirm?: string; className?: string; name?: string; value?: string; title?: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} title={title} aria-label={title} className={`${className}${armed ? ' armed' : ''}`} disabled={pending} aria-live="polite"
      onClick={(e) => { if (!armed) { e.preventDefault(); setArmed(true); setTimeout(() => setArmed(false), 4000); } }}>
      {pending ? '…' : armed ? confirm : label}
    </button>
  );
}
