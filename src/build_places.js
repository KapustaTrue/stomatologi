// Справочник мест для бота «Нашёл ошибку»: node src/build_places.js → bot/places.json
// Бот по коду из ссылки (например e_3_sd-4) пишет админу «Сестринское дело · лекция 4 · раздел 4 „…“».
// Запускается из build.py автоматически.
const fs = require('fs'), path = require('path'), vm = require('vm');
const here = __dirname, root = path.dirname(here);
const files = ['data_gen.js', 'svg_nurse.js', 'svg_nurse2.js', 'data_nurse.js', 'data_other.js', 'data_oral.js', 'data_nurse_oral.js', 'data_exam.js', 'data_nurse_more.js', 'data_full.js', 'data_jokes.js'];
const code = files.map(f => fs.readFileSync(path.join(here, f), 'utf8')).join('\n') + '\n;({SUBJECTS, EXAM, FULL})';
const { SUBJECTS, EXAM, FULL } = vm.runInNewContext(code, { window: {}, console });
const txt = s => String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
const out = { site: 'https://kapustatrue.github.io/stomatologi/', lec: {}, exam: {} };
SUBJECTS.forEach(s => s.lectures.forEach(l => {
  if (l.soon) return;
  out.lec[l.id] = {
    s: s.short, n: l.num, t: txt(l.title), full: !!FULL[l.id],
    sec: (l.sections || []).map(x => txt(x.title)),
    cards: (l.cards || []).map(c => txt(c[0])),
    quiz: (l.quiz || []).map(q => txt(q.q)),
  };
}));
Object.keys(EXAM || {}).forEach(sid => {
  const E = EXAM[sid];
  out.exam[sid] = { t: txt(E.title), theory: Object.fromEntries(E.theory.map(it => [it.n, txt(it.q)])), practice: Object.fromEntries(E.practice.map(it => [it.n, txt(it.q)])) };
});
fs.writeFileSync(path.join(root, 'bot', 'places.json'), JSON.stringify(out, null, 0) + '\n');
console.log('bot/places.json:', Object.keys(out.lec).length, 'лекций,', Object.keys(out.exam).length, 'экзаменов');
