# Текст полных версий для «Быстрого ответа»: python3 src/build_fulltext.py  (из корня репозитория)
# Нужен pdftotext (poppler-utils). Результат — fulltext.json в корне; потом запустить build.py.
import json, os, re, subprocess, html

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
src = open(os.path.join(here, 'data_full.js'), encoding='utf-8').read()
FULL = json.loads(src[src.index('{'):src.rindex('}') + 1])

# служебные строки страниц (колонтитулы, номера)
JUNK = re.compile(r'^(Page \d+ of \d+|Анатомия · Зубы \d+|\d{1,2}|Основы наследственности:.*|Скрыть подписи.*)$')
HEAD = re.compile(r'^(\d{1,2}(\.\d{1,2})?\.?|★)\s+([А-ЯЁ][а-яё][^—]{2,68})$')

def is_title(l):
    # одиночная строка-заголовок: «Холодовая цепь», «Требования к вакцинам»
    return (4 <= len(l) <= 60 and re.match(r'^[А-ЯЁA-Z][а-яёa-z]', l) and len(l.split()) >= 2
            and not re.search(r'[.:;,!?)]$', l) and ' — ' not in l and ':' not in l and '→' not in l
            and not re.search(r'\d', l) and not JUNK.match(l))

GENERIC = {'простыми словами', 'что делать', 'что это', 'примеры', 'примеры из лекции', 'лимфоцит зоя', 'эритроцит валера',
           'профессор макрофаг', 'число доз', 'кто объясняет', 'интересный факт', 'уточнение к лекции', 'важно',
           'определение из лекции', 'важно / медицинское значение', 'что с хромосомами', 'где находится', 'защита', 'встреча'}

def clean_par(p):
    lines = [l.strip() for l in p.split('\n')]
    lines = [l for l in lines if l and not JUNK.match(l)]
    return ' '.join(lines).strip()

def chunks_of(pars, limit=520):
    """pars: список (заголовок, текст) → список (заголовок, фрагмент)"""
    out, cur, ch = [], '', ''
    for h, p in pars:
        if not p: continue
        if cur and len(cur) + len(p) > limit and len(cur) > 120:
            out.append((ch, cur)); cur, ch = p, h
        else:
            if not cur: ch = h
            cur = (cur + ' ' + p).strip()
    if cur: out.append((ch, cur))
    return [(h, c) for h, c in out if len(re.findall(r'[а-яёa-z]{3,}', c, re.I)) >= 6]

def pdf_pages(path, n):
    for i in range(1, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), path, '-'], capture_output=True, text=True).stdout
        yield i, t

items = []
def add_pdf(lid, d, pdf, n):
    head = ''
    for i, t in pdf_pages(os.path.join(root, pdf), n):
        pars = []
        for raw in re.split(r'\n\s*\n', t):
            lines = [l.strip() for l in raw.strip().split('\n') if l.strip()]
            first = lines[0] if lines else ''
            if HEAD.match(first) and not re.search(r'[.:;,]$', first) and ' — ' not in first and first.lower() not in GENERIC:
                head = HEAD.match(first).group(3)
            elif len(lines) == 1 and is_title(first) and first.lower() not in GENERIC:
                head = first
            pars.append((head, clean_par(raw)))
        for h, c in chunks_of(pars):
            items.append([lid, d, i, h, c])

for lid, F in FULL.items():
    if F.get('dir'):
        add_pdf(lid, F['dir'], F['pdf'], F['pages'])
        if F.get('extra'):
            add_pdf(lid, F['extra']['dir'], F['extra']['pdf'], F['extra']['pages'])
    elif F.get('html'):
        s = open(os.path.join(root, F['html']), encoding='utf-8').read()
        s = re.sub(r'<(script|style|svg)[\s\S]*?</\1>', ' ', s)
        for sec in re.finditer(r'<section class="part" id="([^"]+)">([\s\S]*?)</section>', s):
            sid, body = sec.group(1), sec.group(2)
            h2 = re.search(r'<h2[^>]*>([\s\S]*?)</h2>', body)
            title = re.sub(r'^\d+\s*', '', html.unescape(re.sub(r'<[^>]+>', '', h2.group(1))).strip()) if h2 else ''
            for part in re.split(r'(?=<h3)', body):
                h3 = re.search(r'<h3[^>]*>([\s\S]*?)</h3>', part)
                head = title + (' · ' + html.unescape(re.sub(r'<[^>]+>', '', h3.group(1))).strip() if h3 else '')
                part = re.sub(r'<h3[^>]*>[\s\S]*?</h3>', ' ', part)
                txt = html.unescape(re.sub(r'<(br|/p|/li|/tr|/dd|/div|/details|/summary)[^>]*>', '\n\n', part))
                txt = re.sub(r'<[^>]+>', ' ', txt)
                pars = [(head, re.sub(r'\s+', ' ', p).strip()) for p in re.split(r'\n\s*\n', txt)]
                for h, c in chunks_of(pars):
                    items.append([lid, F['html'] + '#' + sid, 0, h, c])

json.dump({'items': items}, open(os.path.join(root, 'fulltext.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('fulltext.json:', len(items), 'фрагментов,', os.path.getsize(os.path.join(root, 'fulltext.json')) // 1024, 'КБ')
