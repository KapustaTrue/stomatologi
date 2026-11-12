# Рендер костей BodyParts3D
1. STL из github.com/Kevin-Mattheus-Moerman/BodyParts3D (assets/BodyParts3D_data/stl/FMA*.stl) → папка `stl/`; `npm i three@0.160.0`.
2. `python3 -m http.server 8766` в этой папке; `python3 shot.py out/x.png "f=FMA52738&az=-90&el=5&w=1200&h=900&zoom=0.62"`.
3. Подписи: `python3 label.py spec.json` (пример — spec_final.json).
Лицензия рисунков: CC BY-SA 2.1 JP, © DBCLS.
