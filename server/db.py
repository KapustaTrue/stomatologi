# Хранилище «Зубрёжки»: YDB (Яндекс Облако) в бою, SQLite — для локальной проверки.
# Выбор: если задан YDB_ENDPOINT — YDB, иначе SQLite-файл (DB_FILE, по умолчанию /tmp/zubr.sqlite).
import os, json

TABLES = {
    'codes':  ('code Utf8, ts Int64, uid Int64, name Utf8, uname Utf8, st Utf8, adm Bool', 'code'),
    'users':  ('uid Int64, name Utf8, uname Utf8, ts Int64', 'uid'),
    'msgs':   ('room Utf8, id Utf8, uid Int64, name Utf8, text Utf8, ts Int64, del Bool', 'room, id'),
    'qs':     ('lec Utf8, id Utf8, text Utf8, uid Int64, name Utf8, ts Int64', 'lec, id'),
    'claims': ('lec Utf8, qid Utf8, uid Int64, name Utf8, ts Int64', 'lec, qid, uid'),
    'prog':   ('uid Int64, js Utf8, ts Int64', 'uid'),
}


class Base:
    # --- общие ---
    def msg_row(self, r):
        return {'id': r['id'], 'uid': int(r['uid']), 'name': r['name'], 'text': '' if r['del'] else r['text'],
                'ts': int(r['ts']), 'del': bool(r['del'])}


# ======================= SQLite (локально) =======================
class SqliteDB(Base):
    def __init__(self, path):
        import sqlite3
        self.c = sqlite3.connect(path, check_same_thread=False)
        self.c.row_factory = sqlite3.Row

    def setup(self):
        tmap = {'Utf8': 'TEXT', 'Int64': 'INTEGER', 'Bool': 'INTEGER'}
        for name, (cols, pk) in TABLES.items():
            cdef = ', '.join(f"{c.split()[0]} {tmap[c.split()[1]]}" for c in cols.split(', '))
            self.c.execute(f'CREATE TABLE IF NOT EXISTS {name} ({cdef}, PRIMARY KEY ({pk}))')
        self.c.commit()
        return ['sqlite ok']

    def _q(self, sql, *a):
        cur = self.c.execute(sql, a); rows = [dict(r) for r in cur.fetchall()]; self.c.commit(); return rows

    def code_new(self, code, ts): self._q("INSERT OR REPLACE INTO codes VALUES (?,?,0,'','','new',0)", code, ts)
    def code_get(self, code):
        r = self._q('SELECT * FROM codes WHERE code=?', code); return r[0] if r else None
    def code_set(self, code, uid, name, uname, st, adm):
        self._q('UPDATE codes SET uid=?, name=?, uname=?, st=?, adm=? WHERE code=?', uid, name, uname, st, int(adm), code)
    def code_del(self, code): self._q('DELETE FROM codes WHERE code=?', code)
    def codes_gc(self, before): self._q('DELETE FROM codes WHERE ts < ?', before)

    def user_upsert(self, uid, name, uname, ts): self._q('INSERT OR REPLACE INTO users VALUES (?,?,?,?)', uid, name, uname, ts)

    def msg_add(self, room, id, uid, name, text, ts): self._q('INSERT INTO msgs VALUES (?,?,?,?,?,?,0)', room, id, uid, name, text, ts)
    def msg_get(self, room, id):
        r = self._q('SELECT * FROM msgs WHERE room=? AND id=?', room, id); return r[0] if r else None
    def msg_del(self, room, id): self._q("UPDATE msgs SET del=1, text='' WHERE room=? AND id=?", room, id)
    def msgs_last(self, room, n):
        return [self.msg_row(r) for r in reversed(self._q('SELECT * FROM msgs WHERE room=? ORDER BY id DESC LIMIT ?', room, n))]
    def msgs_after(self, room, after, n):
        return [self.msg_row(r) for r in self._q('SELECT * FROM msgs WHERE room=? AND id>? ORDER BY id LIMIT ?', room, after, n)]
    def room_last(self, room):
        r = self._q('SELECT id, name, text, del FROM msgs WHERE room=? ORDER BY id DESC LIMIT 1', room)
        return r[0] if r else None

    def q_add(self, lec, id, text, uid, name, ts): self._q('INSERT INTO qs VALUES (?,?,?,?,?,?)', lec, id, text, uid, name, ts)
    def q_get(self, lec, id):
        r = self._q('SELECT * FROM qs WHERE lec=? AND id=?', lec, id); return r[0] if r else None
    def q_del(self, lec, id):
        self._q('DELETE FROM qs WHERE lec=? AND id=?', lec, id); self._q('DELETE FROM claims WHERE lec=? AND qid=?', lec, id)
    def q_list(self, lec):
        return self._q('SELECT * FROM qs WHERE lec=? ORDER BY id', lec), self._q('SELECT * FROM claims WHERE lec=? ORDER BY ts', lec)
    def claim(self, lec, qid, uid, name, ts, on):
        if on: self._q('INSERT OR REPLACE INTO claims VALUES (?,?,?,?,?)', lec, qid, uid, name, ts)
        else: self._q('DELETE FROM claims WHERE lec=? AND qid=? AND uid=?', lec, qid, uid)
    def q_summary(self):
        a = self._q('SELECT lec, COUNT(*) AS n FROM qs GROUP BY lec')
        b = self._q('SELECT lec, COUNT(DISTINCT qid) AS n FROM claims GROUP BY lec')
        return a, b

    def prog_get(self, uid):
        r = self._q('SELECT * FROM prog WHERE uid=?', uid); return r[0] if r else None
    def prog_put(self, uid, data, ts): self._q('INSERT OR REPLACE INTO prog VALUES (?,?,?)', uid, data, ts)


# ======================= YDB (Яндекс Облако) =======================
class YdbDB(Base):
    def __init__(self, endpoint, database):
        import ydb, ydb.iam
        self.ydb = ydb
        T = ydb.PrimitiveType
        self.T = {str: T.Utf8, int: T.Int64, bool: T.Bool}
        creds = ydb.iam.MetadataUrlCredentials() if not os.environ.get('YDB_SA_KEY_FILE') else \
            ydb.iam.ServiceAccountCredentials.from_file(os.environ['YDB_SA_KEY_FILE'])
        self.driver = ydb.Driver(endpoint=endpoint, database=database, credentials=creds)
        self.driver.wait(fail_fast=True, timeout=8)
        self.pool = ydb.QuerySessionPool(self.driver)

    def _q(self, sql, **p):
        """Запрос с параметрами: _q('SELECT ... WHERE a=$a', a='x'). Возвращает строки первого результата (или все наборы при many)."""
        decl = ''.join(f'DECLARE ${k} AS {self.T[type(v)]};\n' for k, v in p.items())
        params = {f'${k}': (v, self.T[type(v)]) for k, v in p.items()}
        rs = self.pool.execute_with_retries(decl + sql, params)
        return [[dict(r) for r in s.rows] for s in rs]

    def _rows(self, sql, **p):
        res = self._q(sql, **p); return res[0] if res else []

    def setup(self):
        out = []
        for name, (cols, pk) in TABLES.items():
            for sql in (f'CREATE TABLE IF NOT EXISTS {name} ({cols}, PRIMARY KEY ({pk}))', f'CREATE TABLE {name} ({cols}, PRIMARY KEY ({pk}))'):
                try:
                    self.pool.execute_with_retries(sql); out.append(f'{name}: ok'); break
                except Exception as e:
                    msg = str(e)
                    if 'exist' in msg.lower(): out.append(f'{name}: уже есть'); break
                    out.append(f'{name}: {msg[:160]}')
        return out

    def code_new(self, code, ts):
        self._q('UPSERT INTO codes (code, ts, uid, name, uname, st, adm) VALUES ($code, $ts, $z, $e, $e, $st, $f);',
                code=code, ts=ts, z=0, e='', st='new', f=False)
    def code_get(self, code): r = self._rows('SELECT * FROM codes WHERE code = $code;', code=code); return r[0] if r else None
    def code_set(self, code, uid, name, uname, st, adm):
        self._q('UPDATE codes SET uid = $uid, name = $name, uname = $uname, st = $st, adm = $adm WHERE code = $code;',
                code=code, uid=uid, name=name, uname=uname, st=st, adm=bool(adm))
    def code_del(self, code): self._q('DELETE FROM codes WHERE code = $code;', code=code)
    def codes_gc(self, before): self._q('DELETE FROM codes WHERE ts < $b;', b=before)

    def user_upsert(self, uid, name, uname, ts):
        self._q('UPSERT INTO users (uid, name, uname, ts) VALUES ($uid, $name, $uname, $ts);', uid=uid, name=name, uname=uname, ts=ts)

    def msg_add(self, room, id, uid, name, text, ts):
        self._q('UPSERT INTO msgs (room, id, uid, name, text, ts, del) VALUES ($room, $id, $uid, $name, $text, $ts, $f);',
                room=room, id=id, uid=uid, name=name, text=text, ts=ts, f=False)
    def msg_get(self, room, id): r = self._rows('SELECT * FROM msgs WHERE room = $room AND id = $id;', room=room, id=id); return r[0] if r else None
    def msg_del(self, room, id): self._q('UPDATE msgs SET del = $t, text = $e WHERE room = $room AND id = $id;', room=room, id=id, t=True, e='')
    def msgs_last(self, room, n):
        rows = self._rows(f'SELECT * FROM msgs WHERE room = $room ORDER BY room DESC, id DESC LIMIT {int(n)};', room=room)
        return [self.msg_row(r) for r in reversed(rows)]
    def msgs_after(self, room, after, n):
        rows = self._rows(f'SELECT * FROM msgs WHERE room = $room AND id > $after ORDER BY room, id LIMIT {int(n)};', room=room, after=after)
        return [self.msg_row(r) for r in rows]
    def room_last(self, room):
        r = self._rows('SELECT id, name, text, del FROM msgs WHERE room = $room ORDER BY room DESC, id DESC LIMIT 1;', room=room)
        return r[0] if r else None

    def q_add(self, lec, id, text, uid, name, ts):
        self._q('UPSERT INTO qs (lec, id, text, uid, name, ts) VALUES ($lec, $id, $text, $uid, $name, $ts);', lec=lec, id=id, text=text, uid=uid, name=name, ts=ts)
    def q_get(self, lec, id): r = self._rows('SELECT * FROM qs WHERE lec = $lec AND id = $id;', lec=lec, id=id); return r[0] if r else None
    def q_del(self, lec, id):
        self._q('DELETE FROM qs WHERE lec = $lec AND id = $id; DELETE FROM claims WHERE lec = $lec AND qid = $id;', lec=lec, id=id)
    def q_list(self, lec):
        res = self._q('SELECT * FROM qs WHERE lec = $lec ORDER BY lec, id; SELECT * FROM claims WHERE lec = $lec;', lec=lec)
        qs, cl = (res + [[], []])[:2]
        return qs, sorted(cl, key=lambda r: r['ts'])
    def claim(self, lec, qid, uid, name, ts, on):
        if on: self._q('UPSERT INTO claims (lec, qid, uid, name, ts) VALUES ($lec, $qid, $uid, $name, $ts);', lec=lec, qid=qid, uid=uid, name=name, ts=ts)
        else: self._q('DELETE FROM claims WHERE lec = $lec AND qid = $qid AND uid = $uid;', lec=lec, qid=qid, uid=uid)
    def q_summary(self):
        res = self._q('SELECT lec, COUNT(*) AS n FROM qs GROUP BY lec; SELECT lec, COUNT(DISTINCT qid) AS n FROM claims GROUP BY lec;')
        a, b = (res + [[], []])[:2]
        return a, b

    def prog_get(self, uid): r = self._rows('SELECT * FROM prog WHERE uid = $uid;', uid=uid); return r[0] if r else None
    def prog_put(self, uid, data, ts): self._q('UPSERT INTO prog (uid, js, ts) VALUES ($uid, $js, $ts);', uid=uid, js=data, ts=ts)


_db = None
def get_db():
    global _db
    if _db is None:
        ep = os.environ.get('YDB_ENDPOINT', '').strip()
        if ep:
            db = os.environ.get('YDB_DATABASE', '').strip()
            if '?database=' in ep:  # можно вставить эндпоинт целиком из консоли
                ep, db2 = ep.split('?database=', 1); ep = ep.rstrip('/'); db = db or db2
            _db = YdbDB(ep, db)
        else:
            _db = SqliteDB(os.environ.get('DB_FILE', '/tmp/zubr.sqlite'))
            _db.setup()
    return _db
