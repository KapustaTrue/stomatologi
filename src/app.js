(function(){
'use strict';
const $ = (s, el=document) => el.querySelector(s);
const app = $('#app'), topIn = $('#topIn'), top = $('#top');

/* ---------- storage (best effort) ---------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('s201:'+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('s201:'+k, JSON.stringify(v)); }catch(e){} }
};

/* ---------- index ---------- */
const LEC = {}, SUBJ = {};
SUBJECTS.forEach(s => { SUBJ[s.id] = s; s.lectures.forEach(l => { l.subject = s; LEC[l.id] = l; }); });
const hashId = id => id.replace(/[^a-z0-9-]/gi,'');

/* ---------- icons ---------- */
const I = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></svg>',
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
};

/* ---------- SVG diagrams ---------- */
const SVGS = {
  chromosome: `<svg viewBox="0 0 400 230" width="400" font-family="Inter,sans-serif" font-size="12">
    <g fill="#c9bcf5" stroke="#46309a" stroke-width="2">
      <path d="M128 22 q-16 0 -16 16 v52 q0 14 14 22 q-14 8 -14 22 v62 q0 16 16 16 q16 0 16 -16 v-62 q0 -14 -10 -22 q10 -8 10 -22 v-52 q0 -16 -16 -16z"/>
      <path d="M176 22 q-16 0 -16 16 v52 q0 14 10 22 q-10 8 -10 22 v62 q0 16 16 16 q16 0 16 -16 v-62 q0 -14 -14 -22 q14 -8 14 -22 v-52 q0 -16 -16 -16z"/>
    </g>
    <ellipse cx="152" cy="112" rx="18" ry="8" fill="#e0527a"/>
    <g fill="#ef9a3a"><rect x="112" y="22" width="32" height="8" rx="4"/><rect x="160" y="22" width="32" height="8" rx="4"/><rect x="112" y="204" width="32" height="8" rx="4"/><rect x="160" y="204" width="32" height="8" rx="4"/></g>
    <g stroke="#9aa0ad" stroke-width="1.4"><path d="M198 26 H250"/><path d="M172 112 H250"/><path d="M196 65 H250"/><path d="M196 165 H250"/><path d="M108 140 H60"/></g>
    <g fill="#1d2030"><text x="256" y="30">теломера</text><text x="256" y="69">короткое плечо (p)</text><text x="256" y="116" font-weight="700">центромера</text><text x="256" y="169">длинное плечо (q)</text><text x="8" y="136">хроматида</text><text x="8" y="150" fill="#6a6f82">(одна из двух)</text></g>
  </svg>`,
  dna: `<svg viewBox="0 0 360 200" width="360" font-family="Inter,sans-serif" font-weight="700" font-size="15">
    ${[['А','Т',2],['Г','Ц',3],['Т','А',2],['Ц','Г',3],['А','Т',2]].map((p,i)=>{
      const y=24+i*36, col={'А':'#3f9e5c','Т':'#e0527a','Г':'#ef9a3a','Ц':'#3d7fd9'};
      const lines=Array.from({length:p[2]},(_,k)=>`<line x1="168" x2="192" y1="${y-6+k*(12/(p[2]-1||1))}" y2="${y-6+k*(12/(p[2]-1||1))}" stroke="#9aa0ad" stroke-width="2" stroke-dasharray="3 3"/>`).join('');
      return `<rect x="96" y="${y-14}" width="70" height="28" rx="8" fill="${col[p[0]]}"/><text x="131" y="${y+5}" fill="#fff" text-anchor="middle">${p[0]}</text>${lines}<rect x="194" y="${y-14}" width="70" height="28" rx="8" fill="${col[p[1]]}"/><text x="229" y="${y+5}" fill="#fff" text-anchor="middle">${p[1]}</text>`;
    }).join('')}
    <rect x="78" y="8" width="10" height="182" rx="5" fill="#d9d4ee"/><rect x="272" y="8" width="10" height="182" rx="5" fill="#d9d4ee"/>
    <g font-size="11" fill="#6a6f82" font-weight="600"><text x="20" y="22">5′</text><text x="20" y="190">3′</text><text x="320" y="22">3′</text><text x="320" y="190">5′</text></g>
  </svg>`,
  tooth: `<svg viewBox="0 0 360 300" width="360" font-family="Inter,sans-serif" font-size="12">
    <path d="M70 120 q0-40 30-60 q20-14 40-8 q20 6 40 6 q20 0 40-6 q20-6 40 8 q30 20 30 60 l0 14 l-220 0z" fill="#f4f7ff" stroke="#46309a" stroke-width="2"/>
    <path d="M80 134 l200 0 l-12 60 q-8 70-30 86 q-14 8-20-20 l-10-60 q-4-12-8 0 l-10 60 q-6 28-20 20 q-22-16-30-86z" fill="#fde9c8" stroke="#9b6a2a" stroke-width="2"/>
    <path d="M98 120 q4-40 40-48 q20-4 42 2 q22-6 42-2 q36 8 40 48 l0 18 l-164 0z" fill="#ffe8a8"/>
    <path d="M128 136 q2-34 52-34 q50 0 52 34 l-8 60 q-6 40-14 56 l-8-50 q-6-20-22-20 q-16 0-22 20 l-8 50 q-8-16-14-56z" fill="#f2a1b4" stroke="#c2456a" stroke-width="1.5"/>
    <path d="M40 150 q30-12 60-4 l0 0 q80 10 160 0 q30-8 60 4 l0 20 q-140 10-280 0z" fill="#f59ab0" opacity=".55"/>
    <g stroke="#9aa0ad" stroke-width="1.2"><path d="M110 76 L44 40"/><path d="M220 90 L300 56"/><path d="M180 170 L300 150"/><path d="M262 200 L310 214"/><path d="M60 162 L20 196"/><path d="M196 268 L300 270"/></g>
    <g fill="#1d2030" font-weight="600"><text x="8" y="36">Эмаль</text><text x="302" y="52">Дентин</text><text x="302" y="148">Пульпа</text><text x="292" y="226">Цемент</text><text x="4" y="210">Десна</text><text x="244" y="290">Канал корня</text></g>
  </svg>`,
  punnett: `<svg viewBox="0 0 300 230" width="300" font-family="Inter,sans-serif" font-size="16" font-weight="700" text-anchor="middle">
    <text x="190" y="22" font-size="12" fill="#6a6f82" font-weight="600">гаметы отца</text>
    <text x="22" y="140" font-size="12" fill="#6a6f82" font-weight="600" transform="rotate(-90 22 140)">гаметы матери</text>
    <text x="150" y="50" fill="#46309a">A</text><text x="230" y="50" fill="#46309a">a</text>
    <text x="70" y="108" fill="#46309a">A</text><text x="70" y="188" fill="#46309a">a</text>
    <rect x="110" y="62" width="80" height="76" rx="10" fill="#c9bcf5"/><text x="150" y="98">AA</text><text x="150" y="118" font-size="11" font-weight="500" fill="#46309a">доминант.</text>
    <rect x="194" y="62" width="80" height="76" rx="10" fill="#e3dcfb"/><text x="234" y="98">Aa</text><text x="234" y="118" font-size="11" font-weight="500" fill="#46309a">доминант.</text>
    <rect x="110" y="142" width="80" height="76" rx="10" fill="#e3dcfb"/><text x="150" y="178">Aa</text><text x="150" y="198" font-size="11" font-weight="500" fill="#46309a">доминант.</text>
    <rect x="194" y="142" width="80" height="76" rx="10" fill="#fde6cc"/><text x="234" y="178">aa</text><text x="234" y="198" font-size="11" font-weight="500" fill="#9b4d00">рецессив.</text>
  </svg>`,
};

/* ---------- render helpers ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip = s => String(s).replace(/<[^>]+>/g,'');
function blockHTML(b){
  const [t,a,c] = b;
  switch(t){
    case 'sut': return `<div class="box sut"><span class="tag">Суть</span>${a}</div>`;
    case 'simple': return `<div class="box simple"><span class="tag">Простыми словами</span>${a}</div>`;
    case 'imp': return `<div class="box imp"><span class="tag">Важно</span>${a}</div>`;
    case 'fact': return `<div class="box fact"><span class="tag">Интересно</span>${a}</div>`;
    case 'note': return `<div class="note">ⓘ ${a}</div>`;
    case 'p': return `<p>${a}</p>`;
    case 'h': return `<h3>${a}</h3>`;
    case 'ul': return `<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${a.map(x=>`<li>${x}</li>`).join('')}</ol>`;
    case 'table': return `<div class="tbl"><table><thead><tr>${a.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${c.map(r=>`<tr>${r.map(d=>`<td>${d}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'svg': return `<figure>${SVGS[a]||''}<figcaption>${c||''}</figcaption></figure>`;
  }
  return '';
}
function blockText(b){
  const [t,a,c] = b;
  if (t==='ul'||t==='ol') return a.map(strip).join(' ');
  if (t==='table') return a.join(' ') + ' ' + c.map(r=>r.join(' ')).join(' ');
  if (t==='svg') return c||'';
  return strip(a);
}
function setAccent(s){
  const r = document.documentElement.style;
  r.setProperty('--acc', s ? s.color : '#7b61d6');
  r.setProperty('--acc-soft', s ? s.soft : '#f0ecff');
  r.setProperty('--acc-ink', s ? s.ink : '#46309a');
}
function topBar(title, backHash, extra=''){
  topIn.innerHTML = backHash === null
    ? `<div class="top-title" style="padding-left:4px">📚 Учёба · С-201</div>${extra}`
    : `<button class="back" aria-label="Назад" data-go="${backHash}">${I.back}</button><div class="top-title">${esc(title)}</div>${extra}`;
}
function toast(msg){
  const t = document.createElement('div'); t.className='toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), 2600);
}
function progressOf(l){
  const known = (store.get('known',{})[l.id]||[]).length;
  const best = store.get('best',{})[l.id];
  return { known, total: (l.cards||[]).length, best, qn: (l.quiz||[]).length };
}


/* ---------- быстрый ответ: движок ---------- */
const STOP = new Set('что такое это как какие какой какая каков назовите назови перечислите перечисли расскажите расскажи опишите опиши объясните объясни дайте дай в во и на по для о об из у к с со чем где когда зачем почему ли кто сколько его её их а но или же бы при от до за под над про это этот эта эти то тот та те вопрос ответ определение понятие'.split(' '));
const SYN = { 'прививк':'вакцин', 'привив':'вакцин', 'укол':'вакцин', 'иммунизац':'вакцин', 'деление':'митоз', 'делени':'митоз', 'кариотип':'кариотип', 'ген':'ген', 'наследован':'наследств', 'наследствен':'наследств', 'менделя':'мендел', 'закон':'закон', 'перелом':'перелом', 'кост':'кост', 'позвонк':'позвоночн', 'ребр':'ребр', 'рёбр':'ребр', 'днк':'днк', 'рнк':'рнк', 'белок':'белк', 'белк':'белк', 'синтез':'синтез', 'копирован':'репликац', 'удвоен':'репликац', 'ремонт':'репарац', 'исправлен':'репарац' };
const ENDS = ['иями','ями','ами','ией','ого','его','ому','ему','ыми','ими','ость','ости','ий','ый','ой','ая','яя','ое','ее','ие','ые','ию','ия','ья','ах','ях','ам','ям','ов','ев','ом','ем','ей','ую','юю','ы','и','а','я','о','е','у','ю','ь','й'];
function stem(w){
  w = w.replace(/ё/g,'е');
  if (w.length <= 3) return w;
  for (const e of ENDS){ if (w.length - e.length >= 3 && w.endsWith(e)) { w = w.slice(0, -e.length); break; } }
  return w;
}
function toks(s){
  return String(s).toLowerCase().replace(/<[^>]+>/g,' ').replace(/ё/g,'е').split(/[^a-zа-я0-9ⁿ]+/i).filter(Boolean);
}
function qtoks(s){
  const out = [];
  toks(s).forEach(t => { if (STOP.has(t)) return; let st = stem(t); for (const k in SYN){ if (st.startsWith(k)) { out.push(SYN[k]); break; } } out.push(st); });
  return [...new Set(out)];
}
let QIDX = null;
function buildIndex(){
  const items = [];
  Object.values(LEC).forEach(l => {
    if (l.soon) return;
    (ORAL[l.id]||[]).forEach(([q,a,kw]) => items.push({ l, kind:'oral', q, a, kw: kw||'' , w:1.5 }));
    (l.cards||[]).forEach(([q,a]) => items.push({ l, kind:'card', q, a, kw:'', w:1 }));
    (l.quiz||[]).forEach(z => items.push({ l, kind:'quiz', q: z.q, a: z.o[z.a] + '. ' + z.why, kw:'', w:.8 }));
    (l.sections||[]).forEach((s,si) => {
      const sut = (s.blocks.find(b=>b[0]==='sut')||[])[1] || '';
      const body = s.blocks.filter(b=>['p','ul','ol','table','imp'].includes(b[0])).map(blockText).join(' ');
      items.push({ l, kind:'sec', si, q: s.title, a: sut, more: body, kw:'', w:.9 });
    });
  });
  items.forEach(it => {
    it.qt = toks(it.q + ' ' + it.kw).filter(t=>!STOP.has(t)).map(stem);
    it.at = toks(it.a + ' ' + (it.more||'')).filter(t=>!STOP.has(t)).map(stem);
  });
  const df = {}; items.forEach(it => new Set([...it.qt, ...it.at]).forEach(t => df[t] = (df[t]||0)+1));
  QIDX = { items, df, N: items.length };
}
function tokMatch(qt, list){
  let best = 0;
  for (const d of list){
    if (d === qt) return 1;
    const m = Math.min(qt.length, d.length);
    if (m >= 3 && (d.startsWith(qt) || qt.startsWith(d))) best = Math.max(best, m >= 5 ? .85 : .6);
  }
  return best;
}
function answerSearch(query, subj){
  if (!QIDX) buildIndex();
  const qs = qtoks(query); if (!qs.length) return [];
  const res = [];
  for (const it of QIDX.items){
    if (subj && it.l.subject.id !== subj) continue;
    let sc = 0, hit = 0;
    for (const t of qs){
      const idf = Math.log(1 + QIDX.N / ((QIDX.df[t]||0) + 1));
      const mq = tokMatch(t, it.qt), ma = tokMatch(t, it.at);
      const m = Math.max(mq * 2.2, ma);
      if (m > 0){ hit++; sc += m * idf; }
    }
    if (!hit) continue;
    sc = sc * it.w * (hit / qs.length) * (hit === qs.length ? 1.4 : 1);
    res.push({ it, sc });
  }
  res.sort((x,y) => y.sc - x.sc);
  const seen = new Set(), out = [];
  const topSc = res.length ? res[0].sc : 0;
  for (const r of res){ if (r.sc < topSc * 0.3) break; const k = strip(r.it.a).slice(0,60); if (seen.has(k)) continue; seen.add(k); out.push(r); if (out.length >= 8) break; }
  return out;
}

let quickSubj = '', quickQ = '';
function viewQuick(){
  setAccent(null);
  topBar('⚡ Быстрый ответ', '');
  app.innerHTML = `
    <div class="quick-head"><h1>⚡ Быстрый ответ</h1><p>Вбей вопрос или пару ключевых слов — ответ появится сразу.</p></div>
    <div class="search quick-search">${I.search}<input id="qa" type="search" placeholder="например: состав АКДС" autocomplete="off" enterkeyhint="search"></div>
    <div class="qchips">${[['','Все'],...SUBJECTS.filter(s=>s.lectures.some(l=>!l.soon)).map(s=>[s.id, s.emoji+' '+s.short])].map(([id,n])=>`<button class="qchip ${id===quickSubj?'on':''}" data-qsubj="${id}">${n}</button>`).join('')}</div>
    <div id="qres"></div>`;
  const inp = $('#qa'); inp.value = quickQ;
  let tmr; inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { quickQ = inp.value; renderQuick(); }, 120); });
  renderQuick();
  setTimeout(() => inp.focus(), 50);
}
function renderQuick(){
  const box = $('#qres'); if (!box) return;
  const q = quickQ.trim();
  if (q.length < 2){
    box.innerHTML = `<div class="qtips"><b>Как пользоваться</b><ul>
      <li>Пиши как в вопросе: «виды вакцин», «фазы митоза», «признаки перелома».</li>
      <li>Можно просто слово: «кроссинговер», «АКДС», «кодон».</li>
      <li>На телефоне удобно надиктовать: значок 🎤 на клавиатуре.</li>
      <li>Работает без интернета.</li></ul></div>`;
    return;
  }
  const r = answerSearch(q, quickSubj);
  if (!r.length){ box.innerHTML = `<div class="empty">Не нашёл 🤔<br>Попробуй другое слово или убери лишние</div>`; return; }
  const qs = qtoks(q);
  const hl = s => { let h = s; qs.forEach(t => { if (t.length < 3) return; h = h.replace(new RegExp('(^|[^а-яёa-z])(' + t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '[а-яёa-z]*)', 'gi'), '$1<mark>$2</mark>'); }); return h; };
  const src = it => `${it.l.subject.emoji} ${esc(it.l.subject.short)} · ${esc(it.l.title)}`;
  const go = it => hashId(it.l.id);
  const [top, ...rest] = r;
  const t = top.it;
  box.innerHTML = `
    <div class="qbest" style="--c:${t.l.subject.color}">
      <div class="qsrc">${src(t)}</div>
      <div class="qq">${hl(esc(t.q))}</div>
      <div class="qa">${hl(t.a)}</div>
      ${t.kind==='sec' && t.more ? `<details class="qmore"><summary>Подробнее</summary><div>${hl(esc(t.more))}</div></details>` : ''}
      <button class="qopen" data-go="${go(t)}" ${t.si!=null?`data-sec="${t.si}"`:''}>Открыть в конспекте →</button>
    </div>
    ${rest.length ? `<div class="section-label">Похожие ответы</div>` + rest.map(({it}) => `
      <details class="qalt"><summary><small>${src(it)}</small><b>${hl(esc(it.q))}</b></summary>
        <div class="qa">${hl(it.a)}</div>
        <button class="qopen" data-go="${go(it)}" ${it.si!=null?`data-sec="${it.si}"`:''}>Открыть в конспекте →</button></details>`).join('') : ''}`;
}

/* ---------- views ---------- */
function viewHome(){
  setAccent(null);
  topBar('', null, `<button class="icon-btn" data-act="install">📲 На экран</button>`);
  const last = LEC[store.get('last','')];
  const lecCount = s => s.lectures.filter(l=>!l.soon).length;
  const word = n => n%10===1&&n%100!==11?'лекция':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'лекции':'лекций';
  app.innerHTML = `
    <div class="hero"><small>Группа С-201 · все предметы в одном месте</small>
      <h1>Учёба</h1><p>Конспекты простыми словами, карточки и тесты. Можно скачать и распечатать.</p></div>
    <button class="quick-btn" data-go="otvet"><span class="qi">⚡</span><div><b>Быстрый ответ</b><span>Для устного опроса: вбил вопрос — получил ответ</span></div><span class="chev">${I.chev}</span></button>
    <div class="search">${I.search}<input id="q" type="search" placeholder="Поиск по конспектам: «мейоз», «кодон»…" autocomplete="off"></div>
    <div id="results"></div>
    <div id="homeBody">
      ${last ? `<div class="section-label">Продолжить</div>
        <button class="continue" data-go="${hashId(last.id)}"><div class="em" style="background:${last.subject.soft}">${last.subject.emoji}</div>
        <div><b>${esc(last.title)}</b><span>${esc(last.subject.short)} · лекция ${last.num}</span></div><span class="chev">${I.chev}</span></button>` : ''}
      <div class="section-label">Предметы</div>
      <div class="subjects">${SUBJECTS.map(s=>`
        <button class="subj" data-go="s-${s.id}">
          <div class="em" style="background:${s.soft}">${s.emoji}</div>
          <h3>${esc(s.name)}</h3>
          ${s.teacher ? `<div class="teacher">👤 ${esc(s.teacher)}</div>` : ''}
          <div class="meta"><span>${lecCount(s) ? lecCount(s)+' '+word(lecCount(s)) : 'скоро'}</span><span class="chev">${I.chev}</span></div>
          <div class="bar" style="background:${s.color}"></div>
        </button>`).join('')}</div>
      <button class="install" data-act="install"><span class="em">📲</span><div><b>Поставить на экран телефона</b><span>Будет открываться как приложение — iPhone и Android</span></div></button>
      <div class="foot">Материалы обновляются · одна ссылка для всей группы</div>
    </div>`;
  const q = $('#q');
  q.addEventListener('input', () => doSearch(q.value));
  if (sessionQ) { q.value = sessionQ; doSearch(sessionQ); }
}
let sessionQ = '';

function doSearch(raw){
  sessionQ = raw;
  const q = raw.trim().toLowerCase(), box = $('#results'), body = $('#homeBody');
  if (q.length < 2){ box.innerHTML=''; body.style.display=''; return; }
  body.style.display='none';
  const hits = [];
  Object.values(LEC).forEach(l => {
    if (l.soon) return;
    if (l.title.toLowerCase().includes(q)) hits.push({l, si:-1, title:l.title, text:l.sub, score:3});
    (l.sections||[]).forEach((s,si) => {
      const text = s.blocks.map(blockText).join(' ');
      const inT = s.title.toLowerCase().includes(q), idx = text.toLowerCase().indexOf(q);
      if (inT || idx>=0){
        const from = Math.max(0, idx-50);
        hits.push({l, si, title:s.title, text: idx>=0 ? (from?'…':'')+text.slice(from, idx+q.length+80)+'…' : text.slice(0,120)+'…', score: inT?2:1});
      }
    });
    (l.cards||[]).forEach(c => { const t=(c[0]+' — '+c[1]); if (t.toLowerCase().includes(q)) hits.push({l, si:-2, title:'Карточка: '+c[0], text:c[1], score:1}); });
  });
  hits.sort((a,b)=>b.score-a.score);
  const hl = s => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'), m=>`<mark>${m}</mark>`);
  box.innerHTML = hits.length ? `<div class="section-label">Найдено: ${hits.length}</div>` + hits.slice(0,40).map(h=>`
    <button class="res" data-go="${hashId(h.l.id)}" data-sec="${h.si}">
      <small style="color:${h.l.subject.color}">${h.l.subject.emoji} ${esc(h.l.subject.short)} · ${esc(h.l.title)}</small>
      <b>${hl(h.title)}</b><span>${hl(h.text)}</span></button>`).join('') : `<div class="empty">Ничего не нашлось 🤔<br>Попробуй другое слово</div>`;
}

function viewSubject(s){
  setAccent(s);
  topBar(s.short, '', `<button class="icon-btn" data-go="otvet" aria-label="Быстрый ответ">⚡</button>`);
  app.innerHTML = `
    <div class="subj-head" style="background:linear-gradient(135deg, ${s.color}, ${s.ink})">
      <div class="em">${s.emoji}</div><h1>${esc(s.name)}</h1>
      ${s.teacher ? `<p class="t">👤 Преподаватель: <b>${esc(s.teacher)}</b></p>` : ''}<p>${s.lectures.filter(l=>!l.soon).length || 'пока нет'} ${s.lectures.filter(l=>!l.soon).length?'лекц.':'лекций'}</p></div>
    ${s.lectures.map(l => {
      if (l.soon) return `<div class="lec soon"><div class="n" style="background:${s.soft};color:${s.ink}">${l.num}</div><div><b>${esc(l.title)}</b><span>⏳ ${esc(l.sub)}</span></div></div>`;
      const p = progressOf(l);
      return `<button class="lec" data-go="${hashId(l.id)}">
        <div class="n" style="background:${s.soft};color:${s.ink}">${l.num}</div>
        <div><b>${esc(l.title)}</b><span>${esc(l.sub)}</span>
        <div class="prog" style="color:${s.ink}">${p.known?`<span>🃏 ${p.known}/${p.total}</span>`:''}${p.best!=null?`<span>✅ тест ${p.best}/${p.qn}</span>`:''}</div></div>
        <span class="chev">${I.chev}</span></button>`;
    }).join('')}`;
}

let lecTab = 'notes';
function viewLecture(l, secIdx){
  const s = l.subject; setAccent(s);
  store.set('last', l.id);
  topBar(s.short, 's-'+s.id, `<button class="icon-btn" data-go="otvet" aria-label="Быстрый ответ">⚡</button><button class="icon-btn" data-go="" aria-label="Главная">${I.home}</button>`);
  app.innerHTML = `
    <div class="lec-head"><div class="kicker">${s.emoji} ${esc(s.short)} · лекция ${l.num}${l.date?' · '+l.date:''}</div>
      <h1>${esc(l.title)}</h1><p>${esc(l.sub)}</p>${s.teacher?`<p class="lt">👤 ${esc(s.teacher)}</p>`:''}</div>
    <div class="tabs">
      <button class="tab" data-tab="notes">📖 Конспект</button>
      <button class="tab" data-tab="cards">🃏 Карточки</button>
      <button class="tab" data-tab="quiz">✅ Тест</button>
    </div>
    <div id="pane"></div>`;
  renderTab(l, secIdx);
}
function renderTab(l, secIdx){
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab===lecTab));
  const pane = $('#pane');
  if (lecTab==='notes') renderNotes(l, pane, secIdx);
  else if (lecTab==='cards') renderCards(l, pane);
  else renderQuiz(l, pane);
}

let noteMode = store.get('noteMode','short');
function renderNotes(l, pane, secIdx){
  const F = FULL[l.id];
  const mode = (F && noteMode==='full' && (secIdx==null || secIdx<0)) ? 'full' : 'short';
  const toggle = F ? `<div class="mode"><button class="${mode==='short'?'on':''}" data-mode="short">📄 Кратко</button><button class="${mode==='full'?'on':''}" data-mode="full">🖼 Полная</button></div>` : '';
  if (mode==='full'){ renderFull(l, pane, toggle); return; }
  pane.innerHTML = toggle + `
    <div class="actions">
      <button class="chip" data-act="download" data-id="${l.id}">${I.pdf} Скачать PDF</button>
      <button class="chip" data-act="copy" data-id="${l.id}">${I.copy} Копировать текст</button>
    </div>
    ${l.link ? `<a class="outlink" href="${l.link.url}" target="_blank" rel="noopener"><span style="font-size:26px">🗺️</span><div><b>${esc(l.link.label)}</b><span>Открывается отдельной страницей</span></div><span class="chev">${I.chev}</span></a>` : ''}
    <details class="toc"><summary><span>Содержание · ${l.sections.length} разделов</span><span>▾</span></summary>
      <ol>${l.sections.map((s,i)=>`<li><a href="#" data-sec-jump="${i}">${esc(s.title)}</a></li>`).join('')}<li><a href="#" data-sec-jump="rem">Что запомнить</a></li></ol></details>
    ${l.sections.map((s,i)=>`<section class="sec" id="sec-${i}"><h2><span class="num">${i+1}.</span><span>${esc(s.title)}</span></h2>${s.blocks.map(blockHTML).join('')}</section>`).join('')}
    <section class="remember" id="sec-rem"><h2>📌 Что запомнить</h2><ul>${l.remember.map(r=>`<li>${r}</li>`).join('')}</ul></section>
    ${l.facts && l.facts.length ? `<div class="facts">${l.facts.map(f=>blockHTML(['fact',f])).join('')}</div>` : ''}
    <div style="display:flex;gap:10px;margin-top:16px"><button class="primary" style="flex:1" data-tab="cards">🃏 Учить карточки</button><button class="secondary" style="flex:1" data-tab="quiz">✅ Пройти тест</button></div>`;
  if (secIdx!=null && secIdx>=0){ const el = $('#sec-'+secIdx); if (el) requestAnimationFrame(()=>el.scrollIntoView({block:'start'})); }
  else window.scrollTo(0,0);
}

function pagesHTML(dir, n, sizes, alt){
  let h = '';
  for (let i=1;i<=n;i++){ const p = String(i).padStart(2,'0'); const s = sizes && sizes[i-1] || [1100,1556];
    h += `<a class="pg" href="${dir}/${p}.webp" data-vdir="${dir}" data-vn="${n}" data-vi="${i}" data-vt="${esc(alt)}"><img src="${dir}/${p}.webp" loading="${i<=2?'eager':'lazy'}" width="${s[0]}" height="${s[1]}" alt="${esc(alt)} — страница ${i}"></a>`; }
  return h;
}
function renderFull(l, pane, toggle){
  const F = FULL[l.id];
  let body = '';
  if (F.html){
    body = `<a class="fullcard" href="${F.html}"><span class="big">🗺️</span><div><b>Открыть полный атлас</b><span>${esc(F.note||'')}</span></div><span class="chev">${I.chev}</span></a>`;
  } else {
    body = `${F.note?`<div class="note">${esc(F.note)}</div>`:''}<div class="pages">${pagesHTML(F.dir, F.pages, F.sizes, l.title)}</div>`;
    if (F.extra) body += `<div class="section-label">${esc(F.extra.title)}</div>
      <div class="actions"><button class="chip" data-act="dl-extra" data-id="${l.id}">${I.pdf} Скачать PDF</button></div>
      <div class="pages">${pagesHTML(F.extra.dir, F.extra.pages, F.extra.sizes, F.extra.title)}</div>`;
  }
  pane.innerHTML = toggle + `
    <div class="actions"><button class="chip" data-act="dl-full" data-id="${l.id}">${I.pdf} Скачать полный PDF</button>
    ${F.pages?`<span class="pcount">${F.pages} стр. · нажми на страницу, чтобы увеличить</span>`:''}</div>
    ${body}
    <div style="display:flex;gap:10px;margin-top:16px"><button class="primary" style="flex:1" data-tab="cards">🃏 Учить карточки</button><button class="secondary" style="flex:1" data-tab="quiz">✅ Пройти тест</button></div>
    <div class="navrow">
      <button data-act="totop">↑ Наверх</button>
      <button data-mode="short">📄 Кратко</button>
      <button data-go="s-${l.subject.id}">📚 Все лекции</button>
      <button data-go="">${I.home} Главная</button>
    </div>`;
  window.scrollTo(0,0);
}

/* просмотр страниц полной версии: внутри приложения, с кнопками назад / главная / листание */
let VW = null;
function openViewer(dir, n, i, title){
  if (VW) return;
  const el = document.createElement('div');
  el.className = 'viewer'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
  el.innerHTML = `
    <div class="vw-top">
      <button class="vw-btn" data-vw="close" aria-label="Назад">${I.back}<span>Назад</span></button>
      <div class="vw-title">${esc(title)}</div>
      <button class="vw-btn" data-vw="zoom" aria-label="Увеличить">🔍</button>
      <button class="vw-btn" data-vw="home" aria-label="Главная">${I.home}</button>
    </div>
    <div class="vw-stage"><img alt=""></div>
    <div class="vw-bot">
      <button class="vw-btn" data-vw="prev" aria-label="Предыдущая страница">‹ Пред.</button>
      <span class="vw-count"></span>
      <button class="vw-btn" data-vw="next" aria-label="Следующая страница">След. ›</button>
    </div>`;
  document.body.appendChild(el);
  document.documentElement.classList.add('vw-open');
  VW = { el, dir, n:+n, i:+i, zoom:false, after:null };
  history.pushState({vw:1}, '');
  const stage = el.querySelector('.vw-stage');
  let sx=0, sy=0, multi=false, lastTap=0;
  stage.addEventListener('touchstart', e => { multi = e.touches.length>1; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
  stage.addEventListener('touchend', e => {
    if (multi || !VW || VW.zoom) return;
    const t = e.changedTouches[0], dx = t.clientX-sx, dy = t.clientY-sy;
    if (Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) vwStep(dx<0?1:-1);
    else if (Math.abs(dx)<10 && Math.abs(dy)<10){ const now = Date.now(); if (now-lastTap<300) vwZoom(); lastTap = now; }
  }, {passive:true});
  stage.addEventListener('dblclick', vwZoom);
  vwDraw();
}
function vwDraw(){
  const {el, dir, n, i} = VW, p = String(i).padStart(2,'0');
  const img = el.querySelector('.vw-stage img');
  img.src = `${dir}/${p}.webp`; img.alt = `Страница ${i}`;
  el.querySelector('.vw-count').textContent = `${i} / ${n}`;
  el.querySelector('[data-vw="prev"]').disabled = i<=1;
  el.querySelector('[data-vw="next"]').disabled = i>=n;
  el.querySelector('.vw-stage').scrollTo(0,0);
  if (i<n){ const pre = new Image(); pre.src = `${dir}/${String(i+1).padStart(2,'0')}.webp`; }
}
function vwStep(d){ if (!VW) return; const j = VW.i+d; if (j<1 || j>VW.n) return; VW.i = j; vwDraw(); }
function vwZoom(){ if (!VW) return; VW.zoom = !VW.zoom; VW.el.classList.toggle('zoomed', VW.zoom); }
function vwRemove(){
  if (!VW) return;
  const {el, dir, i, after} = VW; VW = null;
  el.remove(); document.documentElement.classList.remove('vw-open');
  if (after!=null) go(after);
  else { const pg = document.querySelector(`.pg[data-vdir="${dir}"][data-vi="${i}"]`); if (pg) pg.scrollIntoView({block:'center'}); }
}
function closeViewer(after){
  if (!VW) return;
  if (after!=null) VW.after = after;
  if (history.state && history.state.vw) history.back(); else vwRemove();
}
window.addEventListener('popstate', () => { if (VW) vwRemove(); });
document.addEventListener('keydown', e => {
  if (!VW) return;
  if (e.key==='Escape') closeViewer();
  else if (e.key==='ArrowRight') vwStep(1);
  else if (e.key==='ArrowLeft') vwStep(-1);
});
function openFile(url, name){
  const a = document.createElement('a'); a.href = url; a.download = name; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove(); toast('Открываю PDF…');
}

/* flashcards */
function renderCards(l, pane, mode){
  const allKnown = store.get('known',{});
  const known = new Set(allKnown[l.id]||[]);
  let order = l.cards.map((_,i)=>i);
  if (mode==='unknown') order = order.filter(i=>!known.has(i));
  if (!order.length) order = l.cards.map((_,i)=>i);
  for (let i=order.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
  let pos = 0, right = 0;
  const save = () => { const a = store.get('known',{}); a[l.id] = [...known]; store.set('known', a); };
  const draw = () => {
    if (pos >= order.length){
      pane.innerHTML = `<div class="done"><div class="big">${right===order.length?'🏆':'💪'}</div><h3>Круг пройден!</h3>
        <p>Знаешь ${known.size} из ${l.cards.length} карточек</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${known.size<l.cards.length?`<button class="primary" data-act="cards-unknown">Повторить невыученные</button>`:''}
        <button class="secondary" data-act="cards-all">Все заново</button></div></div>`;
      return;
    }
    const i = order[pos], c = l.cards[i];
    pane.innerHTML = `
      <div class="fc-top"><span>Карточка ${pos+1} из ${order.length}</span><span>✅ знаю: ${known.size}/${l.cards.length}</span></div>
      <div class="pbar"><i style="width:${pos/order.length*100}%"></i></div>
      <div class="fc-wrap"><div class="fc" id="fc">
        <div class="face ffront"><span class="lbl">Вопрос</span><div class="txt">${c[0]}</div><span class="hint">нажми, чтобы перевернуть</span></div>
        <div class="face fback"><span class="lbl">Ответ</span><div class="txt">${c[1]}</div></div>
      </div></div>
      <div class="fc-ctrl"><button class="btn-no" id="no">🔁 Ещё учить</button><button class="btn-yes" id="yes">✅ Знаю</button></div>
      <div style="text-align:center;margin-top:8px"><button class="link-btn" data-act="cards-reset">Сбросить прогресс</button></div>`;
    $('#fc').onclick = () => $('#fc').classList.toggle('flip');
    $('#yes').onclick = () => { known.add(i); right++; save(); pos++; draw(); };
    $('#no').onclick = () => { known.delete(i); save(); pos++; draw(); };
  };
  pane._redraw = (m) => renderCards(l, pane, m);
  draw();
}

/* quiz */
function renderQuiz(l, pane){
  const qs = l.quiz; let pos = 0, score = 0;
  const draw = () => {
    if (pos >= qs.length){
      const best = store.get('best',{}); if (best[l.id]==null || score>best[l.id]){ best[l.id]=score; store.set('best',best); }
      const pct = score/qs.length;
      pane.innerHTML = `<div class="done"><div class="big">${pct===1?'🏆':pct>=.6?'👍':'📚'}</div><h3>${score} из ${qs.length}</h3>
        <p>${pct===1?'Идеально! Ты готов.':pct>=.6?'Хорошо! Пару тем стоит повторить.':'Повтори конспект и попробуй ещё раз.'}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="primary" data-act="quiz-again">Пройти ещё раз</button><button class="secondary" data-tab="notes">К конспекту</button></div></div>`;
      return;
    }
    const q = qs[pos];
    pane.innerHTML = `
      <div class="fc-top"><span>Вопрос ${pos+1} из ${qs.length}</span><span>правильно: ${score}</span></div>
      <div class="pbar"><i style="width:${pos/qs.length*100}%"></i></div>
      <div class="q-card"><h3>${q.q}</h3>${q.o.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}<div id="why"></div></div>`;
    pane.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i===q.a; if (ok) score++;
      pane.querySelectorAll('.opt').forEach(x => { x.disabled = true; const xi=+x.dataset.i; if (xi===q.a) x.classList.add('right'); else if (xi===i) x.classList.add('wrong'); });
      $('#why').innerHTML = `<div class="why ${ok?'ok':'bad'}"><b>${ok?'Верно!':'Не совсем.'}</b> ${q.why}</div>
        <button class="primary" style="width:100%;margin-top:12px" id="next">${pos+1<qs.length?'Дальше →':'Результат'}</button>`;
      $('#next').onclick = () => { pos++; draw(); window.scrollTo({top:0}); };
    });
  };
  draw();
}

/* ---------- printable export ---------- */
function printableHTML(l){
  const s = l.subject;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(s.short)} — ${esc(l.title)}</title>
<style>
@page{size:A4;margin:16mm 15mm}
body{font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2030;line-height:1.5;font-size:11.5pt;max-width:780px;margin:0 auto;padding:20px}
h1{font-size:22pt;margin:0 0 4px;line-height:1.2} .kick{color:${s.color};font-weight:700;font-size:10pt}
.sub{color:#6a6f82;margin:0 0 18px}
h2{font-size:15pt;margin:22px 0 8px;color:${s.ink};break-after:avoid}
.box{border-radius:8px;padding:8px 12px;margin:8px 0;border-left:4px solid;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.box .tag{display:block;font-size:8.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.sut{background:#fdecef;border-color:#e0527a}.simple{background:#e7f6ea;border-color:#3f9e5c}.imp{background:#fff4d9;border-color:#e0a000}.fact{background:#eef3ff;border-color:#5b7fd6}
.note{font-size:9.5pt;color:#6a6f82}
table{border-collapse:collapse;width:100%;font-size:10pt;margin:8px 0;break-inside:avoid}
th{background:${s.soft};color:${s.ink};text-align:left;padding:6px 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
td{padding:6px 8px;border-bottom:1px solid #e6e4ef;vertical-align:top}
figure{text-align:center;margin:10px 0;break-inside:avoid} figcaption{font-size:9pt;color:#6a6f82}
.rem{background:#fff7d6;border-radius:10px;padding:10px 16px;margin-top:18px;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cards{columns:2;column-gap:20px;font-size:10pt} .cards div{break-inside:avoid;margin:0 0 8px;padding:6px 8px;border:1px solid #e6e4ef;border-radius:6px}
.bar{position:sticky;top:0;background:#fff;padding:10px 0 14px;display:flex;gap:10px;align-items:center}
.bar button{font:inherit;font-weight:700;padding:10px 18px;border-radius:10px;border:0;background:${s.color};color:#fff;cursor:pointer}
.bar span{color:#6a6f82;font-size:10pt}
@media print{.bar{display:none}body{padding:0}}
</style></head><body>
<div class="bar"><button onclick="window.print()">🖨 Распечатать / сохранить PDF</button><span>или Ctrl+P · на телефоне: «Поделиться» → «Печать»</span></div>
<div class="kick">${esc(s.name)} · лекция ${l.num}${l.date?' · '+l.date:''}</div>
<h1>${esc(l.title)}</h1><p class="sub">${esc(l.sub)}</p>
${l.sections.map((sec,i)=>`<h2>${i+1}. ${esc(sec.title)}</h2>${sec.blocks.map(b=>blockHTML(b).replace('class="tbl"','')).join('')}`).join('')}
<div class="rem"><h2 style="margin-top:6px">📌 Что запомнить</h2><ul>${l.remember.map(r=>`<li>${r}</li>`).join('')}</ul></div>
${(l.facts||[]).map(f=>blockHTML(['fact',f])).join('')}
<h2>🃏 Вопросы для самопроверки</h2><div class="cards">${l.cards.map(c=>`<div><b>${c[0]}</b><br>${c[1]}</div>`).join('')}</div>
</body></html>`;
}
function plainText(l){
  let t = `${l.subject.name} · лекция ${l.num}\n${l.title}\n\n`;
  l.sections.forEach((s,i)=>{ t += `${i+1}. ${s.title}\n`; s.blocks.forEach(b=>{
    const pre = {sut:'Суть: ',simple:'Простыми словами: ',imp:'Важно: ',note:'',fact:'Интересно: '}[b[0]] ?? '';
    if (b[0]==='ul'||b[0]==='ol') b[1].forEach((x,k)=>t+=`${b[0]==='ol'?(k+1)+'.':'•'} ${strip(x)}\n`);
    else if (b[0]==='table') { t += b[1].join(' | ')+'\n'; b[2].forEach(r=>t+=r.join(' | ')+'\n'); }
    else if (b[0]!=='svg') t += pre + strip(b[1]) + '\n';
  }); t += '\n'; });
  t += 'Что запомнить:\n' + l.remember.map(r=>'• '+strip(r)).join('\n');
  return t;
}
let downloadsNS = null;
try { if (window.claude && window.claude.use) window.claude.use('downloads').then(d => { downloadsNS = d; }).catch(()=>{}); } catch(e){}
async function getDownloads(){
  if (downloadsNS || !window.claude) return downloadsNS;
  try{ if (window.claude && window.claude.use){ downloadsNS = await Promise.race([window.claude.use('downloads'), new Promise(r=>setTimeout(()=>r(null),4000))]); } }catch(e){}
  return downloadsNS;
}
async function doDownload(l){
  await getDownloads();
  const base = `${l.subject.short} — ${l.num}. ${l.title}`;
  const pdfUrl = 'pdf/' + l.id + '.pdf';
  if (downloadsNS){
    let data = null, name = base + '.pdf';
    try { const r = await fetch(pdfUrl); if (r.ok) data = await r.blob(); } catch(e){}
    if (!data){ data = printableHTML(l); name = base + '.html'; }
    try { await downloadsNS.save({ filename: name, data }); toast(name.endsWith('.pdf') ? 'PDF сохранён — можно печатать 🖨' : 'Файл сохранён. Открой его и нажми «Распечатать»'); return; }
    catch(e){ if (e && (e.code==='declined' || e.code==='rate_limited')) return; }
  }
  if (!window.claude){ // обычный сайт
    const a = document.createElement('a'); a.href = pdfUrl; a.download = base + '.pdf'; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); toast('Открываю PDF…'); return;
  }
  showPrintFallback(l);
}
function showPrintFallback(l){
  openSheet(`<h3>Версия для печати</h3><p style="color:var(--muted);margin:0 0 10px">Скачивание здесь недоступно. Скопируй текст или открой приложение на компьютере и нажми Ctrl+P.</p>
    <button class="primary" style="width:100%" data-act="copy" data-id="${l.id}">${'Копировать текст конспекта'}</button>`);
}
async function doCopy(l){
  const t = plainText(l);
  try { await navigator.clipboard.writeText(t); toast('Текст скопирован 👍'); }
  catch(e){
    openSheet(`<h3>Текст конспекта</h3><p style="color:var(--muted);margin:0 0 8px">Выдели и скопируй вручную:</p><textarea style="width:100%;height:50vh;font:inherit;font-size:14px;border-radius:12px;border:1px solid var(--line);padding:10px">${esc(t)}</textarea>`);
  }
}

/* ---------- sheet ---------- */
function openSheet(html){
  closeSheet();
  const sc = document.createElement('div'); sc.className='scrim'; sc.id='scrim';
  sc.innerHTML = `<div class="sheet"><div class="grab"></div>${html}<button class="secondary" style="width:100%;margin-top:14px" data-act="close">Закрыть</button></div>`;
  sc.addEventListener('click', e => { if (e.target===sc) closeSheet(); });
  document.body.appendChild(sc);
}
function closeSheet(){ const s=$('#scrim'); if (s) s.remove(); }
function installSheet(){
  openSheet(`<h3>📲 Поставить на экран телефона</h3>
    <p style="color:var(--muted);margin:0">Иконка появится рядом с другими приложениями.</p>
    <div class="os"><b>iPhone (Safari)</b><ol><li>Открой эту страницу в <b>Safari</b>.</li><li>Нажми кнопку «Поделиться» <b>⬆︎</b> внизу экрана.</li><li>Выбери «<b>На экран „Домой“</b>» → «Добавить».</li></ol></div>
    <div class="os"><b>Android (Chrome)</b><ol><li>Открой страницу в <b>Chrome</b>.</li><li>Нажми меню <b>⋮</b> справа вверху.</li><li>Выбери «<b>Добавить на главный экран</b>» или «Установить приложение».</li></ol></div>
    <div class="os"><b>Компьютер</b><ol><li>Просто сохрани страницу в закладки.</li></ol></div>`);
}

/* ---------- routing ---------- */
function route(){
  closeSheet();
  const h = (location.hash||'').slice(1);
  let secIdx = null;
  if (pendingSec!=null){ secIdx = pendingSec; pendingSec = null; }
  if (h === 'otvet') viewQuick();
  else if (h.startsWith('s-') && SUBJ[h.slice(2)]) viewSubject(SUBJ[h.slice(2)]);
  else if (LEC[h] && !LEC[h].soon) viewLecture(LEC[h], secIdx);
  else viewHome();
  if (secIdx==null || secIdx<0) window.scrollTo(0,0);
}
let pendingSec = null;
function go(h){
  if (('#'+h)===location.hash || (!h && !location.hash)) route();
  else location.hash = h;
}
window.addEventListener('hashchange', route);
const fabTop = document.createElement('button');
fabTop.className = 'fab-top'; fabTop.dataset.act = 'totop'; fabTop.setAttribute('aria-label','Наверх'); fabTop.textContent = '↑';
document.body.appendChild(fabTop);
window.addEventListener('scroll', () => {
  top.classList.toggle('scrolled', window.scrollY>4);
  fabTop.classList.toggle('show', window.scrollY>900);
}, {passive:true});

document.addEventListener('click', e => {
  const vb = e.target.closest('[data-vw]');
  if (vb){ const a = vb.dataset.vw;
    if (a==='close') closeViewer(); else if (a==='home') closeViewer(''); else if (a==='zoom') vwZoom();
    else if (a==='prev') vwStep(-1); else if (a==='next') vwStep(1);
    return; }
  const pg = e.target.closest('a.pg[data-vdir]');
  if (pg){ e.preventDefault(); openViewer(pg.dataset.vdir, pg.dataset.vn, pg.dataset.vi, pg.dataset.vt); return; }
  if (e.target.closest('[data-act="totop"]')){ window.scrollTo({top:0, behavior:'smooth'}); return; }
  const md = e.target.closest('[data-mode]');
  if (md){ noteMode = md.dataset.mode; store.set('noteMode', noteMode); const l = LEC[(location.hash||'').slice(1)]; if (l) renderNotes(l, $('#pane')); return; }
  const qc = e.target.closest('[data-qsubj]');
  if (qc){ quickSubj = qc.dataset.qsubj; document.querySelectorAll('.qchip').forEach(c=>c.classList.toggle('on', c===qc)); renderQuick(); return; }
  const t = e.target.closest('[data-go],[data-tab],[data-act],[data-sec-jump]');
  if (!t) return;
  if (t.dataset.secJump!=null){
    e.preventDefault(); const el = $('#sec-'+t.dataset.secJump); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); return;
  }
  if (t.dataset.go!=null){
    const sec = t.dataset.sec;
    if (sec!=null){ const n=+sec; lecTab = n===-2 ? 'cards' : 'notes'; pendingSec = n>=0?n:null; }
    else if (LEC[t.dataset.go]) lecTab = 'notes';
    go(t.dataset.go); return;
  }
  if (t.dataset.tab){
    const l = LEC[(location.hash||'').slice(1)]; if (!l) return;
    lecTab = t.dataset.tab; renderTab(l); window.scrollTo({top:0}); return;
  }
  const act = t.dataset.act, l = LEC[t.dataset.id] || LEC[(location.hash||'').slice(1)];
  if (act==='install') installSheet();
  else if (act==='close') closeSheet();
  else if (act==='download' && l) doDownload(l);
  else if (act==='copy' && l) doCopy(l);
  else if (act==='cards-unknown') $('#pane')._redraw('unknown');
  else if (act==='cards-all') $('#pane')._redraw();
  else if (act==='cards-reset'){ const a=store.get('known',{}); delete a[l.id]; store.set('known',a); $('#pane')._redraw(); toast('Прогресс сброшен'); }
  else if (act==='quiz-again') renderQuiz(l, $('#pane'));
  else if (act==='dl-full' && l) openFile(FULL[l.id].pdf, `${l.subject.short} — ${l.num}. ${l.title} (полная версия).pdf`);
  else if (act==='dl-extra' && l) openFile(FULL[l.id].extra.pdf, FULL[l.id].extra.title + '.pdf');
});

window.__printable = id => printableHTML(LEC[id]);
window.__ask = (q,s) => answerSearch(q,s||'').map(r=>[r.sc.toFixed(2), r.it.l.id, r.it.kind, r.it.q]);
if (!window.claude && 'serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
route();
})();
