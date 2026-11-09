# Исходники сайта «Учёба · С-201»

- `data_gen.js`, `data_other.js` — лекции (краткие конспекты, карточки, тесты) по предметам.
- `data_oral.js` — вопросы для «Быстрого ответа».
- `data_full.js` — полные версии: страницы-картинки в `full/<id>/NN.webp`, PDF в `pdf/full/`.
- `app.js`, `app.html` — логика и вёрстка.
- Сборка: `python3 src/build.py` → `index.html`. После изменений поднять версию кэша в `sw.js` (s201-vN).
- Краткие PDF (`pdf/<id>.pdf`) печатаются headless Chrome из `window.__printable(id)`.
- Полные страницы: `pdftoppm -r 120 -png` → WebP 1100px, q74.
