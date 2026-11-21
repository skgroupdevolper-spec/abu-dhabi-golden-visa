#!/usr/bin/env python3
"""Builds src/components/ap/ap.css: plain CSS for the utility class names used by the Auto Publisher
screens (src/components/ap/*.tsx), scoped to .ap-root so nothing else in the dashboard changes.
Run again after changing those screens: python3 scripts/ap-css.py"""
import re, glob, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
FILES = glob.glob(os.path.join(ROOT, 'src/components/ap/*.tsx'))
P = '.ap-root'

COLORS = {
    'white': '#ffffff', 'black': '#000000',
    'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937', 'gray-900': '#111827',
    'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-500': '#10b981', 'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46',
    'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-400': '#fbbf24', 'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e',
    'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
    'sky-50': '#f0f9ff', 'sky-100': '#e0f2fe', 'sky-700': '#0369a1', 'sky-800': '#075985',
    # FamilyVisaUAE brand in place of the original site's gold and ink
    'gold': '#c9a227', 'gold-deep': '#8a6a12', 'gold-light': '#f6ecd0', 'ink': '#0d0d0d', 'ink-2': '#1f2937',
}
SCREENS = {'sm': 640, 'md': 768, 'lg': 1024, 'xl': 1280}


def color(name):
    alpha = None
    if '/' in name:
        name, a = name.split('/')
        alpha = int(a) / 100
    if name.startswith('[') and name.endswith(']'):
        return name[1:-1]
    c = COLORS.get(name)
    if not c:
        return None
    if alpha is None:
        return c
    r, g, b = int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)
    return f'rgba({r},{g},{b},{alpha})'


def size(v):
    """Tailwind spacing value: 4 -> 1rem, 0.5 -> .125rem, [22px] -> 22px, full -> 100%."""
    if v.startswith('[') and v.endswith(']'):
        return v[1:-1].replace('_', ' ')
    if v == 'full':
        return '100%'
    if v == 'px':
        return '1px'
    if v == 'auto':
        return 'auto'
    if '/' in v:
        a, b = v.split('/')
        return f'{int(a) / int(b) * 100:g}%'
    try:
        return f'{float(v) * 0.25:g}rem'
    except ValueError:
        return None


TEXT = {'xs': ('.75rem', '1rem'), 'sm': ('.875rem', '1.25rem'), 'base': ('1rem', '1.5rem'), 'lg': ('1.125rem', '1.75rem'), 'xl': ('1.25rem', '1.75rem'), '2xl': ('1.5rem', '2rem'), '3xl': ('1.875rem', '2.25rem')}
WEIGHT = {'normal': 400, 'medium': 500, 'semibold': 600, 'bold': 700, 'extrabold': 800}
RADIUS = {'': '.25rem', 'md': '.375rem', 'lg': '.5rem', 'xl': '.75rem', '2xl': '1rem', 'full': '9999px'}
MAXW = {'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem', '2xl': '42rem', '3xl': '48rem', '6xl': '72rem'}
SHADOW = {'shadow': '0 1px 3px rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1)', 'shadow-sm': '0 1px 2px rgba(0,0,0,.05)', 'shadow-2xl': '0 25px 50px -12px rgba(0,0,0,.25)'}
STATIC = {
    'flex': 'display:flex', 'inline-flex': 'display:inline-flex', 'grid': 'display:grid', 'block': 'display:block', 'inline-block': 'display:inline-block', 'hidden': 'display:none',
    'flex-col': 'flex-direction:column', 'flex-row': 'flex-direction:row', 'flex-wrap': 'flex-wrap:wrap', 'flex-1': 'flex:1 1 0%', 'shrink-0': 'flex-shrink:0', 'grow': 'flex-grow:1',
    'items-center': 'align-items:center', 'items-start': 'align-items:flex-start', 'items-end': 'align-items:flex-end',
    'justify-between': 'justify-content:space-between', 'justify-center': 'justify-content:center', 'justify-end': 'justify-content:flex-end', 'place-items-center': 'place-items:center',
    'relative': 'position:relative', 'absolute': 'position:absolute', 'fixed': 'position:fixed', 'sticky': 'position:sticky', 'inset-0': 'inset:0',
    'overflow-hidden': 'overflow:hidden', 'overflow-y-auto': 'overflow-y:auto', 'truncate': 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
    'whitespace-nowrap': 'white-space:nowrap', 'break-words': 'overflow-wrap:break-word', 'text-left': 'text-align:left', 'text-right': 'text-align:right', 'text-center': 'text-align:center',
    'uppercase': 'text-transform:uppercase', 'underline': 'text-decoration:underline', 'italic': 'font-style:italic', 'font-mono': 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
    'tabular-nums': 'font-variant-numeric:tabular-nums', 'tracking-tight': 'letter-spacing:-.025em', 'tracking-wider': 'letter-spacing:.05em', 'leading-relaxed': 'line-height:1.625',
    'cursor-pointer': 'cursor:pointer', 'cursor-not-allowed': 'cursor:not-allowed', 'select-none': 'user-select:none', 'pointer-events-none': 'pointer-events:none',
    'transition': 'transition:all .15s ease', 'transition-all': 'transition:all .15s ease', 'object-cover': 'object-fit:cover', 'list-disc': 'list-style:disc;padding-left:1.25rem',
    'align-top': 'vertical-align:top', 'min-w-0': 'min-width:0', 'w-full': 'width:100%', 'h-full': 'height:100%', 'w-auto': 'width:auto',
    'border-t': 'border-top:1px solid var(--ap-border,#e5e7eb)', 'border-b': 'border-bottom:1px solid var(--ap-border,#e5e7eb)', 'border': 'border:1px solid var(--ap-border,#e5e7eb)',
    'backdrop-blur-sm': 'backdrop-filter:blur(4px)', 'animate-spin': 'animation:ap-spin 1s linear infinite', 'opacity-50': 'opacity:.5', 'brightness-105': 'filter:brightness(1.05)',
    '-translate-y-1/2': 'transform:translateY(-50%)', 'ms-auto': 'margin-inline-start:auto', 'ring-1': 'outline:1px solid var(--ap-ring,#e5e7eb);outline-offset:-1px',
    'divide-y': '', 'aspect-[4/3]': 'aspect-ratio:4/3', 'border-2': 'border:2px solid var(--ap-border,#e5e7eb)', 'border-dashed': 'border-style:dashed',
}


def rule(cls):
    """CSS declarations for one bare utility (no variants), or None if unknown."""
    if cls in STATIC:
        return STATIC[cls]
    if cls in SHADOW:
        return f'box-shadow:{SHADOW[cls]}'
    m = re.fullmatch(r'shadow-\[(.+)\]', cls)
    if m:
        return 'box-shadow:' + m.group(1).replace('_', ' ')
    m = re.fullmatch(r'(-?)(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|top|right|bottom|left|start|w|h|min-w|max-h|min-h|space-y|space-x)-(.+)', cls)
    if m:
        neg, k, v = m.groups()
        val = size(v)
        if val is None:
            if k == 'max-w' and v in MAXW:
                return f'max-width:{MAXW[v]}'
            return None
        if neg:
            val = f'-{val}'
        props = {'p': ['padding'], 'px': ['padding-left', 'padding-right'], 'py': ['padding-top', 'padding-bottom'], 'pt': ['padding-top'], 'pb': ['padding-bottom'], 'pl': ['padding-left'], 'pr': ['padding-right'], 'ps': ['padding-inline-start'], 'pe': ['padding-inline-end'],
                 'm': ['margin'], 'mx': ['margin-left', 'margin-right'], 'my': ['margin-top', 'margin-bottom'], 'mt': ['margin-top'], 'mb': ['margin-bottom'], 'ml': ['margin-left'], 'mr': ['margin-right'],
                 'gap': ['gap'], 'gap-x': ['column-gap'], 'gap-y': ['row-gap'], 'top': ['top'], 'right': ['right'], 'bottom': ['bottom'], 'left': ['left'], 'start': ['inset-inline-start'],
                 'w': ['width'], 'h': ['height'], 'min-w': ['min-width'], 'max-h': ['max-height'], 'min-h': ['min-height']}
        if k == 'space-y':
            return ('CHILD', f'margin-top:{val}')
        if k == 'space-x':
            return ('CHILD', f'margin-left:{val}')
        return ';'.join(f'{p}:{val}' for p in props[k])
    m = re.fullmatch(r'max-w-(.+)', cls)
    if m:
        v = m.group(1)
        return f'max-width:{MAXW.get(v) or size(v)}' if (MAXW.get(v) or size(v)) else None
    m = re.fullmatch(r'z-\[?(\d+)\]?', cls)
    if m:
        return f'z-index:{m.group(1)}'
    m = re.fullmatch(r'grid-cols-(\d+)', cls)
    if m:
        return f'grid-template-columns:repeat({m.group(1)},minmax(0,1fr))'
    m = re.fullmatch(r'grid-cols-\[(.+)\]', cls)
    if m:
        return 'grid-template-columns:' + m.group(1).replace('_', ' ')
    m = re.fullmatch(r'col-span-(\d+)', cls)
    if m:
        return f'grid-column:span {m.group(1)}/span {m.group(1)}'
    m = re.fullmatch(r'text-(xs|sm|base|lg|xl|2xl|3xl)', cls)
    if m:
        f, l = TEXT[m.group(1)]
        return f'font-size:{f};line-height:{l}'
    m = re.fullmatch(r'text-\[(.+)\]', cls)
    if m:
        v = m.group(1)
        return f'color:{v}' if v.startswith('#') else f'font-size:{v}'
    m = re.fullmatch(r'font-(normal|medium|semibold|bold|extrabold)', cls)
    if m:
        return f'font-weight:{WEIGHT[m.group(1)]}'
    m = re.fullmatch(r'rounded(?:-(md|lg|xl|2xl|full))?', cls)
    if m:
        return f'border-radius:{RADIUS[m.group(1) or ""]}'
    m = re.fullmatch(r'rounded-b-(2xl|xl)', cls)
    if m:
        r = RADIUS[m.group(1)]
        return f'border-bottom-left-radius:{r};border-bottom-right-radius:{r}'
    m = re.fullmatch(r'(text|bg|border|ring|divide)-(.+)', cls)
    if m:
        k, v = m.groups()
        c = color(v)
        if not c:
            return None
        return {'text': f'color:{c}', 'bg': f'background-color:{c}', 'border': f'border-color:{c};--ap-border:{c}', 'ring': f'--ap-ring:{c}', 'divide': ('CHILD', f'border-color:{c}')}[k]
    return None


def esc(cls):
    return re.sub(r'([^a-zA-Z0-9_-])', r'\\\1', cls)


def main():
    classes = set()
    for f in FILES:
        s = open(f).read()
        for m in re.finditer(r"""className=(?:"([^"]*)"|\{`([^`]*)`\})""", s):
            for g in m.groups():
                if g:
                    classes.update(re.sub(r"\$\{|[}?'\"()|&]| : ", ' ', g).split())
        for m in re.finditer(r"""['"`]([^'"`\n]*)['"`]""", s):
            for c in re.sub(r'\$\{[^}]*\}', ' ', m.group(1)).split():
                classes.add(c)
    out = [f'/* Generated by scripts/ap-css.py from the class names in src/components/ap/*.tsx. Do not edit by hand. */',
           '@keyframes ap-spin{to{transform:rotate(360deg)}}',
           f'{P}{{color:#111827;font-size:14px}}',
           f'{P} *,{P} *::before,{P} *::after{{box-sizing:border-box}}',
           f'{P} h1,{P} h2,{P} h3,{P} p{{margin:0}}',
           f'{P} button{{font:inherit;border:0;background:none;cursor:pointer;color:inherit}}',
           f'{P} .divide-y>*+*{{border-top:1px solid var(--ap-divide,#f3f4f6)}}',
           f'{P} .admin-label{{display:block;font-size:.78rem;font-weight:700;color:#4b5563;margin-bottom:.35rem}}',
           f'{P} .admin-input{{display:block;width:100%;padding:.6rem .75rem;border:1px solid #e5e7eb;border-radius:.75rem;background:#fff;font:inherit;font-size:.875rem;color:#111827;outline:0}}',
           f'{P} .admin-input:focus{{border-color:#c9a227;box-shadow:0 0 0 3px rgba(201,162,39,.18)}}',
           f'{P} textarea.admin-input{{resize:vertical}}',
           f'{P} .bg-gold.text-ink{{color:#fff}}',
           f'{P} a{{color:inherit}}']
    known = 0
    for cls in sorted(classes):
        imp = cls.startswith('!')
        base = cls[1:] if imp else cls
        parts = base.split(':')
        util, variants = parts[-1], parts[:-1]
        if any(v not in SCREENS and v not in ('hover', 'disabled', 'focus') for v in variants):
            continue
        r = rule(util)
        if r is None:
            continue
        child = isinstance(r, tuple)
        decl = r[1] if child else r
        if not decl:
            continue
        if util.startswith('divide-'):
            decl = '--ap-divide:' + decl.split(':', 1)[1]
            child = False
        if imp:
            decl = ';'.join(d + '!important' for d in decl.split(';'))
        sel = f'{P} .{esc(cls)}'
        for v in variants:
            if v in ('hover', 'focus'):
                sel += f':{v}'
            elif v == 'disabled':
                sel += ':disabled'
        if child:
            sel += '>*+*'
        css = f'{sel}{{{decl}}}'
        screens = [v for v in variants if v in SCREENS]
        if screens:
            css = f'@media (min-width:{SCREENS[screens[0]]}px){{{css}}}'
        out.append(css)
        known += 1
    # media rules after the plain ones so the wider screens win
    plain = [c for c in out if not c.startswith('@media')]
    media = sorted([c for c in out if c.startswith('@media')], key=lambda c: int(re.search(r'min-width:(\d+)', c).group(1)))
    open(os.path.join(ROOT, 'src/components/ap/ap.css'), 'w').write('\n'.join(plain + media) + '\n')
    print(f'ap.css: {known} classes')


main()
