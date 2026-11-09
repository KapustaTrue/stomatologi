# Сборка сайта: python3 src/build.py  (запускать из корня репозитория)
import os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
r = lambda f: open(os.path.join(here, f), encoding='utf-8').read()
t = r('app.html')
data = "\n".join(r(f) for f in ['data_gen.js', 'data_other.js', 'data_oral.js', 'data_full.js'])
head = '''<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="Учёба С-201">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="description" content="Конспекты, карточки и тесты группы С-201">'''
import hashlib
ft = os.path.join(root, 'fulltext.json')
ftver = hashlib.md5(open(ft, 'rb').read()).hexdigest()[:8] if os.path.exists(ft) else '0'
t = t.replace('/*DATA*/', data + "\nconst FT_VER = '" + ftver + "';").replace('/*APP*/', r('app.js')).replace('<!--SITEHEAD-->', head)
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(t)
print('index.html собран')
