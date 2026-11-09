# Бот «Зубрёжка»: домашка из чата группы → homework.json → сайт.
# Запускается GitHub Actions каждые 5 минут (.github/workflows/homework-bot.yml).
# В чате: «#дз микра выучить таблицу» или «/dz генетика задачи 1–5 на пятницу».
# Команды: /dzstart — привязать бота к группе (один раз), /dzlist — всё ДЗ, /dzdel — ответом на сообщение с ДЗ, /dzhelp — помощь.
import json, os, re, subprocess, sys, urllib.request, urllib.parse
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TZ = ZoneInfo('Europe/Moscow')
TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
DRY = os.environ.get('BOT_DRY_RUN') == '1'          # для проверки без Telegram и git
F_HW, F_SCH, F_CFG = (os.path.join(ROOT, f) for f in ('homework.json', 'schedule.json', 'bot/config.json'))

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
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.load(r)
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
]
SHORT = {'Микробиология': 'микробиологии', 'Медицинская генетика': 'генетике', 'История России': 'истории', 'Анатомия': 'анатомии', 'Медицинская информатика': 'информатике'}
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
        'Предметы: микра / генетика / история / анатомия (можно сокращать).\n'
        'Бот прикрепит ДЗ к ближайшей паре по расписанию, и оно появится на сайте в карточке пары.\n'
        '«на пт», «на завтра» — если нужна конкретная пара.\n\n'
        '/dzlist — всё ДЗ\n/dzdel — ответь этой командой на сообщение с ДЗ, чтобы удалить')

def fmt_item(sch, it):
    when = when_text(sch, date.fromisoformat(it['date']), it['pair']) if it.get('date') else 'ближайшая пара (ждём новое расписание)'
    return f'• {it["subj"]} — {when}\n   {it["text"]}'

# ---------- основной цикл ----------
def run(updates, now=None):
    now = now or datetime.now(TZ)
    sch = load(F_SCH, None); hw = load(F_HW, {'items': []}); cfg = load(F_CFG, {'chat': None})
    items = hw['items']; changed = False; cfg_changed = False
    for up in updates:
        msg = up.get('message') or up.get('edited_message')
        if not msg: continue
        edited = 'edited_message' in up
        chat = msg['chat']['id']; ctype = msg['chat'].get('type')
        text = msg.get('text') or msg.get('caption') or ''
        cmd = text.strip().split()[0].lower().split('@')[0] if text.strip() else ''
        if ctype == 'private':
            if cmd in ('/start', '/help', '/dzhelp'): reply(chat, msg['message_id'], 'Привет! Я записываю домашку группы С-201 на сайт «Зубрёжка». Добавь меня в чат группы и напиши там /dzstart.\n\n' + HELP)
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
    if cfg_changed: save(F_CFG, cfg)
    return changed or cfg_changed

def git_push():
    def sh(*a): subprocess.run(a, cwd=ROOT, check=True)
    sh('git', 'config', 'user.name', 'Зубрёжка-бот'); sh('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    sh('git', 'add', 'homework.json', 'bot/config.json')
    if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=ROOT).returncode == 0: return
    sh('git', 'commit', '-q', '-m', 'ДЗ из Telegram')
    for _ in range(3):
        if subprocess.run(['git', 'pull', '--rebase', '-q'], cwd=ROOT).returncode == 0 and subprocess.run(['git', 'push', '-q'], cwd=ROOT).returncode == 0: return
    raise RuntimeError('git push не удался')

if __name__ == '__main__':
    if not TOKEN: print('Нет TELEGRAM_BOT_TOKEN — добавь секрет в настройках репозитория. Пропускаю.'); sys.exit(0)
    ups = tg('getUpdates', timeout=0, allowed_updates=['message', 'edited_message'])
    print('новых сообщений:', len(ups))
    if not ups: sys.exit(0)
    if run(ups): git_push()
    tg('getUpdates', offset=ups[-1]['update_id'] + 1, timeout=0, limit=1)   # подтверждаем обработанные — только после сохранения
