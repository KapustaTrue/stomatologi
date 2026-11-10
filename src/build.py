# Сборка сайта: python3 src/build.py  (запускать из корня репозитория)
import os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
r = lambda f: open(os.path.join(here, f), encoding='utf-8').read()
t = r('app.html')
data = "\n".join(r(f) for f in ['data_gen.js', 'svg_nurse.js', 'svg_nurse2.js', 'svg_gen5.js', 'svg_gen6.js', 'data_nurse.js', 'data_other.js', 'data_oral.js', 'data_nurse_oral.js', 'data_exam.js', 'data_nurse_more.js', 'data_full.js', 'data_jokes.js'])
# расписание — общий файл для сайта и бота
sch = os.path.join(root, 'schedule.json')
if os.path.exists(sch): data += '\n// расписание из schedule.json\nconst SCHEDULE = ' + open(sch, encoding='utf-8').read().strip() + ';'
head = '''<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="Зубрёжка">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="description" content="Конспекты, карточки и тесты группы С-201">'''
import hashlib
ft = os.path.join(root, 'fulltext.json')
ftver = hashlib.md5(open(ft, 'rb').read()).hexdigest()[:8] if os.path.exists(ft) else '0'
t = t.replace('/*DATA*/', data + "\nconst FT_VER = '" + ftver + "';").replace('/*APP*/', r('app.js')).replace('<!--SITEHEAD-->', head).replace('</style>', (r('theme.css') if os.path.exists(os.path.join(here, 'theme.css')) else '') + '\n</style>', 1)
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(t)
print('index.html собран')
# справочник мест для бота «Нашёл ошибку» (bot/places.json); без node просто остаётся прежний
import subprocess
try: subprocess.run(['node', os.path.join(here, 'build_places.js')], check=True)
except Exception as e: print('bot/places.json не обновлён (нужен node):', e)
