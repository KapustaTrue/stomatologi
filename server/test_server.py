# Локальная проверка сервера (SQLite вместо YDB, Telegram подменён): python3 server/test_server.py
import os, sys, json, tempfile
os.environ['DB_FILE'] = tempfile.mktemp(suffix='.sqlite')
os.environ['YDB_ENDPOINT'] = ''          # тесты всегда на SQLite
os.environ['LOGIN_BOT_TOKEN'] = '123:test'
os.environ['GROUP_CHAT_ID'] = '-100'
os.environ['SETUP_KEY'] = 'k'
os.environ['LOGIN_BOT_NAME'] = 'zubrezhka_s201_bot'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import index

def fake_tg(*a, **k): raise AssertionError('из Облака в Telegram ходить нельзя')
index.tg_call = fake_tg

H = {'Origin': 'https://kapustatrue.github.io'}
def call(d):
    r = index.handler({'httpMethod': 'POST', 'headers': H, 'body': json.dumps(d)})
    assert r['headers']['Access-Control-Allow-Origin'] == 'https://kapustatrue.github.io'
    return json.loads(r['body'])
def tg(update):
    r = index.handler({'httpMethod': 'POST', 'headers': {'X-Telegram-Bot-Api-Secret-Token': index.tg_secret()},
                       'queryStringParameters': {'tg': '1'}, 'body': json.dumps(update)})
    return r['statusCode'], json.loads(r['body'])
def start(uid, code, first='Маша'):
    return tg({'message': {'chat': {'id': uid, 'type': 'private'}, 'from': {'id': uid, 'first_name': first}, 'text': f'/start {code}'}})

def login(uid, first):
    c = call({'a': 'login_start'}); assert c['bot'] == 'zubrezhka_s201_bot'
    assert call({'a': 'login_check', 'code': c['code']})['st'] == 'wait'
    st, r = start(uid, c['code'], first); assert st == 200 and r['method'] == 'sendMessage', r
    return c['code'], call({'a': 'login_check', 'code': c['code']})

# --- вебхук без секрета не принимается
r = index.handler({'httpMethod': 'POST', 'headers': {}, 'queryStringParameters': {'tg': '1'}, 'body': '{}'})
assert r['statusCode'] == 403
# --- setup
r = index.handler({'httpMethod': 'GET', 'headers': {}, 'queryStringParameters': {'setup': 'bad'}}); assert r['statusCode'] == 403
r = index.handler({'httpMethod': 'GET', 'headers': {}, 'queryStringParameters': {'setup': 'k'}}); assert r['statusCode'] == 200, r

def group(uid, first, extra=None, chat=-100):
    m = {'chat': {'id': chat, 'type': 'supergroup'}, 'from': {'id': uid, 'first_name': first}}
    m.update(extra or {'text': 'привет'}); return tg({'message': m})

# --- бот ещё не в группе
c = call({'a': 'login_start'}); st, rr = start(1, c['code'], 'Маша'); assert 'не подключён' in rr['text'], rr
# --- Лёша добавляет бота в чат группы → группа запомнена, Лёша — админ
st, rr = group(3, 'Лёша', {'new_chat_members': [{'id': 999, 'is_bot': True, 'username': 'zubrezhka_s201_bot'}]})
assert rr['method'] == 'sendMessage' and rr['chat_id'] == -100, rr
# --- чужая группа → бот уходит
st, rr = group(7, 'Чужой', {'new_chat_members': [{'id': 999, 'is_bot': True, 'username': 'zubrezhka_s201_bot'}]}, chat=-555)
assert rr['method'] == 'leaveChat'
group(1, 'Маша')                                  # Маша пишет в чат → участница
group(8, 'Чужой', chat=-555)                      # сообщение из чужой группы не считается
# --- вход участника
code, r = login(1, 'Маша'); assert r['st'] == 'ok' and r['user']['name'] == 'Маша' and not r['user']['adm'], r
masha = r['token']
assert call({'a': 'login_check', 'code': code})['st'] == 'expired'   # код одноразовый
# --- не видели в чате → пишет в чат → пускает сам
c = call({'a': 'login_start'}); st, rr = start(2, c['code'], 'Петя'); assert '👀' in rr['text']
assert call({'a': 'login_check', 'code': c['code']})['st'] == 'notseen'
group(2, 'Петя'); r = call({'a': 'login_check', 'code': c['code']}); assert r['st'] == 'ok' and r['user']['uid'] == 2, r
# --- из чужой группы не пускает
c = call({'a': 'login_start'}); start(8, c['code'], 'Чужой'); assert call({'a': 'login_check', 'code': c['code']})['st'] == 'notseen'
# --- вышел из чата → больше не пускает; вступил по ссылке → пускает
group(3, 'Лёша', {'left_chat_member': {'id': 2, 'first_name': 'Петя'}})
c = call({'a': 'login_start'}); start(2, c['code'], 'Петя'); assert call({'a': 'login_check', 'code': c['code']})['st'] == 'notseen'
group(4, 'Вера', {'new_chat_members': [{'id': 4, 'first_name': 'Вера'}]})
_, r = login(4, 'Вера'); assert r['st'] == 'ok'
# --- создатель = админ
_, r = login(3, 'Лёша'); assert r['user']['adm'], r; lesha = r['token']
# --- /start без кода
st, rr = tg({'message': {'chat': {'id': 5, 'type': 'private'}, 'from': {'id': 5, 'first_name': 'X'}, 'text': '/start'}}); assert 'Зубрёжка' in rr['text']
assert json.loads(index.handler({'httpMethod': 'GET', 'headers': {}, 'queryStringParameters': {'diag': '1'}})['body'])['group_connected']

# --- без токена закрыто, плохой токен закрыт
assert call({'a': 'msgs', 'room': 'general'})['err'] == 'auth'
assert call({'a': 'msgs', 'room': 'general', 't': masha[:-2] + 'xx'})['err'] == 'auth'
assert call({'a': 'hello', 't': masha})['user']['name'] == 'Маша'

# --- чат
r = call({'a': 'send', 't': masha, 'room': 'general', 'text': '  привет  '}); assert r['msgs'][-1]['text'] == 'привет'
first_id = r['id']
r = call({'a': 'send', 't': lesha, 'room': 'general', 'text': 'хай', 'after': first_id}); assert [m['text'] for m in r['msgs']] == ['хай']
assert len(call({'a': 'msgs', 't': masha, 'room': 'general'})['msgs']) == 2
assert [m['text'] for m in call({'a': 'msgs', 't': masha, 'room': 'general', 'after': first_id})['msgs']] == ['хай']
assert call({'a': 'send', 't': masha, 'room': 'general', 'text': '   '})['err'] == 'bad'
assert call({'a': 'send', 't': masha, 'room': 'evil', 'text': 'x'})['err'] == 'bad'
assert call({'a': 'del_msg', 't': masha, 'room': 'general', 'id': r['id']})['err'] == 'forbidden'   # чужое
assert call({'a': 'del_msg', 't': lesha, 'room': 'general', 'id': first_id})['ok']                  # админ может
m = call({'a': 'msgs', 't': masha, 'room': 'general'})['msgs'][0]; assert m['del'] and m['text'] == ''
assert call({'a': 'ping', 't': masha})['last']['text'] == 'хай'
assert call({'a': 'send', 't': masha, 'room': 'lec:gen-5', 'text': 'по лекции'})['msgs'][0]['text'] == 'по лекции'

# --- вопросы
r = call({'a': 'q_add', 't': masha, 'lec': 'gen-5', 'texts': ['Что такое ген?', '', 'Кодоминирование']})
assert r['added'] == 2 and [q['text'] for q in r['qs']] == ['Что такое ген?', 'Кодоминирование']
q1, q2 = r['qs'][0]['id'], r['qs'][1]['id']
r = call({'a': 'q_claim', 't': masha, 'lec': 'gen-5', 'qid': q1, 'on': True}); assert r['qs'][0]['who'] == [{'uid': 1, 'name': 'Маша'}]
r = call({'a': 'q_claim', 't': lesha, 'lec': 'gen-5', 'qid': q1, 'on': True}); assert len(r['qs'][0]['who']) == 2
r = call({'a': 'q_claim', 't': lesha, 'lec': 'gen-5', 'qid': q1, 'on': False}); assert len(r['qs'][0]['who']) == 1
assert call({'a': 'q_sum', 't': masha})['sum'] == {'gen-5': [2, 1]}
r = call({'a': 'q_del', 't': lesha, 'lec': 'gen-5', 'qid': q2}); assert len(r['qs']) == 1    # админ удаляет чужой
r = call({'a': 'q_add', 't': lesha, 'lec': 'gen-5', 'texts': 'Мой вопрос'}); q3 = r['qs'][-1]['id']
assert call({'a': 'q_del', 't': masha, 'lec': 'gen-5', 'qid': q3})['err'] == 'forbidden'
assert call({'a': 'q_claim', 't': masha, 'lec': 'gen-5', 'qid': 'nope', 'on': True})['err'] == 'gone'
# вопросы по плану лекции (p0, p1…) — берутся без добавления в базу
r = call({'a': 'q_claim', 't': masha, 'lec': 'gen-7', 'qid': 'p2', 'on': True}); assert r['pc'] == {'p2': [{'uid': 1, 'name': 'Маша'}]} and r['qs'] == []
assert call({'a': 'qs', 't': lesha, 'lec': 'gen-7'})['pc']['p2'][0]['name'] == 'Маша'
assert call({'a': 'q_sum', 't': masha})['sum']['gen-7'] == [0, 1]
r = call({'a': 'q_claim', 't': masha, 'lec': 'gen-7', 'qid': 'p2', 'on': False}); assert r['pc'] == {}
assert call({'a': 'qs', 't': masha, 'lec': '../x'})['err'] == 'bad'
r = call({'a': 'q_del', 't': masha, 'lec': 'gen-5', 'qid': q1}); assert [q['text'] for q in r['qs']] == ['Мой вопрос']

# --- прогресс
assert call({'a': 'prog_get', 't': masha})['data'] is None
ts = call({'a': 'prog_put', 't': masha, 'data': {'known': {'gen-5': [0, 2]}, 'best': {'gen-5': 7}}})['ts']
r = call({'a': 'prog_get', 't': masha}); assert r['data']['best']['gen-5'] == 7 and r['ts'] == ts
assert call({'a': 'prog_get', 't': lesha})['data'] is None

# --- preflight и GET
r = index.handler({'httpMethod': 'OPTIONS', 'headers': H}); assert r['statusCode'] == 204
r = index.handler({'httpMethod': 'GET', 'headers': H}); assert json.loads(r['body'])['ok']
# --- текст в base64 (так бывает в Яндекс Облаке)
import base64
r = index.handler({'httpMethod': 'POST', 'headers': H, 'isBase64Encoded': True, 'body': base64.b64encode(json.dumps({'a': 'hello'}).encode()).decode()})
assert json.loads(r['body'])['ok']
# --- аватарки: мост присылает фото, сайт получает картинку
r = index.handler({'httpMethod': 'POST', 'headers': {'x-telegram-bot-api-secret-token': index.tg_secret()}, 'queryStringParameters': {'tg': '1', 'ava': '1'},
                   'body': json.dumps({'uid': 1, 'img': base64.b64encode(b'\xff\xd8jpeg').decode()})}); assert r['statusCode'] == 200
r = index.handler({'httpMethod': 'GET', 'headers': {}, 'queryStringParameters': {'ava': '1'}}); assert r['statusCode'] == 200 and r['isBase64Encoded'] and base64.b64decode(r['body']) == b'\xff\xd8jpeg'
assert index.handler({'httpMethod': 'GET', 'headers': {}, 'queryStringParameters': {'ava': '2'}})['headers']['Content-Type'] == 'image/gif'
r = index.handler({'httpMethod': 'POST', 'headers': {}, 'queryStringParameters': {'tg': '1', 'ava': '1'}, 'body': '{}'}); assert r['statusCode'] == 403
print('✅ все проверки сервера прошли')
