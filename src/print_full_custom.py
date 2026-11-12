# PDF лекции с отдельной полной версией (текст преподавателя дословно + «Простыми словами»).
# Запуск из корня репозитория:  python3 src/print_full_custom.py gen-5 src/full_gen5.js GEN5_FULL
# Делает: pdf/<id>.pdf (краткий, window.__printable), pdf/full/<id>.pdf (полный), full/<id>/NN.webp, запись в data_full.js.
# Нужны: playwright + Chrome, pdftoppm, Pillow. Перед запуском — python3 src/build.py.
import asyncio, json, os, re, subprocess, sys, glob, shutil
from playwright.async_api import async_playwright
from PIL import Image

LID, FULLJS, VAR = sys.argv[1], sys.argv[2], sys.argv[3]
SRCNOTE = sys.argv[4] if len(sys.argv) > 4 else 'Текст лекции, рисунки из учебника и плакаты — материалы преподавателя. Схемы и блоки «Простыми словами» добавлены для понимания.'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
FONTS = ''.join(f"@font-face{{font-family:'Golos Text';font-weight:{w};src:url(fonts/golos-text-{s}-{w}-normal.woff2)}}" for w in (400, 500, 600, 700) for s in ('cyrillic', 'latin'))

TEMPLATE = r"""
(full) => {
  const l = window.__lec(LID), s = window.__lecSubj ? window.__lecSubj(LID) : l.subject, blockHTML = window.__blockHTML;
  const esc2 = x => String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const body = full.map(x => `<h2>${esc2(x.title)}</h2>${x.blocks.map(b => blockHTML(b).replace('class="tbl"','')).join('')}`).join('');
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc2(s.short)} — ${esc2(l.title)} (полная версия)</title><style>
FONTS
@page{size:A4;margin:14mm 14mm}
body{font-family:"Golos Text",Inter,Arial,sans-serif;color:#1d2030;line-height:1.5;font-size:10.8pt;max-width:780px;margin:0 auto}
.cover{border-radius:16px;padding:22px 24px;color:#fff;background:linear-gradient(135deg,${s.color},${s.ink});-webkit-print-color-adjust:exact;print-color-adjust:exact;margin-bottom:14px}
.cover .k{font-size:9.5pt;font-weight:700;opacity:.9;text-transform:uppercase;letter-spacing:.05em}
.cover h1{margin:6px 0 6px;font-size:22pt;line-height:1.15} .cover p{margin:0;opacity:.92}
.toc{border:1px solid #e6e4ef;border-radius:12px;padding:10px 16px;margin:0 0 10px;font-size:10pt}
.toc div{margin:2px 0} .toc b{color:${s.ink}}
.legend{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;font-size:8.5pt}
.legend span{padding:3px 8px;border-radius:6px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h2{font-size:15.5pt;margin:24px 0 8px;color:${s.ink};break-after:avoid;border-bottom:2px solid ${s.soft};padding-bottom:4px}
h3{font-size:12pt;margin:16px 0 4px;break-after:avoid;color:${s.color}}
.box{border-radius:8px;padding:7px 12px;margin:8px 0;border-left:4px solid;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.box .tag{display:block;font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.sut{background:#fdecef;border-color:#e0527a}.simple{background:#e7f6ea;border-color:#3f9e5c}.imp{background:#fff4d9;border-color:#e0a000}.fact{background:#eef3ff;border-color:#5b7fd6}
.note{font-size:9.5pt;color:#6a6f82;margin:6px 0} p{margin:6px 0} ul,ol{padding-left:22px;margin:6px 0} li{margin:4px 0} li ul{list-style:circle}
table{border-collapse:collapse;width:100%;font-size:9.4pt;margin:8px 0}
tr{break-inside:avoid}
th{background:${s.soft};color:${s.ink};text-align:left;padding:6px 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
td{padding:6px 8px;border-bottom:1px solid #e6e4ef;vertical-align:top}
figure{text-align:center;margin:10px 0;break-inside:avoid} figure svg{max-width:100%;height:auto} figure.pic img{max-width:94%;max-height:150mm;border-radius:8px;border:1px solid #e6e4ef}
figcaption{font-size:9pt;color:#6a6f82;margin-top:3px} figcaption:empty{display:none}
.rem{background:#fff7d6;border-radius:12px;padding:10px 18px;margin-top:20px;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rem h2{border:0}
.cards{columns:2;column-gap:18px;font-size:9.6pt} .cards div{break-inside:avoid;margin:0 0 7px;padding:6px 9px;border:1px solid #e6e4ef;border-radius:7px}
.quiz{font-size:9.6pt} .quiz div{break-inside:avoid;margin:0 0 6px}
.src{font-size:8.5pt;color:#9aa0ad;margin-top:16px}
</style></head><body>
<div class="cover"><div class="k">${esc2(s.name)} · лекция ${l.num} · полная версия</div><h1>${esc2(l.title)}</h1><p>${esc2(l.sub)}</p><p style="margin-top:6px">👤 ${esc2(s.teacher||'')}</p></div>
<div class="toc">${full.map(x=>`<div><b>•</b> ${esc2(x.title)}</div>`).join('')}<div><b>•</b> Что запомнить · вопросы для самопроверки · тест</div></div>
<div class="legend"><span style="background:#f4f3f8">Обычный текст — лекция преподавателя без изменений</span><span style="background:#e7f6ea">Простыми словами — пояснения для понимания</span><span style="background:#fff4d9">Важно</span></div>
${body}
<div class="rem"><h2 style="margin-top:6px">📌 Что запомнить</h2><ul>${l.remember.map(r=>`<li>${r}</li>`).join('')}</ul></div>
${(l.facts||[]).map(f=>blockHTML(['fact',f])).join('')}
<h2>🃏 Вопросы для самопроверки</h2><div class="cards">${l.cards.map(c=>`<div><b>${c[0]}</b><br>${c[1]}</div>`).join('')}</div>
<h2>✅ Тест с ответами</h2><div class="quiz">${l.quiz.map((q,i)=>`<div><b>${i+1}. ${q.q}</b><br>Ответ: ${q.o[q.a]} — <span style="color:#6a6f82">${q.why}</span></div>`).join('')}</div>
<div class="src">SRCNOTE</div>
</body></html>`;
}
""".replace('FONTS', FONTS).replace('SRCNOTE', SRCNOTE)

async def main():
    full_js = open(os.path.join(ROOT, FULLJS), encoding='utf-8').read()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        pg = await b.new_page()
        await pg.goto('file://' + os.path.join(ROOT, 'index.html'))
        await pg.wait_for_timeout(800)
        short = await pg.evaluate(f"window.__printable({json.dumps(LID)})")
        await pg.add_script_tag(content=full_js + f"\nwindow.__FULLDATA = {VAR};")
        fullhtml = await pg.evaluate(TEMPLATE.replace('LID', json.dumps(LID)).strip(), await pg.evaluate("window.__FULLDATA"))
        for name, html, out in (('short', short, f'pdf/{LID}.pdf'), ('full', fullhtml, f'pdf/full/{LID}.pdf')):
            tmp = os.path.join(ROOT, f'_print_{name}.html')
            open(tmp, 'w', encoding='utf-8').write(html)
            q = await b.new_page()
            await q.goto('file://' + tmp); await q.wait_for_timeout(700)
            await q.pdf(path=os.path.join(ROOT, out), format='A4', print_background=True, prefer_css_page_size=True)
            await q.close(); os.remove(tmp)
            print('PDF:', out)
        await b.close()

asyncio.run(main())
# страницы полной версии
d = os.path.join(ROOT, 'full', LID); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
subprocess.run(['pdftoppm', '-r', '120', '-png', os.path.join(ROOT, 'pdf/full', LID + '.pdf'), os.path.join(d, 'p')], check=True)
sizes = []
for i, f in enumerate(sorted(glob.glob(os.path.join(d, 'p-*.png'))), 1):
    im = Image.open(f).convert('RGB')
    if im.width != 1100: im = im.resize((1100, round(im.height * 1100 / im.width)), Image.LANCZOS)
    im.save(os.path.join(d, f'{i:02d}.webp'), quality=74, method=6); os.remove(f); sizes.append([im.width, im.height])
# запись в data_full.js
fp = os.path.join(ROOT, 'src/data_full.js'); src = open(fp, encoding='utf-8').read()
m = re.match(r'const FULL = (\{.*\});\s*$', src, re.S); full = json.loads(m.group(1))
full[LID] = {'pages': len(sizes), 'dir': f'full/{LID}', 'pdf': f'pdf/full/{LID}.pdf', 'note': 'Полная версия: текст лекции преподавателя без изменений + иллюстрации + пояснения «Простыми словами».', 'sizes': sizes}
open(fp, 'w', encoding='utf-8').write('const FULL = ' + json.dumps(full, ensure_ascii=False) + ';\n')
print('страниц:', len(sizes))
