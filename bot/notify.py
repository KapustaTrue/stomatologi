# Уведомления «Зубрёжки» в Telegram: новое ДЗ и изменения в расписании.
# Шлёт бот входа @zubrezhka_s201_bot тем, кто вошёл на сайт (и не выключил уведомления).
# Из Яндекс Облака Telegram недоступен, поэтому рассылка идёт отсюда, из GitHub Actions:
#   • ДЗ — сразу после того, как бот домашки записал homework.json (bot/homework_bot.py → notify_hw);
#   • расписание (и ДЗ, поправленное вручную) — при push в main (.github/workflows/notify.yml):
#       python3 bot/notify.py --old-sch old.json --old-hw old.json
#     В сообщении коммита «[тихо]» — ничего не рассылать (например, исправил опечатку).
# Список получателей и их настройки — с сервера (?tg=1&subs=1, тот же секрет, что у моста бота входа).
# Проверка без Telegram: NOTIFY_DRY=1 — печатает сообщения вместо отправки.
import os, sys, json, time, html, argparse, urllib.request, urllib.parse
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TZ = ZoneInfo('Europe/Moscow')
SITE = 'https://kapustatrue.github.io/stomatologi/'
DRY = os.environ.get('NOTIFY_DRY') == '1'
DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
DAYS_FULL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
esc = lambda s: html.escape(str(s or ''), quote=False)


def today(): return datetime.now(TZ).date()
def dlabel(d): return f'{DAYS[d.weekday()]}, {d.day} {MONTHS[d.month - 1]}'


# ---------- домашка ----------
def hw_changes(old, new):
    """Новые ДЗ и ДЗ с изменённым текстом (перенос на другую пару сам по себе не повод слать)."""
    was = {it.get('id'): it for it in (old or {}).get('items', [])}
    t = today(); out = []
    for it in (new or {}).get('items', []):
        if it.get('date') and date.fromisoformat(it['date']) < t: continue   # старое — не трогаем
        o = was.get(it.get('id'))
        if o is None: out.append(('new', it))
        elif (o.get('text') or '').strip() != (it.get('text') or '').strip(): out.append(('edit', it))
    return out


def hw_message(changes, sch):
    if not changes: return None
    times = (sch or {}).get('times', {})
    parts = []
    for kind, it in changes[:8]:
        if it.get('date'):
            d = date.fromisoformat(it['date']); n = it.get('pair')
            tm = (times.get(str(n)) or [''])[0]
            when = f'к паре {dlabel(d)}' + (f', {n} пара' if n else '') + (f' ({tm})' if tm else '')
        else:
            when = 'к ближайшей паре (ждём новое расписание)'
        head = '✏️ <b>ДЗ изменили</b>' if kind == 'edit' else '📌 <b>Новое ДЗ</b>'
        txt = (it.get('text') or '').strip()
        if len(txt) > 900: txt = txt[:900].rstrip() + '…'
        parts.append(f'{head} · {esc(it.get("subj"))}\n<i>{esc(when)}</i>\n\n{esc(txt)}'
                     + (f'\n\n<i>— {esc(it["author"])}</i>' if it.get('author') else ''))
    if len(changes) > 8: parts.append(f'…и ещё {len(changes) - 8} — смотри на сайте')
    return '\n\n➖➖➖\n\n'.join(parts)


# ---------- расписание ----------
def day_pairs(day):
    return [(p.get('n'), (p.get('subj') or '').strip(), str(p.get('room') or '').strip()) for p in sorted(day or [], key=lambda p: p.get('n') or 0)]


def day_text(day):
    """«1–2 · Микробиология (401)» — подряд идущие одинаковые пары склеиваем."""
    ps = sorted(day or [], key=lambda p: p.get('n') or 0)
    if not ps: return 'пар нет 🎉'
    groups = []
    for p in ps:
        g = groups[-1] if groups else None
        if g and g['subj'] == p.get('subj') and g['room'] == p.get('room') and g['to'] + 1 == p.get('n'):
            g['to'] = p['n']; g['chg'] = g['chg'] or p.get('chg')
        else:
            groups.append({'from': p.get('n'), 'to': p.get('n'), 'subj': p.get('subj'), 'room': p.get('room'), 'chg': p.get('chg')})
    out = []
    for g in groups:
        nn = f'{g["from"]}–{g["to"]}' if g['to'] != g['from'] else f'{g["from"]}'
        out.append(f'{nn} · {esc(g["subj"])}' + (f' ({esc(g["room"])})' if g['room'] else '') + (' 🔄' if g['chg'] else ''))
    return '; '.join(out)


def sch_message(old, new):
    if not new or not new.get('days'): return None
    mon = date.fromisoformat(new['monday'])
    t = today()
    if not old or old.get('monday') != new.get('monday'):
        end = mon + timedelta(days=5)
        rng = f'{mon.day}–{end.day} {MONTHS[end.month - 1]}' if mon.month == end.month else f'{mon.day} {MONTHS[mon.month - 1]} – {end.day} {MONTHS[end.month - 1]}'
        lines = [f'📅 <b>Новое расписание на неделю {rng}</b>', '']
        for i, day in enumerate(new['days'][:6]):
            lines.append(f'<b>{DAYS[i]}</b> — {day_text(day)}')
        if new.get('changes'):
            lines += ['', '🔄 <b>Замены:</b>'] + [f'• {esc(c)}' for c in new['changes'][:10]]
        return '\n'.join(lines)
    lines = []
    for i, day in enumerate(new['days'][:6]):
        d = mon + timedelta(days=i)
        if d < t: continue
        before = (old.get('days') or [])[i] if i < len(old.get('days') or []) else []
        if day_pairs(before) != day_pairs(day):
            lines += [f'<b>{dlabel(d)}</b>' + (' (сегодня)' if d == t else ' (завтра)' if d == t + timedelta(days=1) else ''),
                      f'было: {day_text(before)}', f'стало: <b>{day_text(day)}</b>', '']
    fresh = [c for c in new.get('changes') or [] if c not in (old.get('changes') or [])]
    if not lines and not fresh: return None
    out = ['🔄 <b>Изменения в расписании</b>', ''] + lines
    if fresh: out += ['📝 ' + esc(c) for c in fresh[:10]]
    return '\n'.join(out).strip()


# ---------- рассылка ----------
def api_url():
    return os.environ.get('API_URL') or open(os.path.join(ROOT, 'src', 'api_url.txt'), encoding='utf-8').read().strip()


def subscribers():
    sys.path.insert(0, os.path.join(ROOT, 'server'))
    import index as srv   # секрет моста — тот же, что считает сервер из токена бота входа
    url = api_url(); url += ('&' if '?' in url else '?') + 'tg=1&subs=1'
    req = urllib.request.Request(url, data=b'{}', headers={'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': srv.tg_secret()})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode()).get('users', [])
        except Exception as e:
            print('сервер не отдал список:', repr(e)[:200], flush=True); time.sleep(3 + attempt * 4)
    return []


def tg_send(token, chat_id, text):
    kb = {'inline_keyboard': [[{'text': '📅 Открыть расписание', 'url': SITE + '#raspisanie'}]]}
    data = urllib.parse.urlencode({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML', 'disable_web_page_preview': 'true',
                                   'reply_markup': json.dumps(kb)}).encode()
    req = urllib.request.Request(f'https://api.telegram.org/bot{token}/sendMessage', data=data)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())


def broadcast(kind, text, only_admins=False):
    """kind: 'hw' | 'sch' — по какой настройке фильтровать; only_admins — пробная рассылка только админу."""
    if not text: return 0
    footer = '\n\n<i>Настроить уведомления — /notify</i>'
    if DRY:
        print(f'--- [{kind}] ---\n{text}{footer}\n', flush=True); return 0
    token = os.environ.get('LOGIN_BOT_TOKEN', '').strip()
    if not token: print('нет LOGIN_BOT_TOKEN — уведомления не отправлены', flush=True); return 0
    users = [u for u in subscribers() if (u.get('adm') if only_admins else u.get(kind))]
    sent = 0
    for u in users:
        for attempt in range(2):
            try:
                tg_send(token, u['uid'], text + footer); sent += 1; break
            except urllib.error.HTTPError as e:
                body = e.read().decode('utf-8', 'replace')[:200]
                if e.code == 429:
                    try: time.sleep(int(json.loads(body)['parameters']['retry_after']) + 1); continue
                    except Exception: time.sleep(5); continue
                print(f'не доставлено ({e.code}): {body}', flush=True); break   # 403 — человек остановил бота
            except Exception as e:
                print('ошибка отправки:', repr(e)[:150], flush=True); time.sleep(2)
        time.sleep(0.05)
    print(f'уведомление [{kind}]: отправлено {sent} из {len(users)}', flush=True)
    return sent


def load(p, default=None):
    try: return json.load(open(p, encoding='utf-8'))
    except Exception: return default


def notify_hw(old_hw, new_hw, sch=None):
    sch = sch if sch is not None else load(os.path.join(ROOT, 'schedule.json'), {})
    return broadcast('hw', hw_message(hw_changes(old_hw, new_hw), sch))


def notify_sch(old_sch, new_sch):
    return broadcast('sch', sch_message(old_sch, new_sch))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--old-sch'); ap.add_argument('--old-hw')
    ap.add_argument('--test', action='store_true', help='пробное сообщение только админу')
    a = ap.parse_args()
    new_sch = load(os.path.join(ROOT, 'schedule.json'), {})
    if a.test:
        hw = load(os.path.join(ROOT, 'homework.json'), {'items': []}).get('items', [])
        sample = hw_message([('new', hw[-1])], new_sch) if hw else '📌 <b>Новое ДЗ</b> · Пример'
        sent = broadcast('hw', '🧪 <b>Проверка уведомлений</b> — так будет выглядеть сообщение:\n\n' + sample, only_admins=True)
        sys.exit(0 if sent else 1)
    if a.old_sch:
        old = load(a.old_sch, None)
        if old is not None: notify_sch(old, new_sch)
        else: print('нет старого расписания — пропускаю')
    if a.old_hw:
        old = load(a.old_hw, None)
        if old is not None: notify_hw(old, load(os.path.join(ROOT, 'homework.json'), {'items': []}), new_sch)
