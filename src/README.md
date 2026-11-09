# Исходники сайта «Зубрёжка · С-201»

- `data_gen.js`, `data_other.js` — лекции (краткие конспекты, карточки, тесты) по предметам.
- `data_oral.js` — вопросы для «Быстрого ответа».
- `data_full.js` — полные версии: страницы-картинки в `full/<id>/NN.webp`, PDF в `pdf/full/`.
- `app.js`, `app.html` — логика и вёрстка.
- Сборка: `python3 src/build.py` → `index.html`. После изменений поднять версию кэша в `sw.js` (s201-vN).
- Краткие PDF (`pdf/<id>.pdf`) печатаются headless Chrome из `window.__printable(id)`.
- Полные страницы: `pdftoppm -r 120 -png` → WebP 1100px, q74.
- Поиск по полным версиям: `python3 src/build_fulltext.py` (нужен pdftotext) → `fulltext.json`; затем `python3 src/build.py` (вшивает версию файла). Запускать после добавления или замены полной версии.
- Правило: краткий конспект охватывает все темы полной версии, включая «доп.» разделы.
- Оформление: `python3 src/build_theme.py` → `src/theme.css` (тема «Яркий» + ночной режим `html[data-theme=dark]`), build.py вшивает его в index.html. Шрифты (Unbounded, Golos Text) лежат в `fonts/`. Кнопка ☀️/🌙 в шапке, по умолчанию — как на телефоне.
