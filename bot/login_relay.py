# Бот входа @zubrezhka_s201_bot: мост Telegram ⇄ сервер в Яндекс Облаке.
# Telegram и Облако не достают друг до друга, поэтому бот живёт в GitHub Actions:
# долгий опрос getUpdates (сообщения приходят сразу) → пересылаем на сервер (?tg=1) →
# если сервер вернул ответ ({method: …}) — выполняем его в Telegram.
# Запуск: .github/workflows/login-bot.yml (работает ~5 ч 50 мин, следующая смена подхватывает).
import os, sys, json, time, urllib.request, urllib.parse
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'server'))
TOKEN = os.environ['LOGIN_BOT_TOKEN']
API = os.environ.get('API_URL') or open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'api_url.txt')).read().strip()
RUN_FOR = int(os.environ.get('RUN_FOR', 5 * 3600 + 50 * 60))
import index as srv   # только чтобы посчитать секрет вебхука (тот же, что у сервера)
SECRET = srv.tg_secret()

def tg(method, timeout=65, **p):
    data = urllib.parse.urlencode({k: (json.dumps(v) if isinstance(v, (dict, list)) else v) for k, v in p.items()}).encode()
    with urllib.request.urlopen(urllib.request.Request(f'https://api.telegram.org/bot{TOKEN}/{method}', data=data), timeout=timeout) as r:
        return json.loads(r.read().decode())

def getupd(params):
    data = urllib.parse.urlencode({k: (json.dumps(v) if isinstance(v, list) else v) for k, v in params.items()}).encode()
    with urllib.request.urlopen(urllib.request.Request(f'https://api.telegram.org/bot{TOKEN}/getUpdates', data=data), timeout=65) as r:
        return json.loads(r.read().decode())

def to_server(update):
    req = urllib.request.Request(API + ('&' if '?' in API else '?') + 'tg=1', data=json.dumps(update).encode(),
                                 headers={'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': SECRET})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode() or '{}')
        except Exception as e:
            print('сервер недоступен:', repr(e)[:200], flush=True); time.sleep(2 + attempt * 3)
    return None

import base64
AVA_DONE = {}   # uid → когда обновляли фото (раз в 6 часов на смену хватает)
def sync_ava(user):
    uid = user.get('id')
    if not uid or user.get('is_bot') or time.time() - AVA_DONE.get(uid, 0) < 6 * 3600: return
    AVA_DONE[uid] = time.time()
    img = ''
    try:
        ph = tg('getUserProfilePhotos', timeout=15, user_id=uid, limit=1).get('result', {}).get('photos') or []
        if ph:
            small = sorted(ph[0], key=lambda x: x.get('width', 0))
            pick = next((x for x in small if x.get('width', 0) >= 120), small[-1])
            path = tg('getFile', timeout=15, file_id=pick['file_id'])['result']['file_path']
            with urllib.request.urlopen(f'https://api.telegram.org/file/bot{TOKEN}/{path}', timeout=20) as r:
                raw = r.read()
            if len(raw) < 85_000: img = base64.b64encode(raw).decode()
    except Exception as e:
        print('фото не получено:', repr(e)[:150], flush=True)
    try:
        req = urllib.request.Request(API + ('&' if '?' in API else '?') + 'tg=1&ava=1', data=json.dumps({'uid': uid, 'img': img}).encode(),
                                     headers={'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': SECRET})
        urllib.request.urlopen(req, timeout=20).read()
    except Exception as e:
        print('фото не отправлено:', repr(e)[:150], flush=True)

print('удаляю вебхук (бот работает опросом):', tg('deleteWebhook', timeout=20).get('ok'), flush=True)
start, offset = time.time(), None
while time.time() - start < RUN_FOR:
    try:
        params = {'timeout': 50, 'allowed_updates': ['message']}
        if offset: params['offset'] = offset
        res = getupd(params)
    except Exception as e:
        print('getUpdates:', repr(e)[:200], flush=True); time.sleep(5); continue
    for u in res.get('result', []):
        offset = u['update_id'] + 1
        m = u.get('message') or {}
        print('→', (m.get('chat') or {}).get('type'), 'text' if m.get('text') else 'service', flush=True)
        r = to_server(u)
        if r and r.get('method'):
            meth = r.pop('method')
            try: tg(meth, timeout=20, **r)
            except Exception as e: print('ответ не отправлен:', repr(e)[:200], flush=True)
        if m.get('from'): sync_ava(m['from'])
        for nu in m.get('new_chat_members') or []: sync_ava(nu)
# отмечаем последний offset, чтобы следующая смена не получила те же сообщения
if offset:
    try: getupd({'offset': offset, 'timeout': 0})
    except Exception: pass
print('смена закончена', flush=True)
