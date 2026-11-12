# Облачная функция «Зубрёжки» (Яндекс Облако, python312, точка входа index.handler).
# Что умеет:
#   • вход через Telegram-бота (диплинк t.me/<бот>?start=<код>), пускает только участников чата группы;
#   • общий чат-болталка и обсуждения под лекциями;
#   • «Кто что отвечает»: вопросы преподавателя к лекции и кто какой взял;
#   • хранение прогресса (карточки, тесты, отметки «знаю») между устройствами.
# Запросы сайта: POST, тело — JSON {a: действие, t: токен, ...} с Content-Type text/plain (без CORS-preflight).
# Вебхук бота: POST ?tg=1 (заголовок X-Telegram-Bot-Api-Secret-Token).
# Настройка: GET ?setup=<SETUP_KEY> — создаёт таблицы и ставит вебхук.
import os, json, time, hmac, hashlib, base64, secrets, re, urllib.request, urllib.parse
from db import get_db

ENV = os.environ.get
SITE = ENV('SITE_URL', 'https://kapustatrue.github.io/stomatologi/')
ORIGINS = [o.strip() for o in ENV('ALLOW_ORIGINS', 'https://kapustatrue.github.io').split(',') if o.strip()]
CODE_TTL = 15 * 60          # ссылка для входа живёт 15 минут
TOKEN_TTL = 120 * 86400     # вход держится 120 дней
MAX_TEXT = 1000
ROOM_RE = re.compile(r'^(general|lec:[a-z0-9-]{1,40})$')
LEC_RE = re.compile(r'^[a-z0-9-]{1,40}$')
PLAN_RE = re.compile(r'^p\d{1,3}$')   # вопросы по плану лекции (лежат в данных сайта, не в базе)


def now(): return int(time.time())
def now_ms(): return int(time.time() * 1000)
def new_id(): return f'{now_ms():013d}{secrets.token_hex(2)}'   # сортируется по времени


def secret():
    s = ENV('SESSION_SECRET', '')
    if not s:  # запасной вариант: из токена бота (чтобы работало и без отдельного секрета)
        s = hashlib.sha256(('zubr:' + ENV('LOGIN_BOT_TOKEN', 'dev')).encode()).hexdigest()
    return s.encode()


def tg_secret(): return hmac.new(secret(), b'tg-webhook', hashlib.sha256).hexdigest()[:48]
def setup_key(): return ENV('SETUP_KEY', '')


# ---------- токены ----------
def b64e(b): return base64.urlsafe_b64encode(b).decode().rstrip('=')
def b64d(s): return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))

def make_token(uid, name, adm):
    body = b64e(json.dumps({'u': uid, 'n': name, 'a': 1 if adm else 0, 'e': now() + TOKEN_TTL}, ensure_ascii=False).encode())
    sig = b64e(hmac.new(secret(), body.encode(), hashlib.sha256).digest()[:24])
    return body + '.' + sig

def read_token(t):
    try:
        body, sig = str(t).split('.')
        good = b64e(hmac.new(secret(), body.encode(), hashlib.sha256).digest()[:24])
        if not hmac.compare_digest(sig, good): return None
        d = json.loads(b64d(body))
        if d.get('e', 0) < now(): return None
        return d
    except Exception:
        return None


# ---------- Telegram ----------
def tg_call(token, method, **params):
    data = urllib.parse.urlencode({k: (json.dumps(v) if isinstance(v, (dict, list)) else v) for k, v in params.items()}).encode()
    req = urllib.request.Request(f'https://api.telegram.org/bot{token}/{method}', data=data)
    with urllib.request.urlopen(req, timeout=6) as r:
        return json.loads(r.read().decode())

def admin_ids(): return {int(x) for x in re.findall(r'-?\d+', ENV('ADMIN_IDS', ''))}

def full_name(u):
    n = ' '.join(x for x in [u.get('first_name', ''), u.get('last_name', '')] if x).strip()
    return (n or u.get('username') or 'Без имени')[:60]

# Из Яндекс Облака серверы Telegram недоступны, поэтому сами в Telegram не ходим:
# бот входа сидит в чате группы (режим приватности выключен) и по вебхуку запоминает,
# кто там пишет и кто вступает/выходит. Отвечаем только в теле ответа на вебхук.
def is_admin(db, uid): return uid in admin_ids() or str(uid) == db.cfg_get('admin')

# ---------- уведомления в Telegram (ДЗ, расписание) ----------
# Рассылает bot/notify.py из GitHub Actions (из Облака Telegram недоступен), сервер хранит только настройки.
# По умолчанию всё включено; настройка — в cfg под ключом 'nt:<uid>': 'hw,sch' / 'hw' / 'sch' / ''.
NT_KINDS = ('hw', 'sch')
def nt_parse(v): return {k: k in str(v).split(',') for k in NT_KINDS}
def nt_get(db, uid):
    v = db.cfg_get(f'nt:{uid}')
    return nt_parse(v) if v or db.cfg_get(f'nt:{uid}:set') else {k: True for k in NT_KINDS}
def nt_set(db, uid, prefs):
    db.cfg_set(f'nt:{uid}', ','.join(k for k in NT_KINDS if prefs.get(k))); db.cfg_set(f'nt:{uid}:set', '1')
def nt_targets(db):
    """Кому слать: вошли на сайт и сейчас в чате группы (или админы из ADMIN_IDS)."""
    mem = set(db.members_all()) | admin_ids()
    pref = db.cfg_prefix('nt:')
    out = []
    for u in db.users_all():
        uid = int(u['uid'])
        if uid not in mem: continue
        v = pref.get(f'nt:{uid}', '')
        p = nt_parse(v) if (v or pref.get(f'nt:{uid}:set')) else {k: True for k in NT_KINDS}
        out.append(dict(uid=uid, name=u['name'], adm=is_admin(db, uid), **p))
    return out
NT_HELP = ('🔔 <b>Уведомления «Зубрёжки»</b>\n\nПрисылаю сюда новое домашнее задание и изменения в расписании.\n\n'
           '/off — выключить всё\n/on — включить всё\n/hw — только ДЗ\n/sch — только расписание\n\n'
           'Это же можно настроить на сайте: аватарка в шапке → «Уведомления».')
def nt_status(p):
    on = [t for k, t in (('hw', '📌 домашка'), ('sch', '📅 расписание')) if p[k]]
    return 'Сейчас включено: ' + ', '.join(on) + '.' if on else 'Сейчас уведомления выключены. Включить — /on'

def handle_group(db, msg, chat):
    gid = db.cfg_get('group'); cid = str(chat['id'])
    me = (ENV('LOGIN_BOT_NAME', '') or '').lower()
    added = [u for u in msg.get('new_chat_members') or []]
    if any((u.get('username') or '').lower() == me for u in added) or (msg.get('group_chat_created') and not gid):
        if not gid:
            db.cfg_set('group', cid); db.cfg_set('admin', str(msg['from']['id']))
            for u in added:
                if not u.get('is_bot'): db.member_set(int(u['id']), full_name(u), now())
            db.member_set(int(msg['from']['id']), full_name(msg['from']), now())
            return {'method': 'sendMessage', 'chat_id': chat['id'], 'parse_mode': 'HTML', 'disable_web_page_preview': True,
                    'text': f'👋 Привет! Я бот входа на сайт «Зубрёжка».\n\nЧтобы войти на сайт: открой {SITE} → «Войти» → «Войти через Telegram» → «Старт».\n\n<i>Если бот напишет «не видел тебя в чате» — просто напиши сюда любое сообщение.</i>'}
        if gid != cid:
            return {'method': 'leaveChat', 'chat_id': chat['id']}
    if msg.get('migrate_to_chat_id') and gid == cid:   # группа стала супергруппой — у неё новый id
        db.cfg_set('group', str(msg['migrate_to_chat_id'])); return None
    if gid != cid: return None
    for u in added:
        if not u.get('is_bot'): db.member_set(int(u['id']), full_name(u), now())
    left = msg.get('left_chat_member')
    if left and not left.get('is_bot'): db.member_del(int(left['id']))
    u = msg.get('from') or {}
    if u.get('id') and not u.get('is_bot') and not left:
        uid = int(u['id'])
        db.member_set(uid, full_name(u), now())
        for code in db.codes_wait(uid):   # человек нажал «Старт» раньше, чем написал в чат, — пускаем
            db.code_set(code, uid, full_name(u), u.get('username') or '', 'ok', is_admin(db, uid))
    return None

def handle_tg(update):
    """Вебхук бота для входа. Отвечаем прямо в ответе на вебхук (method в теле)."""
    db = get_db()
    msg = update.get('message') or {}
    chat = msg.get('chat') or {}
    if chat.get('type') in ('group', 'supergroup'): return handle_group(db, msg, chat)
    if chat.get('type') != 'private' or not msg.get('from'): return None
    u = msg['from']; uid = int(u['id']); text = (msg.get('text') or '').strip()
    reply = lambda t: {'method': 'sendMessage', 'chat_id': chat['id'], 'text': t, 'parse_mode': 'HTML', 'disable_web_page_preview': True}
    cmd = re.match(r'^/(on|off|stop|hw|sch|notify|help)(?:@\w+)?$', text)
    if cmd:
        c = cmd.group(1)
        if c in ('notify', 'help'): return reply(NT_HELP + '\n\n' + nt_status(nt_get(db, uid)))
        prefs = {'on': {'hw': True, 'sch': True}, 'off': {}, 'stop': {}, 'hw': {'hw': True}, 'sch': {'sch': True}}[c]
        nt_set(db, uid, prefs)
        return reply(('🔕 Готово, уведомления выключены. Включить снова — /on' if not prefs else '🔔 Готово! ' + nt_status(nt_get(db, uid))))
    m = re.match(r'^/start(?:@\w+)?\s+([A-Za-z0-9_-]{8,64})$', text)
    if not m:
        return reply(f'👋 Это бот для входа на сайт «Зубрёжка».\n\nОткрой сайт → нажми <b>«Войти»</b> → кнопку <b>«Войти через Telegram»</b>, и я тебя пущу.\n\n{SITE}\n\n🔔 Уведомления о ДЗ и расписании — /notify')
    code = m.group(1)
    row = db.code_get(code)
    if not row or row['ts'] < now() - CODE_TTL:
        return reply('⌛ Ссылка для входа устарела. Нажми «Войти» на сайте ещё раз.')
    if row['st'] == 'ok':
        return reply('✅ Ты уже вошёл — возвращайся на сайт.')
    name = full_name(u); uname = u.get('username') or ''
    if not db.cfg_get('group') and not admin_ids():
        return reply('⏳ Бот ещё не подключён к чату группы. Попроси старосту/админа сайта добавить @' + (ENV('LOGIN_BOT_NAME') or 'бота') + ' в чат группы.')
    if not (db.member_get(uid) or uid in admin_ids()):
        db.code_set(code, uid, name, uname, 'notseen', False)
        return reply('👀 Почти готово! Я пока не видел тебя в чате группы С-201.\n\n<b>Напиши любое сообщение в чат группы</b> (например, «я с сайта 👋») — и сайт сам тебя впустит, нажимать ничего не нужно.\n\nЕщё не в чате? Вступи по кнопке на сайте.')
    db.code_set(code, uid, name, uname, 'ok', is_admin(db, uid))
    return reply(f'✅ Готово, {name}! Вход подтверждён.\n\nВозвращайся на сайт «Зубрёжка» — он уже пускает тебя. 🦷\n\n🔔 Ещё я буду присылать сюда новое ДЗ и изменения в расписании. Выключить — /off, настройки — /notify\n\n<i>Если ты не нажимал «Войти» на сайте — просто проигнорируй это сообщение.</i>')


# ---------- API сайта ----------
class Err(Exception):
    def __init__(self, code, msg=''): super().__init__(msg); self.code = code; self.msg = msg

def need(user):
    if not user: raise Err('auth', 'Нужно войти')
    return user

def clean_text(s, limit=MAX_TEXT):
    s = str(s or '').replace('\r', '').strip()
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s[:limit]

def room_ok(room):
    if not ROOM_RE.match(str(room or '')): raise Err('bad', 'Неизвестный чат')
    return room

def q_payload(db, lec):
    """Вопросы группы (qs) + кто взял вопросы по плану лекции (pc: {'p0': [{uid,name}], ...})."""
    qs, cl = db.q_list(lec)
    by = {}
    for c in cl: by.setdefault(c['qid'], []).append({'uid': int(c['uid']), 'name': c['name']})
    return {'qs': [{'id': q['id'], 'text': q['text'], 'uid': int(q['uid']), 'name': q['name'], 'ts': int(q['ts']), 'who': by.get(q['id'], [])} for q in qs],
            'pc': {k: v for k, v in by.items() if PLAN_RE.match(k)}}


def api(d):
    db = get_db()
    a = d.get('a')
    user = read_token(d.get('t')) if d.get('t') else None
    uid = int(user['u']) if user else 0

    if a == 'hello':
        return {'ok': True, 'bot': ENV('LOGIN_BOT_NAME', ''), 'user': {'uid': uid, 'name': user['n'], 'adm': bool(user['a'])} if user else None}

    if a == 'login_start':
        if secrets.randbelow(20) == 0: db.codes_gc(now() - 3600)
        code = secrets.token_urlsafe(18)
        db.code_new(code, now())
        return {'code': code, 'bot': ENV('LOGIN_BOT_NAME', '')}

    if a == 'login_check':
        code = str(d.get('code') or '')[:64]
        row = db.code_get(code) if code else None
        if not row or row['ts'] < now() - CODE_TTL: return {'st': 'expired'}
        if row['st'] == 'denied': return {'st': 'denied'}
        if row['st'] == 'notseen': return {'st': 'notseen'}
        if row['st'] != 'ok': return {'st': 'wait'}
        uid2 = int(row['uid']); name = row['name']; adm = bool(row['adm'])
        db.user_upsert(uid2, name, row['uname'] or '', now())
        db.code_del(code)
        return {'st': 'ok', 'token': make_token(uid2, name, adm), 'user': {'uid': uid2, 'name': name, 'uname': row['uname'] or '', 'adm': adm}}

    # --- дальше только для вошедших ---
    need(user)
    name = user['n']; adm = bool(user.get('a'))

    if a == 'msgs':
        room = room_ok(d.get('room'))
        after = str(d.get('after') or '')
        if after: return {'msgs': db.msgs_after(room, after[:40], 100)}
        return {'msgs': db.msgs_last(room, min(int(d.get('n') or 60), 100))}

    if a == 'send':
        room = room_ok(d.get('room'))
        text = clean_text(d.get('text'))
        if not text: raise Err('bad', 'Пустое сообщение')
        mid = new_id(); db.msg_add(room, mid, uid, name, text, now())
        after = str(d.get('after') or '')
        return {'id': mid, 'msgs': db.msgs_after(room, after[:40], 100) if after else db.msgs_last(room, 60)}

    if a == 'del_msg':
        room = room_ok(d.get('room')); mid = str(d.get('id') or '')[:40]
        m = db.msg_get(room, mid)
        if not m: return {'ok': True}
        if int(m['uid']) != uid and not adm: raise Err('forbidden', 'Можно удалять только свои сообщения')
        db.msg_del(room, mid); return {'ok': True}

    if a == 'edit_msg':
        room = room_ok(d.get('room')); mid = str(d.get('id') or '')[:40]
        text = clean_text(d.get('text'))
        if not text: raise Err('bad', 'Пустое сообщение')
        m = db.msg_get(room, mid)
        if not m or m['del']: raise Err('gone', 'Сообщение уже удалено')
        if int(m['uid']) != uid: raise Err('forbidden', 'Изменять можно только свои сообщения')
        db.msg_edit(room, mid, text, now())
        return {'msg': db.msg_row(db.msg_get(room, mid))}

    if a == 'ping':  # для значка на главной: последнее сообщение в болталке
        r = db.room_last('general')
        return {'last': {'id': r['id'], 'name': r['name'], 'text': '' if r['del'] else r['text'][:120]} if r else None}

    if a == 'qs':
        lec = str(d.get('lec') or '')
        if not LEC_RE.match(lec): raise Err('bad', 'Неизвестная лекция')
        return q_payload(db, lec)

    if a == 'q_add':
        lec = str(d.get('lec') or '')
        if not LEC_RE.match(lec): raise Err('bad', 'Неизвестная лекция')
        texts = d.get('texts') or []
        if isinstance(texts, str): texts = [texts]
        added = 0
        for t in texts[:40]:
            t = clean_text(t, 500)
            if t: db.q_add(lec, new_id(), t, uid, name, now()); added += 1; time.sleep(0.002)
        if not added: raise Err('bad', 'Пустой вопрос')
        return dict(q_payload(db, lec), added=added)

    if a == 'q_claim':
        lec = str(d.get('lec') or ''); qid = str(d.get('qid') or '')[:40]
        if not LEC_RE.match(lec) or not (PLAN_RE.match(qid) or db.q_get(lec, qid)): raise Err('gone', 'Вопрос уже удалили')
        db.claim(lec, qid, uid, name, now(), bool(d.get('on')))
        return q_payload(db, lec)

    if a == 'q_del':
        lec = str(d.get('lec') or ''); qid = str(d.get('qid') or '')[:40]
        q = db.q_get(lec, qid) if LEC_RE.match(lec) else None
        if q:
            if int(q['uid']) != uid and not adm: raise Err('forbidden', 'Удалить может тот, кто добавил, или админ')
            db.q_del(lec, qid)
        return q_payload(db, lec)

    if a == 'q_sum':
        qn, cn = db.q_summary()
        out = {r['lec']: [int(r['n']), 0] for r in qn}
        for r in cn:
            out.setdefault(r['lec'], [0, 0])[1] = int(r['n'])
        return {'sum': out}

    if a == 'notif_get':
        return {'nt': nt_get(db, uid)}

    if a == 'notif_set':
        cur = nt_get(db, uid)
        for k in NT_KINDS:
            if k in d: cur[k] = bool(d.get(k))
        nt_set(db, uid, cur)
        return {'nt': cur}

    if a == 'prog_get':
        r = db.prog_get(uid)
        return {'data': json.loads(r['js']) if r else None, 'ts': int(r['ts']) if r else 0}

    if a == 'prog_put':
        data = d.get('data')
        if not isinstance(data, dict): raise Err('bad', 'Нет данных')
        js = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
        if len(js) > 300_000: raise Err('bad', 'Слишком много данных')
        ts = now_ms(); db.prog_put(uid, js, ts)
        return {'ts': ts}

    raise Err('bad', 'Неизвестное действие')


# ---------- точка входа ----------
def cors(headers):
    origin = headers.get('Origin') or headers.get('origin') or ''
    ok = origin in ORIGINS or origin.startswith('http://localhost') or origin.startswith('http://127.0.0.1')
    return {'Access-Control-Allow-Origin': origin if ok else ORIGINS[0], 'Vary': 'Origin',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'}

def resp(code, obj, headers=None):
    h = {'Content-Type': 'application/json; charset=utf-8'}; h.update(headers or {})
    return {'statusCode': code, 'headers': h, 'body': json.dumps(obj, ensure_ascii=False), 'isBase64Encoded': False}

def do_setup(context, headers):
    out = {'tables': get_db().setup()}
    tok = ENV('LOGIN_BOT_TOKEN', '')
    if tok:
        fid = getattr(context, 'function_name', '') or ''
        url = ENV('PUBLIC_URL', '') or (f'https://functions.yandexcloud.net/{fid}' if fid else '')
        try:
            out['webhook'] = tg_call(tok, 'setWebhook', url=url + ('&' if '?' in url else '?') + 'tg=1',
                                     secret_token=tg_secret(), allowed_updates=['message'], drop_pending_updates='true')
            me = tg_call(tok, 'getMe').get('result') or {}
            out['bot'] = me.get('username')
            if me.get('username') and not ENV('LOGIN_BOT_NAME'): out['hint'] = f"Добавь переменную LOGIN_BOT_NAME={me['username']}"
        except Exception as e:
            out['webhook_error'] = str(e)
    else:
        out['webhook'] = 'нет LOGIN_BOT_TOKEN'
    if ENV('GROUP_CHAT_ID') and (ENV('MAIN_BOT_TOKEN') or tok):
        try:
            r = tg_call(ENV('MAIN_BOT_TOKEN') or tok, 'getChat', chat_id=ENV('GROUP_CHAT_ID'))
            out['group'] = (r.get('result') or {}).get('title')
        except Exception as e:
            out['group_error'] = str(e)
    return out

def handler(event, context=None):
    headers = event.get('headers') or {}
    method = (event.get('httpMethod') or 'POST').upper()
    qs = event.get('queryStringParameters') or {}
    body = event.get('body') or ''
    if event.get('isBase64Encoded') and body: body = base64.b64decode(body).decode('utf-8', 'replace')
    ch = cors(headers)

    if method == 'OPTIONS': return {'statusCode': 204, 'headers': ch, 'body': ''}

    if qs.get('tg'):  # вебхук Telegram
        got = ''
        for k, v in headers.items():
            if k.lower() == 'x-telegram-bot-api-secret-token': got = v
        ok = hmac.compare_digest(got, tg_secret())
        try: get_db().cfg_set('last_hook', f'{now()} secret={"ok" if ok else ("bad" if got else "none")}')
        except Exception as e: print('last_hook', repr(e))
        if not ok: return resp(403, {'err': 'forbidden'})
        if qs.get('subs'):  # bot/notify.py спрашивает, кому слать уведомления
            try: return resp(200, {'users': nt_targets(get_db())})
            except Exception as e: print('subs', repr(e)); return resp(500, {'err': 'server'})
        if qs.get('ava'):   # мост присылает фото профиля: {uid, img: base64 jpeg | ''}
            try:
                d = json.loads(body or '{}'); img = str(d.get('img') or '')
                if len(img) <= 120_000: get_db().ava_set(int(d['uid']), img, now())
            except Exception as e: print('ava', repr(e))
            return resp(200, {'ok': True})
        try:
            r = handle_tg(json.loads(body or '{}'))
        except Exception as e:
            print('tg error', repr(e)); r = None
            try: get_db().cfg_set('last_error', f'{now()} {repr(e)[:300]}')
            except Exception: pass
        return resp(200, r or {})

    if qs.get('setup') is not None and method == 'GET':
        if not setup_key() or not hmac.compare_digest(str(qs.get('setup')), setup_key()): return resp(403, {'err': 'Неверный ключ настройки'})
        return resp(200, do_setup(context, headers))

    if qs.get('ava') and method == 'GET':   # аватарка участника (картинка), кэшируется на сутки
        try:
            r = get_db().ava_get(int(qs.get('ava')))
        except Exception:
            r = None
        if not r or not r['img']:   # нет фото — прозрачная точка (на сайте остаются инициалы)
            return {'statusCode': 200, 'headers': {'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=21600', 'Access-Control-Allow-Origin': '*'},
                    'body': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'isBase64Encoded': True}
        return {'statusCode': 200, 'headers': {'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*'},
                'body': r['img'], 'isBase64Encoded': True}

    if qs.get('net') is not None and method == 'GET':  # доступность сайтов из Облака
        import socket
        out = {}
        for host in ('api.telegram.org', 'ya.ru', 'api.github.com', 'raw.githubusercontent.com'):
            t0 = time.time()
            try:
                urllib.request.urlopen(f'https://{host}/', timeout=2.5).read(100); out[host] = f'ok {time.time()-t0:.2f}s'
            except urllib.error.HTTPError as e: out[host] = f'http {e.code} {time.time()-t0:.2f}s'
            except Exception as e: out[host] = f'fail {type(e).__name__} {time.time()-t0:.2f}s'
        return resp(200, out, ch)

    if qs.get('diag') is not None and method == 'GET':  # состояние без секретов
        db = get_db()
        return resp(200, {'bot_name': ENV('LOGIN_BOT_NAME', ''), 'group_connected': bool(db.cfg_get('group')), 'admin_set': bool(db.cfg_get('admin')),
                          'last_hook': db.cfg_get('last_hook'), 'last_error': db.cfg_get('last_error'), 'now': now()}, ch)

    if method == 'GET':
        return resp(200, {'ok': True, 'service': 'zubrezhka-api'}, ch)

    try:
        d = json.loads(body or '{}')
        if not isinstance(d, dict): raise Err('bad', 'Плохой запрос')
        return resp(200, api(d), ch)
    except Err as e:
        return resp(200, {'err': e.code, 'msg': e.msg}, ch)
    except Exception as e:
        print('api error', repr(e))
        return resp(200, {'err': 'server', 'msg': 'Ошибка сервера, попробуй ещё раз'}, ch)
