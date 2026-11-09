# Оформление сайта: python3 src/build_theme.py → src/theme.css (его вшивает build.py).
# Тема «Яркий» + ночной режим: html[data-theme=dark]. Режим выбирает кнопка ☀️/🌙, по умолчанию — как на телефоне.
# Шрифты лежат в fonts/ (Unbounded — заголовки, Golos Text — текст), орнамент — линейные иконки из theme_ornament.py.
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
from theme_ornament import pattern, hero

FONTS = [('unbounded', 'Unbounded', [600, 700, 800]), ('golos-text', 'Golos Text', [400, 500, 600, 700])]
CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'
LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
ff = []
for pkg, fam, ws in FONTS:
    for w in ws:
        for sub, rng in (('cyrillic', CYR), ('latin', LAT)):
            ff.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-display:swap;font-weight:{w};src:url(fonts/{pkg}-{sub}-{w}-normal.woff2) format('woff2');unicode-range:{rng}}}")

LIGHT = """
/* ===== тема «Яркий» ===== */
:root{--bg:#f6f2ff;--card:rgba(255,255,255,.8);--card-solid:#fff;--ink:#1b1736;--muted:#6d6890;--line:#e7e2f7;--r:22px;
  --shadow:0 1px 2px rgba(60,40,140,.06),0 14px 34px -16px rgba(90,60,200,.32);--glass:rgba(255,255,255,.9);
  --hl1:#6b4cff;--hl2:#ff4f9a;--hl3:#ff9f1c}
html,body{font-family:"Golos Text",Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
body{background:radial-gradient(60vw 50vw at 0% 0%,#ffd6ec 0,transparent 60%),radial-gradient(60vw 50vw at 100% 10%,#d4e6ff 0,transparent 60%),radial-gradient(70vw 60vw at 50% 100%,#ffe9c7 0,transparent 60%),var(--bg);background-attachment:fixed;min-height:100vh}
body::before{content:"";position:fixed;inset:0;background:PATTERN_L;pointer-events:none;z-index:-1}
h1,h2,h3,.top-title,.subj h3,.quick-btn b,.lec b,.tab,.section-label,.qq,.done h3,.face .txt,.q-card h3,.remember h2,.lec-head .kicker,.qchip,.primary,.secondary,.mode button,.vw-count{font-family:"Unbounded","Golos Text",sans-serif;letter-spacing:-.01em}
.top{background:rgba(246,242,255,.62)}
.subj,.lec:not(.soon),.continue,.sec,.toc,.res,.q-card,.chip,.tab,.back,.icon-btn,.search input,.outlink,.navrow button,.qbest,.qalt,.qtips,.mode,.done,.qchip,.fullcard,.face.ffront{backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--glass)}
.search svg{z-index:1}
/* главная */
.hero{isolation:isolate;position:relative;padding:22px 4px 10px}
.hero::after{content:"";position:absolute;right:-22px;top:-10px;width:240px;height:168px;background:HERO_L no-repeat;background-size:240px 168px;z-index:-1}
.hero h1{font-size:44px;font-weight:800;line-height:1.02;background:linear-gradient(100deg,var(--hl1),var(--hl2) 55%,var(--hl3));-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:4px}
.hero small{display:inline-block;background:var(--card-solid);border-radius:20px;padding:5px 12px;font-size:12px;color:var(--hl1);box-shadow:var(--shadow)}
.hero p{max-width:28ch}
.subjects{gap:14px}
.subj{background:linear-gradient(145deg,var(--c),var(--ci));color:#fff;border:0;min-height:170px;box-shadow:0 18px 30px -16px var(--c)}
.subj::before{content:"";position:absolute;right:-30px;top:-30px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.14)}
.subj::after{content:"";position:absolute;right:20px;bottom:-40px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.1)}
.subj .em{background:rgba(255,255,255,.22)!important;width:54px;height:54px;font-size:28px;border-radius:18px}
.subj .teacher,.subj .meta{color:rgba(255,255,255,.88)} .subj .chev{color:#fff} .subj .bar{display:none}
.subj h3{font-size:16px;font-weight:700}
.quick-btn{background:linear-gradient(120deg,#ffd23f,#ff8a3d 60%,#ff4f9a);color:#2a1300;border-radius:24px;padding:18px;position:relative;overflow:hidden}
.quick-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 45%,transparent 60%);transform:translateX(-100%);animation:shine 3.5s infinite}
@keyframes shine{60%,100%{transform:translateX(100%)}}
@media (prefers-reduced-motion:reduce){.quick-btn::after{animation:none;display:none}}
.install{background:linear-gradient(135deg,#ece5ff,#ffe6f1)}
.section-label{font-size:12px;color:#7c6bd6}
/* предмет и лекция */
.subj-head{border-radius:28px;box-shadow:0 20px 34px -18px rgba(60,40,140,.6)}
.subj-head::after{content:"";position:absolute;right:-20px;bottom:-34px;width:300px;height:210px;background:HERO_W no-repeat;opacity:.45;pointer-events:none}
.lec .n{border-radius:16px;font-family:"Unbounded",sans-serif}
.tabs{background:transparent;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.tab{border-radius:16px;font-size:13px}
.tab.on,.primary,.face.fback,.fab-top{background:linear-gradient(135deg,var(--acc),#ff4f9a)}
.tab.on{box-shadow:0 10px 20px -10px var(--acc)}
.lec-head h1{font-size:25px;font-weight:700}
.sec h2{font-size:18px;font-weight:700}
.box{border-left:0;border-radius:18px}
.remember{background:linear-gradient(140deg,#fff3c4,#ffe0ef)}
.note{background:rgba(255,255,255,.6)}
.opt{background:var(--card-solid)}
.qchip.on{background:linear-gradient(135deg,#6b4cff,#ff4f9a);color:#fff;border-color:transparent}
.qbest{border-top-width:5px}
.pg{border-radius:16px}
.face{border-radius:26px}
/* шутки */
.joke{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:12px 0 0;padding:11px 12px 11px 14px;border-radius:18px;background:var(--card);border:1px dashed #c9bdf5;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-size:14px;line-height:1.4;color:var(--ink)}
.joke .jk-ic{font-size:20px;flex:none}
.joke .jk-t{flex:1;font-style:italic}
.joke .jk-dice{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:var(--card-solid);box-shadow:var(--shadow);font-size:17px}
.joke.jk-roll .jk-dice{animation:dice .45s ease}
.joke.jk-roll .jk-t{animation:jkfade .32s ease}
@keyframes dice{50%{transform:rotate(200deg) scale(1.15)}100%{transform:rotate(360deg)}}
@keyframes jkfade{50%{opacity:0;transform:translateY(4px)}}
.done-joke{font-style:italic;color:var(--muted);font-size:14px;margin:-8px 0 16px!important}
.empty small{display:block;margin-top:6px;font-size:13px;opacity:.8}
"""

DARK = """
:root{color-scheme:dark;--bg:#0b0d1a;--card:rgba(22,25,44,.78);--card-solid:#161a2e;--ink:#eceeff;--muted:#9aa0c4;--line:#272c4a;--glass:rgba(255,255,255,.06);
  --shadow:0 0 0 1px rgba(255,255,255,.03),0 16px 34px -18px rgba(0,0,0,.85);
  --sut:rgba(233,88,130,.13);--sut-b:#ff6b98;--simple:rgba(70,190,120,.13);--simple-b:#4cd38a;--imp:rgba(255,190,60,.13);--imp-b:#ffc247;--fact:rgba(100,140,255,.14);--fact-b:#7ea2ff;
  --hl1:#b19dff;--hl2:#ff7ab6;--hl3:#ffc061}
html,body{background:var(--bg);color:var(--ink)}
body{background:radial-gradient(70vw 60vw at -10% -10%,rgba(123,97,214,.32),transparent 60%),radial-gradient(60vw 50vw at 110% 25%,rgba(255,79,154,.14),transparent 60%),radial-gradient(70vw 60vw at 50% 110%,rgba(0,190,200,.12),transparent 60%),var(--bg);background-attachment:fixed}
body::before{background:PATTERN_D}
a{color:color-mix(in srgb,var(--acc) 55%,#fff)}
.top{background:rgba(11,13,26,.7)}
.hero::after{background-image:HERO_D}
.hero small{color:#c8bcff}
.subj{box-shadow:0 18px 34px -18px color-mix(in srgb,var(--c) 70%,#000)}
.install{background:linear-gradient(135deg,#1d1b3d,#2a1830);color:var(--ink)}
.section-label{color:#a99bff}
.chev{color:#5d6390}
.lec .n,.continue .em{background:color-mix(in srgb,var(--acc) 30%,#161a2e)!important;color:#fff!important}
.lec-head .kicker,.sec h2 .num{color:color-mix(in srgb,var(--acc) 60%,#fff)}
.mode button.on,.secondary{background:color-mix(in srgb,var(--acc) 26%,#161a2e);color:#fff}
th{background:color-mix(in srgb,var(--acc) 26%,#161a2e);color:#fff}
td{border-bottom-color:var(--line)}
.box.sut .tag{color:#ff8db0}.box.simple .tag{color:#6fe0a3}.box.imp .tag{color:#ffd27a}.box.fact .tag{color:#a9c1ff}
.note{background:rgba(255,255,255,.05)}
.remember{background:linear-gradient(160deg,#2b2412,#2a1626);border:1px solid #4a3d16}
.opt{background:var(--card-solid);color:var(--ink);border-color:var(--line)}
.opt.right{background:rgba(70,190,120,.18);border-color:#4cd38a}.opt.wrong{background:rgba(230,70,70,.18);border-color:#ff6b6b}
.why.ok{background:rgba(70,190,120,.15)}.why.bad{background:rgba(230,70,70,.15)}
.btn-no{background:#3a1b24;color:#ff9aa8}.btn-yes{background:#16331f;color:#7ee2a0}
.pbar{background:var(--line)}
mark{background:#7a5f00;color:#fff}
.search input{background:var(--card-solid);border-color:var(--line);color:var(--ink)}
.fullcard{background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 22%,#161a2e),#161a2e);color:var(--ink)}
.sheet{background:var(--card-solid)}.sheet .os{background:#1d2140}
.scrim{background:rgba(0,0,0,.55)}
.toast{background:#2a2f52}
.lec.soon{border-color:var(--line)}
.link-btn{color:#c8bcff}
.qopen{color:#c8bcff}
.joke{border-color:#3b3570}
"""

def scope(block, P):
    out = []
    for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', block):
        sels = []
        for sel in m.group(1).split(','):
            sel = sel.strip()
            if not sel or sel.startswith('/*'): sel = re.sub(r'/\*.*?\*/', '', sel, flags=re.S).strip()
            if not sel: continue
            sels.append(P if sel in (':root', 'html') else P + ' body' if sel == 'body' else P + ' ' + sel)
        out.append(','.join(sels) + '{' + m.group(2) + '}')
    return '\n'.join(out)
css = '\n'.join(ff) + LIGHT + '\n/* ===== ночной режим ===== */\n' + scope(DARK, 'html[data-theme=dark]') + """
.theme-btn{width:40px;padding:0;justify-content:center;font-size:18px}
html.theme-anim *,html.theme-anim *::before{transition:background-color .35s,color .35s,border-color .35s!important}
"""
css = (css.replace('PATTERN_L', pattern('#7b61d6', .08)).replace('PATTERN_D', pattern('#9d8fff', .07))
          .replace('HERO_L', hero('#7b61d6', .5)).replace('HERO_D', hero('#a99bff', .55)).replace('HERO_W', hero('#ffffff', 1)))
open(os.path.join(here, 'theme.css'), 'w', encoding='utf-8').write(css)
print('theme.css:', len(css) // 1024, 'КБ')
