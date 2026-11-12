# Подписи на рендере: python3 label.py spec.json  (spec: [{img, out, title, labels:[[text, x, y, lx, ly, color?]], marks:[[x,y,r]]}])
import asyncio, json, sys, base64, os
from playwright.async_api import async_playwright
FONT = '/home/claude/stomatologi/fonts'
def page(s):
    W, H = s.get('w', 1200), s.get('h', 900)
    P = s.get('pad', 0); FS = s.get('fs', 27)
    img = base64.b64encode(open(s['img'], 'rb').read()).decode()
    els = []
    for m in s.get('marks', []):   # красные зоны (места переломов)
        x, y, r = m[:3]; x += P; t = m[3] if len(m) > 3 else ''
        els.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="rgba(226,59,59,.18)" stroke="#e23b3b" stroke-width="4" stroke-dasharray="10 7"/>')
        if t: els.append(f'<text x="{x}" y="{y+6}" font-size="26" font-weight="800" fill="#c62828" text-anchor="middle">{t}</text>')
    for L in s.get('labels', []):
        t, x, y, lx, ly = L[:5]; x += P; lx += P; col = L[5] if len(L) > 5 else '#2b2f45'
        anchor = 'end' if lx < x else 'start'
        els.append(f'<line x1="{x}" y1="{y}" x2="{lx}" y2="{ly}" stroke="{col}" stroke-width="2.5"/><circle cx="{x}" cy="{y}" r="7" fill="{col}" stroke="#fff" stroke-width="2.5"/>')
        lines = t.split('|'); dy = -(len(lines) - 1) * round(FS*0.56)
        for k, ln in enumerate(lines):
            els.append(f'<text x="{lx + (-10 if anchor=="end" else 10)}" y="{ly + round(FS*0.33) + dy + k*round(FS*1.12)}" font-size="{FS}" font-weight="{700 if k==0 else 500}" fill="{col}" text-anchor="{anchor}" paint-order="stroke" stroke="#fff" stroke-width="{round(FS/3.5)}" stroke-linejoin="round">{ln}</text>')
    return f'''<html><head><meta charset="utf-8"><style>@font-face{{font-family:G;src:url(file://{FONT}/golos-text-cyrillic-500-normal.woff2)}}@font-face{{font-family:G;font-weight:700;src:url(file://{FONT}/golos-text-cyrillic-700-normal.woff2)}}
body{{margin:0;background:#fff;font-family:G,sans-serif}}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" style="font-family:G,sans-serif">
<rect width="{W}" height="{H}" fill="#fff"/><image href="data:image/png;base64,{img}" x="{P}" y="{s.get('iy',0)}" width="{W - 2*P}" height="{s.get('ih',H)}"/>
{''.join(els)}</svg></body></html>'''
async def main(specs):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for s in specs:
            W, H = s.get('w', 1200), s.get('h', 900)
            pg = await b.new_page(viewport={'width': W, 'height': H})
            open('/tmp/lab.html', 'w', encoding='utf-8').write(page(s))
            await pg.goto('file:///tmp/lab.html'); await pg.wait_for_timeout(300)
            await pg.screenshot(path='/tmp/lab.png', clip={'x': 0, 'y': 0, 'width': W, 'height': H})
            from PIL import Image
            from PIL import ImageChops
            im = Image.open('/tmp/lab.png').convert('RGB')
            bb = ImageChops.difference(im, Image.new('RGB', im.size, 'white')).getbbox()
            m = 30; im = im.crop((max(0, bb[0]-m), max(0, bb[1]-m), min(W, bb[2]+m), min(H, bb[3]+m)))
            if im.width > 1400: im = im.resize((1400, round(1400 * im.height / im.width)))
            im.save(s['out'], 'WEBP', quality=82)
            print('ok', s['out'])
            await pg.close()
        await b.close()
asyncio.run(main(json.load(open(sys.argv[1]))))
