# Бот «Зубрёжка»: домашка из чата группы → homework.json → сайт.
# Запускается GitHub Actions каждые 5 минут (.github/workflows/homework-bot.yml).
# В чате: «#дз микра выучить таблицу» или «/dz генетика задачи 1–5 на пятницу».
# Команды: /dzstart — привязать бота к группе (один раз), /dzlist — всё ДЗ, /dzdel — ответом на сообщение с ДЗ, /dzhelp — помощь.
# «Нашёл ошибку»: кнопка на сайте открывает бота по ссылке t.me/<бот>?start=<место>; человек пишет, что не так,
# бот пересылает админу (тот, кто написал боту в личку /errors). Ответ админа на такое сообщение уходит автору.
import json, os, re, subprocess, sys, time, hmac, hashlib, urllib.request, urllib.parse
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TZ = ZoneInfo('Europe/Moscow')
TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
DRY = os.environ.get('BOT_DRY_RUN') == '1'          # для проверки без Telegram и git
F_HW, F_SCH, F_CFG, F_ST, F_PL = (os.path.join(ROOT, f) for f in ('homework.json', 'schedule.json', 'bot/config.json', 'bot/state.json', 'bot/places.json'))

def load(p, default):
    try: return json.load(open(p, encoding='utf-8'))
    except FileNotFoundError: return default
def save(p, obj):
    with open(p, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, indent=1); f.write('\n')

SENT = []   # в режиме проверки сюда складываются ответы бота
_sent_n = [0]
def tg(method, **params):
    if DRY:
        if method == 'sendMessage': SENT.append(params); _sent_n[0] += 1; return {'message_id': 900000 + _sent_n[0]}
        return {}
    data = urllib.parse.urlencode({k: (json.dumps(v) if isinstance(v, (list, dict)) else v) for k, v in params.items()}).encode()
    req = urllib.request.Request(f'https://api.telegram.org/bot{TOKEN}/{method}', data=data)
    wait = int(params.get('timeout', 0)) + 20
    for attempt in range(4):                      # Telegram иногда отвечает медленно — повторяем
        try:
            with urllib.request.urlopen(req, timeout=wait) as r:
                res = json.load(r)
            break
        except Exception as e:
            print(f'{method}: попытка {attempt + 1} не удалась: {e}')
            if attempt == 3: raise
            time.sleep(3 * (attempt + 1))
    if not res.get('ok'): raise RuntimeError(res)
    return res['result']

def reply(chat, to, text):
    try: return tg('sendMessage', chat_id=chat, text=text, reply_to_message_id=to, allow_sending_without_reply=True, disable_web_page_preview=True)
    except Exception as e: print('sendMessage:', e); return {}

# ---------- предметы ----------
ALIASES = [  # (начало слова, каноническое название)
    ('микр', 'Микробиология'), ('иммун', 'Микробиология'), ('микроб', 'Микробиология'),
    ('медген', 'Медицинская генетика'), ('генет', 'Медицинская генетика'), ('генк', 'Медицинская генетика'), ('ген', 'Медицинская генетика'),
    ('истор', 'История России'), ('ист', 'История России'),
    ('анат', 'Анатомия'), ('информ', 'Медицинская информатика'), ('инф', 'Медицинская информатика'),
    ('сестр', 'Основы сестринского дела'), ('осд', 'Основы сестринского дела'),
]
SHORT = {'Микробиология': 'микробиологии', 'Медицинская генетика': 'генетике', 'История России': 'истории', 'Анатомия': 'анатомии', 'Медицинская информатика': 'информатике', 'Основы сестринского дела': 'сестринскому делу'}
def canon(word):
    w = word.lower().strip(' :—-–.,!').replace('ё', 'е')
    if len(w) < 3: return None
    for pre, name in ALIASES:
        if w.startswith(pre): return name
    return None
def same_subj(a, b): return canon(a.split()[0]) == canon(b.split()[0]) if canon(a.split()[0]) else a.lower() == b.lower()

# ---------- расписание ----------
DAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб']
DAY_WORDS = {'понедельник': 0, 'вторник': 1, 'среду': 2, 'среда': 2, 'четверг': 3, 'пятницу': 4, 'пятница': 4, 'субботу': 5, 'суббота': 5}
DAY_ACC = ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу']
MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
def hm(s): h, m = map(int, s.split(':')); return h * 60 + m

def pairs_of(sch, subj):
    mon = date.fromisoformat(sch['monday']); out = []
    for i, day in enumerate(sch['days']):
        for p in day:
            if same_subj(p['subj'], subj): out.append((mon + timedelta(days=i), p['n'], i))
    return sorted(out)

def target_pair(sch, subj, now, want_day=None):
    """Ближайшее занятие по предмету: если сегодня такая пара уже началась — следующий учебный день; берём первую пару дня."""
    ps = pairs_of(sch, subj); today = now.date(); m = now.hour * 60 + now.minute
    if want_day is not None:
        for d, n, i in ps:
            if i == want_day and d >= today: return d, n
        return None
    started_today = any(d == today and hm(sch['times'][str(n)][0]) <= m for d, n, _ in ps)
    for d, n, _ in ps:
        if d < today: continue
        if d == today and (started_today or hm(sch['times'][str(n)][0]) <= m): continue
        return d, min(nn for dd, nn, _ in ps if dd == d)
    return None

def when_text(sch, d, n):
    return f'{DAYS[d.weekday()]}, {d.day} {MONTHS[d.month - 1]} ({n} пара, {sch["times"][str(n)][0]})'

# ---------- разбор сообщения ----------
TRIGGER = re.compile(r'^\s*(?:#дз|#домашка|/dz(?:@\w+)?)\b[\s:—-]*', re.I)
WANT = re.compile(r'\bна\s+(завтра|пн|вт|ср|чт|пт|сб|понедельник|вторник|среду|четверг|пятницу|субботу)\b', re.I)

def parse(text, now):
    m = TRIGGER.match(text or '')
    if not m: return None
    rest = text[m.end():].strip()
    words = rest.split()
    subj = None; used = 0
    for k in range(min(2, len(words))):
        c = canon(words[k])
        if c: subj, used = c, k + 1; break
    if not subj: return {'error': 'subject'}
    body = ' '.join(words[used:]).strip(' :—-–')
    want = None; w = WANT.search(body)
    if w:
        x = w.group(1).lower()
        want = (now.date() + timedelta(days=1)).weekday() if x == 'завтра' else DAYS.index(x) if x in DAYS else DAY_WORDS[x]
        if want > 5: want = None
    if not body: return {'error': 'empty', 'subj': subj}
    return {'subj': subj, 'text': body, 'want': want}

def author(u):
    if not u: return ''
    return (u.get('first_name') or u.get('username') or '').strip()[:30]

HELP = ('📝 Как записать домашку:\n'
        '#дз микра выучить таблицу вакцин\n'
        '#дз генетика задачи 1–5 на пятницу\n\n'
        'Предметы: микра / генетика / история / анатомия / сестринское (можно сокращать).\n'
        'Бот прикрепит ДЗ к ближайшей паре по расписанию, и оно появится на сайте в карточке пары.\n'
        '«на пт», «на завтра» — если нужна конкретная пара.\n\n'
        '/dzlist — всё ДЗ\n/dzdel — ответь этой командой на сообщение с ДЗ, чтобы удалить')

def fmt_item(sch, it):
    when = when_text(sch, date.fromisoformat(it['date']), it['pair']) if it.get('date') else 'ближайшая пара (ждём новое расписание)'
    return f'• {it["subj"]} — {when}\n   {it["text"]}'

# ---------- «Нашёл ошибку» ----------
SITE = 'https://kapustatrue.github.io/stomatologi/'
PLACE_RE = re.compile(r'^(?:e_[a-z0-9]+_[\w-]+|x_[tp]\d+_[\w-]+|g)$', re.I)
def uhash(uid):  # в публичном репозитории храним не id человека, а его отпечаток
    return hmac.new((TOKEN or 'dry').encode(), str(uid).encode(), hashlib.sha256).hexdigest()[:16]

def place_label(p):
    """Код места из ссылки → (подпись, ссылка на сайт)."""
    P = load(F_PL, {}); site = P.get('site') or SITE
    if not p: return None, None
    if p == 'g': return 'Сайт в целом', site
    k, code, rest = (p.split('_', 2) + ['', ''])[:3]
    if k == 'e':
        L = P.get('lec', {}).get(rest)
        if not L: return f'Лекция {rest}', site + '#' + rest
        head = f'{L["s"]} · лекция {L["n"]} «{L["t"]}»'
        m = re.fullmatch(r'([a-z]?)(\d*)', code)
        kind, num = (m.group(1), m.group(2)) if m else ('x', '')
        if kind == '' and num:
            i = int(num); sec = L['sec'][i] if i < len(L['sec']) else ''
            what = f'раздел {i + 1}' + (f' «{sec}»' if sec else '')
        elif kind == 'r': what = '«Что запомнить»'
        elif kind == 'f': what = 'полная версия'
        elif kind == 'c':
            if num and int(num) < len(L['cards']): what = f'карточка: «{L["cards"][int(num)]}»'
            else: what = 'карточки'
        elif kind == 'q':
            if num and int(num) < len(L['quiz']): what = f'тест, вопрос {int(num) + 1}: «{L["quiz"][int(num)]}»'
            else: what = 'тест'
        else: what = 'другое'
        return f'{head} — {what}', site + '#' + rest
    if k == 'x':
        E = P.get('exam', {}).get(rest)
        kind, n = code[:1], code[1:]
        if not E: return f'Экзамен {rest}, {code}', site + '#exam-' + rest
        q = E['theory' if kind == 't' else 'practice'].get(n, '')
        return f'{E["t"]} — {"вопрос " + n if kind == "t" else "практика П" + n}' + (f': «{q}»' if q else ''), site + '#exam-' + rest
    return None, None

def who(u):
    name = ' '.join(x for x in ((u or {}).get('first_name'), (u or {}).get('last_name')) if x).strip() or 'Без имени'
    return name + (f' (@{u["username"]})' if (u or {}).get('username') else '')

CAPTIONABLE = ('photo', 'video', 'document', 'animation', 'audio', 'voice')
def send_report(dest, msg, place, note=''):
    """Переслать сообщение об ошибке админу. True — получилось."""
    label, link = place_label(place)
    head = '🐞 Ошибка на сайте\n' + (f'📍 {label}\n🔗 {link}\n' if label else '📍 место не указано\n') + f'👤 {who(msg.get("from"))}'
    foot = f'\n\n↩️ Ответь на это сообщение — перешлю ответ автору.{note}\n#u{msg["chat"]["id"]}'
    try:
        if any(k in msg for k in CAPTIONABLE):
            cap = msg.get('caption') or ''
            body = head + (f'\n\n💬 {cap}' if cap else '')
            tg('copyMessage', chat_id=dest, from_chat_id=msg['chat']['id'], message_id=msg['message_id'], caption=(body[:1024 - len(foot)] + foot))
        elif msg.get('text'):
            tg('sendMessage', chat_id=dest, text=(head + '\n\n💬 ' + msg['text'])[:4096 - len(foot)] + foot, disable_web_page_preview=True)
        else:  # стикер, кружок и т. п. — заголовок отдельным сообщением, на него и отвечать
            h = tg('sendMessage', chat_id=dest, text=head + foot, disable_web_page_preview=True)
            tg('copyMessage', chat_id=dest, from_chat_id=msg['chat']['id'], message_id=msg['message_id'], reply_to_message_id=h.get('message_id'), allow_sending_without_reply=True)
        return True
    except Exception as e:
        print('send_report:', e); return False

PRIVATE_HELLO = ('Привет! Я бот сайта «Зубрёжка» группы С-201.\n\n'
                 '🐞 Нашёл ошибку в конспекте, карточке или ответе? Нажми на сайте «Нашёл ошибку» или просто напиши её сюда (можно со скрином) — передам админу.\n\n'
                 '📝 Домашку я записываю в чате группы: #дз предмет текст.')

def handle_private(msg, cfg, st, now):
    """Личка: /start с местом ошибки, /errors (стать получателем), ответы админа, сами сообщения об ошибках.
    Возвращает (cfg_changed, st_changed)."""
    chat = msg['chat']['id']; text = (msg.get('text') or '').strip()
    parts = text.split(maxsplit=1); cmd = parts[0].lower().split('@')[0] if text.startswith('/') else ''
    pend = st.setdefault('pending', {}); done = st.setdefault('done', [])
    key = f'{uhash(chat)}:{msg["message_id"]}'
    if key in done: return False, False                 # уже обработано (повторный запуск)
    done.append(key); del done[:-300]
    h = uhash(chat)
    if cmd == '/start':
        arg = parts[1].strip() if len(parts) > 1 else ''
        if PLACE_RE.match(arg):
            pend[h] = {'p': arg, 't': now.isoformat(timespec='minutes')}
            label, _ = place_label(arg)
            reply(chat, msg['message_id'], f'🐞 Сообщение об ошибке\n📍 {label}\n\nНапиши одним сообщением, что не так и как правильно (если знаешь). Можно приложить скрин — я передам админу сайта.')
        else:
            reply(chat, msg['message_id'], PRIVATE_HELLO)
        return False, True
    if cmd == '/errors':
        if cfg.get('admin') in (None, chat):
            new = cfg.get('admin') is None; cfg['admin'] = chat
            reply(chat, msg['message_id'], '✅ Готово: сообщения об ошибках с сайта будут приходить сюда.\nЧтобы ответить автору — ответь (Reply) на его сообщение.')
            return new, True
        reply(chat, msg['message_id'], 'Получатель сообщений об ошибках уже назначен.'); return False, True
    if cmd in ('/help', '/dzhelp'):
        reply(chat, msg['message_id'], PRIVATE_HELLO + '\n\n' + HELP); return False, True
    if cmd:
        reply(chat, msg['message_id'], 'Не знаю такую команду 🤔 Если нашёл ошибку на сайте — просто напиши её сюда.'); return False, True
    if TRIGGER.match(text):
        reply(chat, msg['message_id'], '📝 Домашку пиши в чате группы — там я её и запишу.'); return False, True
    # ответ админа автору
    r = msg.get('reply_to_message')
    if chat == cfg.get('admin') and r:
        m = re.search(r'#u(-?\d+)', (r.get('text') or r.get('caption') or ''))
        if m:
            uid = int(m.group(1))
            try:
                tg('sendMessage', chat_id=uid, text='💬 Ответ админа на твоё сообщение об ошибке:')
                tg('copyMessage', chat_id=uid, from_chat_id=chat, message_id=msg['message_id'])
                reply(chat, msg['message_id'], '📨 Отправил автору.')
            except Exception as e:
                print('ответ автору:', e); reply(chat, msg['message_id'], 'Не получилось отправить — возможно, автор остановил бота.')
            return False, True
    # само сообщение об ошибке
    p = pend.get(h); place = None
    if p:
        age = now - datetime.fromisoformat(p['t'])
        if (not p.get('sent') and age < timedelta(days=1)) or (p.get('sent') and now - datetime.fromisoformat(p['sent']) < timedelta(minutes=30)):
            place = p['p']
    dest = cfg.get('admin') or cfg.get('chat'); note = ''
    if not cfg.get('admin'): note = '\n(Админ, напиши мне в личку /errors — тогда такие сообщения будут приходить только тебе.)'
    if dest and send_report(dest, msg, place, note):
        if place: pend[h] = {'p': place, 't': p['t'], 'sent': now.isoformat(timespec='minutes')}
        reply(chat, msg['message_id'], '✅ Спасибо! Передал админу. Если хочешь что-то добавить — просто напиши ещё сюда.')
    else:
        reply(chat, msg['message_id'], 'Не получилось передать 😕 Напиши, пожалуйста, об ошибке в чат группы.')
    return False, True

# ---------- основной цикл ----------
def run(updates, now=None):
    now = now or datetime.now(TZ)
    sch = load(F_SCH, None); hw = load(F_HW, {'items': []}); cfg = load(F_CFG, {'chat': None}); st = load(F_ST, {})
    items = hw['items']; changed = False; cfg_changed = False; st_changed = False
    for up in updates:
        msg = up.get('message') or up.get('edited_message')
        if not msg: continue
        edited = 'edited_message' in up
        chat = msg['chat']['id']; ctype = msg['chat'].get('type')
        text = msg.get('text') or msg.get('caption') or ''
        cmd = text.strip().split()[0].lower().split('@')[0] if text.strip() else ''
        if ctype == 'private':
            if edited: continue
            c, s_ = handle_private(msg, cfg, st, now)
            cfg_changed |= c; st_changed |= s_
            continue
        if cmd == '/dzstart':
            if cfg.get('chat') in (None, chat):
                if cfg.get('chat') is None: cfg['chat'] = chat; cfg_changed = True
                reply(chat, msg['message_id'], '✅ Готово, теперь я записываю домашку этой группы.\n\n' + HELP)
            else:
                reply(chat, msg['message_id'], 'Я уже работаю в другой группе.')
            continue
        if chat != cfg.get('chat'): continue
        if cmd in ('/dzhelp', '/help'): reply(chat, msg['message_id'], HELP); continue
        if cmd == '/dzlist':
            today = now.date().isoformat()
            act = [it for it in items if not it.get('date') or it['date'] >= today]
            act.sort(key=lambda it: (it.get('date') or '9999', it.get('pair') or 0))
            reply(chat, msg['message_id'], ('📚 Домашка:\n\n' + '\n'.join(fmt_item(sch, it) for it in act)) if act else 'Домашки нет 🎉')
            continue
        if cmd == '/dzdel':
            r = msg.get('reply_to_message')
            if not r: reply(chat, msg['message_id'], 'Ответь командой /dzdel на сообщение с ДЗ (или на мой ответ).'); continue
            rid = r['message_id']; before = len(items)
            items[:] = [it for it in items if it['id'] != rid and it.get('bot_msg') != rid]
            if len(items) < before: changed = True; reply(chat, msg['message_id'], '🗑 Удалил, на сайте его больше не будет.')
            else: reply(chat, msg['message_id'], 'Не нашёл такое ДЗ.')
            continue
        p = parse(text, now)
        if not p: continue
        if p.get('error') == 'subject':
            if not edited: reply(chat, msg['message_id'], 'Не понял предмет 🤔 Напиши так: #дз микра выучить таблицу\nПредметы: микра, генетика, история, анатомия.')
            continue
        if p.get('error') == 'empty':
            if not edited: reply(chat, msg['message_id'], f'А что задали по {SHORT.get(p["subj"], p["subj"])}? Напиши текст после предмета.')
            continue
        old = next((it for it in items if it['id'] == msg['message_id']), None)
        if old and not edited: continue                      # уже записано (повторный запуск)
        tp = target_pair(sch, p['subj'], now, p['want']) if sch else None
        if p['want'] is not None and tp is None and sch:     # на тот день пары нет — берём ближайшую
            tp = target_pair(sch, p['subj'], now)
        it = {'id': msg['message_id'], 'subj': p['subj'], 'text': p['text'][:600], 'author': author(msg.get('from')),
              'created': now.isoformat(timespec='minutes'), 'date': tp[0].isoformat() if tp else None, 'pair': tp[1] if tp else None}
        if old:
            old.update({k: it[k] for k in ('subj', 'text', 'date', 'pair')}); changed = True
            continue
        when = f'на {when_text(sch, *tp)}' if tp else 'на ближайшую пару — в расписании этой недели её больше нет, прикреплю, когда появится новое'
        sent = reply(chat, msg['message_id'], f'✅ Записал ДЗ по {SHORT.get(p["subj"], p["subj"])} {when}.\nНа сайте появится в течение нескольких минут.')
        if sent.get('message_id'): it['bot_msg'] = sent['message_id']
        items.append(it); changed = True
    # убрать старое: прошедшее больше недели назад, без даты — старше 3 недель
    cut = (now.date() - timedelta(days=7)).isoformat(); cut_u = (now - timedelta(days=21)).isoformat()
    kept = [it for it in items if (it.get('date') and it['date'] >= cut) or (not it.get('date') and it['created'] >= cut_u)]
    if len(kept) != len(items): items[:] = kept; changed = True
    if changed: hw['items'] = items; save(F_HW, hw)
    # отпечатки «где ошибка» живут 2 дня
    pend = st.get('pending', {})
    for k in [k for k, v in pend.items() if now - datetime.fromisoformat(v.get('sent') or v['t']) > timedelta(days=2)]: del pend[k]; st_changed = True
    if cfg_changed: save(F_CFG, cfg)
    if st_changed: save(F_ST, st)
    return changed or cfg_changed or st_changed

def git_push():
    def sh(*a): subprocess.run(a, cwd=ROOT, check=True)
    sh('git', 'config', 'user.name', 'Зубрёжка-бот'); sh('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    sh('git', 'add', 'homework.json', 'bot/config.json', 'bot/state.json')
    if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=ROOT).returncode == 0: return
    sh('git', 'commit', '-q', '-m', 'Бот: ДЗ / ошибки из Telegram')
    for _ in range(3):
        if subprocess.run(['git', 'pull', '--rebase', '-q'], cwd=ROOT).returncode == 0 and subprocess.run(['git', 'push', '-q'], cwd=ROOT).returncode == 0: return
    raise RuntimeError('git push не удался')

if __name__ == '__main__':
    if not TOKEN: print('Нет TELEGRAM_BOT_TOKEN — добавь секрет в настройках репозитория. Пропускаю.'); sys.exit(0)
    # Слушаем чат несколько минут: пока запуск идёт, бот отвечает сразу.
    # Сообщение подтверждается Telegram только следующим запросом — то есть уже после сохранения на GitHub.
    # имя бота — для кнопки «Нашёл ошибку» на сайте (сайт читает bot/config.json)
    try:
        me = tg('getMe'); cfg = load(F_CFG, {'chat': None})
        if me.get('username') and cfg.get('username') != me['username']:
            cfg['username'] = me['username']; save(F_CFG, cfg); git_push()
    except Exception as e: print('getMe:', e)
    end = time.time() + int(os.environ.get('BOT_LISTEN_SECONDS', '270'))
    offset = None; total = 0
    while time.time() < end:
        try:
            ups = tg('getUpdates', timeout=min(25, max(1, int(end - time.time()))), allowed_updates=['message', 'edited_message'], **({'offset': offset} if offset else {}))
        except Exception as e:
            print('getUpdates не удался, попробую в следующий раз:', e); break
        if not ups: continue
        total += len(ups)
        hw_before = load(F_HW, {'items': []})
        if run(ups):
            git_push()
            try:   # уведомления в Telegram тем, кто вошёл на сайт (bot/notify.py, бот входа)
                import notify
                notify.notify_hw(hw_before, load(F_HW, {'items': []}), load(F_SCH, {}))
            except Exception as e: print('уведомления не отправлены:', repr(e)[:200])
        offset = ups[-1]['update_id'] + 1
    if offset:
        try: tg('getUpdates', offset=offset, timeout=0, limit=1)
        except Exception as e: print('не смог подтвердить последние сообщения (обработаю повторно без дублей):', e)
    print('обработано сообщений:', total)
