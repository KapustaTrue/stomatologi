# Исходники сайта «Зубрёжка · С-201»

- `data_gen.js`, `data_other.js`, `data_nurse.js` — лекции (краткие конспекты, карточки, тесты) по предметам. `data_nurse.js` — «Основы сестринского дела» (Сажнова Е.Ю.), схемы к нему — `svg_nurse.js` (`SVG_EXTRA`, подмешивается в `SVGS`).
- `data_exam.js` — вопросы к экзамену (`EXAM[subjectId]`: theory/practice, у каждого `short` — кратко, `full` — полный ответ блоками). Экран `#exam-<subjectId>`, кнопка на странице предмета; PDF: `pdf/exam-<id>.pdf` и `pdf/exam-<id>-short.pdf` из `window.__printableExam(id, 'full'|'short')`. Вопросы экзамена попадают в «Быстрый ответ».
- `data_nurse_oral.js` — устный опрос по сестринскому делу (дополняет `ORAL`).
- `data_oral.js` — вопросы для «Быстрого ответа».
- `data_full.js` — полные версии: страницы-картинки в `full/<id>/NN.webp`, PDF в `pdf/full/`.
- `app.js`, `app.html` — логика и вёрстка.
- Сборка: `python3 src/build.py` → `index.html`. После изменений поднять версию кэша в `sw.js` (s201-vN).
- Краткие PDF (`pdf/<id>.pdf`) печатаются headless Chrome из `window.__printable(id)`.
- Полные страницы: `pdftoppm -r 120 -png` → WebP 1100px, q74. Для фото тетради (сестринское дело): обрезка + WebP 1000px q60, PDF полной версии с невидимым текстовым слоем (расшифровка) — чтобы работал поиск.
- Поиск по полным версиям: `python3 src/build_fulltext.py` (нужен pdftotext) → `fulltext.json`; затем `python3 src/build.py` (вшивает версию файла). Запускать после добавления или замены полной версии.
- Правило: краткий конспект охватывает все темы полной версии, включая «доп.» разделы.
- Оформление: `python3 src/build_theme.py` → `src/theme.css` (тема «Яркий» + ночной режим `html[data-theme=dark]`), build.py вшивает его в index.html. Шрифты (Unbounded, Golos Text) лежат в `fonts/`. Кнопка ☀️/🌙 в шапке, по умолчанию — как на телефоне.
- Расписание: `schedule.json` в корне (понедельник недели + пары по дням Пн–Сб; читают и сайт, и бот). Раз в неделю присылают новое — меняем файл, `build.py`, версия кэша в `sw.js`, push. Раздел `#raspisanie`, кнопка на главной показывает текущую/следующую пару.
- Домашка из Telegram: бот `bot/homework_bot.py` запускается GitHub Actions каждые 5 минут (`.github/workflows/homework-bot.yml`), забирает сообщения `#дз предмет текст` / `/dz ...` из чата группы, прикрепляет к ближайшей паре по `schedule.json` и пишет `homework.json`. Сайт читает его с raw.githubusercontent.com (без пересборки). Нужен секрет репозитория `TELEGRAM_BOT_TOKEN`; группа привязывается командой `/dzstart` (`bot/config.json`). Проверка без Telegram: `BOT_DRY_RUN=1`.

- Сестринское дело, иллюстрации (с 9 ноября 2026): схемы `svg_nurse.js` + `svg_nurse2.js` (там же иконки Healthicons, MIT — `HI_ICONS`); рисунки в `img/sd/*.svg` из Bioicons (Servier Medical Art CC BY 3.0, DBCLS CC BY 4.0, OpenClipart/CC0), слайды преподавателя `img/sd/slide-*.webp`. Блок `['img', путь, подпись]` — картинка в конспекте. Полная версия — `window.__printableFull(id)` (краткие разделы + `more` из `data_nurse_more.js`) → `pdf/full/sd-N.pdf` → страницы `full/sd-N/NN.webp` (pdftoppm -r 120, WebP 1100 q74). У вопросов экзамена `pics` — картинки к ответу.
