import urllib.parse, re, glob, os
# --- линейные иконки 48×48 ---
ICONS = {
 'tooth': '<path d="M15 7c-6 0-9 5-9 11 0 7 4 10 5 18 1 5 2 9 5 9 4 0 3-9 6-12 1-1 3-1 4 0 3 3 2 12 6 12 3 0 4-4 5-9 1-8 5-11 5-18 0-6-3-11-9-11-4 0-6 2-9 2s-5-2-9-2z"/>',
 'dna': '<path d="M14 4c0 10 20 12 20 22s-20 12-20 22M34 4c0 10-20 12-20 22s20 12 20 22"/><path d="M17 11h14M15 18h18M17 33h14M15 40h18" opacity=".7"/>',
 'bone': '<path d="M13 9a5 5 0 0 0-4 9 5 5 0 0 0 7 5l9 9a5 5 0 0 0 5 7 5 5 0 0 0 9-4 5 5 0 0 0-5-7l-9-9a5 5 0 0 0-7-5 5 5 0 0 0-5-5z"/>',
 'microbe': '<circle cx="24" cy="24" r="10"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/><circle cx="21" cy="22" r="2"/><circle cx="27" cy="27" r="1.5"/>',
 'molecule': '<circle cx="12" cy="34" r="5"/><circle cx="36" cy="34" r="5"/><circle cx="24" cy="12" r="5"/><path d="M15 30l6-14M33 30l-6-14M17 34h14"/>',
 'pill': '<rect x="8" y="17" width="32" height="14" rx="7" transform="rotate(-35 24 24)"/><path d="M19 31l10-14" transform="translate(0 0)"/>',
}
def svg(body, w, h, color, sw=2, op=1):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}">{body}</svg>'
    return 'url("data:image/svg+xml,' + urllib.parse.quote(s) + '")'
def place(name, x, y, sc=1, rot=0):
    return f'<g transform="translate({x} {y}) rotate({rot} {24*sc} {24*sc}) scale({sc})">{ICONS[name]}</g>'
def pattern(color, op):
    body = ''.join([place('tooth',10,12,.8,-12), place('dna',120,8,.8,18), place('microbe',200,90,.7,0),
                    place('bone',60,110,.8,30), place('molecule',150,170,.7,-10), place('pill',20,200,.7,0)])
    return svg(body, 260, 260, color, 1.6, op)
def hero(color, op):
    body = ''.join([place('tooth',150,6,2.3,-8), place('dna',60,20,1.9,14), place('microbe',8,96,1.2,0), place('bone',238,104,1.1,40)])
    return svg(body, 300, 210, color, 1.4, op)
def fontfaces(fams):
    out = []
    for pkg, weights in fams:
        d = glob.glob(f'/home/claude/fontsrc/fontsource-{pkg}-*/package')[0]
        for w in weights:
            for sub in ('cyrillic', 'latin'):
                css = open(f'{d}/{sub}-{w}.css').read() if os.path.exists(f'{d}/{sub}-{w}.css') else None
                if css is None: continue
                css = re.sub(r'url\(\./files/([^)]+)\)', r'url(fonts/\1)', css)
                css = re.sub(r',\s*url\([^)]*\.woff\)\s*format\(.woff.\)', '', css)
                out.append(css.strip())
    return '\n'.join(out)
