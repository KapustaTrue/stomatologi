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

if (typeof SVG_EXTRA !== 'undefined') Object.assign(SVGS, SVG_EXTRA);

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
    case 'img': return `<figure class="pic"><img src="${a}" loading="lazy" alt="${esc(c||'')}"><figcaption>${c||''}</figcaption></figure>`;
  }
  return '';
}
function blockText(b){
  const [t,a,c] = b;
  if (t==='ul'||t==='ol') return a.map(strip).join(' ');
  if (t==='table') return a.join(' ') + ' ' + c.map(r=>r.join(' ')).join(' ');
  if (t==='svg' || t==='img') return c||'';
  return strip(a);
}
function setAccent(s){
  const r = document.documentElement.style;
  r.setProperty('--acc', s ? s.color : '#7b61d6');
  r.setProperty('--acc-soft', s ? s.soft : '#f0ecff');
  r.setProperty('--acc-ink', s ? s.ink : '#46309a');
}

/* ===== расписание ===== */
const DAY_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб'], DAY_FULL = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const MON_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function schedSubj(name){
  const n = name.toLowerCase();
  if (n.includes('микробиол') || n.includes('иммунол')) return SUBJ.immunology;
  if (n.includes('генетик')) return SUBJ.genetics;
  if (n.includes('анатом')) return SUBJ.anatomy;
  if (n.includes('информатик')) return SUBJ.informatics;
  if (n.includes('сестрин') && SUBJ.nursing) return SUBJ.nursing;
  return null;
}
const schedStyle = name => { const s = schedSubj(name); return s ? { c:s.color, ci:s.ink, cs:s.soft, em:s.emoji, id:s.id } : name.toLowerCase().includes('истори') ? { c:'#c2891c', ci:'#7a5208', cs:'#fff4dc', em:'📜' } : { c:'#7a7f99', ci:'#3d4160', cs:'#eef0f6', em:'📘' }; };
const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
function schedDate(i){ const d = new Date(SCHEDULE.monday+'T00:00:00'); d.setDate(d.getDate()+i); return d; }
function schedWeekLabel(){ const a = schedDate(0), b = schedDate(5); return a.getMonth()===b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MON_GEN[b.getMonth()]}` : `${a.getDate()} ${MON_GEN[a.getMonth()]} – ${b.getDate()} ${MON_GEN[b.getMonth()]}`; }
function schedToday(){ // индекс дня недели расписания для сегодняшней даты, или -1
  const now = new Date(); const d0 = schedDate(0); const diff = Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate()) - d0) / 864e5);
  return diff >= 0 && diff <= 5 ? diff : diff === 6 ? -2 /* воскресенье после недели */ : diff > 6 ? -3 /* неделя прошла */ : -4 /* ещё не началась */;
}
function schedNow(){ // что сейчас: {state, pair, day}
  if (typeof SCHEDULE === 'undefined') return null;
  const di = schedToday(), now = new Date(), m = now.getHours()*60 + now.getMinutes();
  if (di < 0) return { state: di === -3 ? 'old' : 'weekend', day: di };
  const pairs = SCHEDULE.days[di] || [];
  for (const p of pairs){ const [a,b] = SCHEDULE.times[p.n]; if (m >= toMin(a) && m < toMin(b)) return { state:'now', pair:p, day:di, left: toMin(b)-m }; }
  const next = pairs.find(p => toMin(SCHEDULE.times[p.n][0]) > m);
  if (next) return { state: m < toMin(SCHEDULE.times[pairs[0].n][0]) ? 'first' : 'next', pair:next, day:di, inMin: toMin(SCHEDULE.times[next.n][0]) - m };
  // сегодня всё — ищем следующий учебный день недели
  for (let j = di+1; j < 6; j++) if ((SCHEDULE.days[j]||[]).length) return { state:'done', day:di, nextDay:j, pair: SCHEDULE.days[j][0] };
  return { state:'done', day:di };
}
const shortName = n => n.replace('Медицинская генетика','Медгенетика');
function schedBtnText(){
  const s = schedNow(); if (!s) return 'Пары на неделю';
  const T = p => SCHEDULE.times[p.n];
  if (s.state==='now') return `<b class="live">● Сейчас</b> ${esc(shortName(s.pair.subj))} · ауд. ${esc(s.pair.room)} · до ${T(s.pair)[1]}`;
  if (s.state==='next') return `Дальше: ${esc(shortName(s.pair.subj))} в ${T(s.pair)[0]} · ауд. ${esc(s.pair.room)}`;
  if (s.state==='first') return `Сегодня с ${T(s.pair)[0]}: ${esc(shortName(s.pair.subj))} · ауд. ${esc(s.pair.room)}`;
  if (s.state==='done') return s.nextDay!=null ? `На сегодня всё 🎉 ${DAY_FULL[s.nextDay]} — с ${T(s.pair)[0]}` : 'На этой неделе пары закончились 🎉';
  if (s.state==='old') return 'Ждём расписание на новую неделю';
  return `Неделя ${schedWeekLabel()}`;
}

/* ===== домашка из Telegram (homework.json, обновляет бот) ===== */
const HW_URL = 'https://raw.githubusercontent.com/KapustaTrue/stomatologi/main/homework.json';
let HW = store.get('hw', []);
const isoD = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const subjKey = name => { const s = schedSubj(name); return s ? s.id : name.toLowerCase().slice(0,5); };
function hwTarget(it){
  if (it.date) return { date: it.date, pair: it.pair };
  if (typeof SCHEDULE === 'undefined' || !it.created) return null;
  // без даты: первая пара по предмету после того, как задали (как в боте)
  const cr = new Date(it.created), crD = isoD(cr), m = cr.getHours()*60 + cr.getMinutes(), key = subjKey(it.subj);
  const ps = []; SCHEDULE.days.forEach((day, i) => day.forEach(p => { if (subjKey(p.subj) === key) ps.push({ date: isoD(schedDate(i)), n: p.n }); }));
  const started = ps.some(p => p.date === crD && toMin(SCHEDULE.times[p.n][0]) <= m);
  for (const p of ps){
    if (p.date < crD) continue;
    if (p.date === crD && (started || toMin(SCHEDULE.times[p.n][0]) <= m)) continue;
    return { date: p.date, pair: Math.min(...ps.filter(q => q.date === p.date).map(q => q.n)) };
  }
  return null;
}
const hwFor = (date, n) => HW.filter(it => { const t = hwTarget(it); return t && t.date === date && t.pair === n; });
function hwActive(){ const today = isoD(new Date()); return HW.map(it => ({ it, t: hwTarget(it) })).filter(x => !x.t || x.t.date >= today)
  .sort((a, b) => (a.t ? a.t.date + String(a.t.pair).padStart(2,'0') : '9') < (b.t ? b.t.date + String(b.t.pair).padStart(2,'0') : '9') ? -1 : 1); }
let hwLoading = false;
function loadHW(){
  if (hwLoading) return; hwLoading = true;
  fetch(HW_URL + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject()).catch(() => fetch('homework.json?t=' + Date.now()).then(r => r.ok ? r.json() : null))
    .then(d => { if (!d || !Array.isArray(d.items)) return;
      const changed = JSON.stringify(d.items) !== JSON.stringify(HW); HW = d.items; store.set('hw', HW);
      if (!changed) return;
      const h = (location.hash || '').slice(1);
      if (h === 'raspisanie') viewSchedule(true); else if (!h) { const b = document.querySelector('.sched-btn .sb-hw-slot'); if (b) b.outerHTML = hwBadge(); } })
    .catch(() => {}).finally(() => { hwLoading = false; });
}
function hwBadge(){ const n = hwActive().length; return `<span class="sb-hw-slot">${n ? `<span class="sb-hw">📝 ${n}</span>` : ''}</span>`; }

let schedDay = null;
function viewSchedule(keep){
  setAccent(null);
  topBar('📅 Расписание', '');
  if (!keep) loadHW();
  const sy = window.scrollY;
  const today = schedToday(), st = schedNow();
  if (schedDay == null) schedDay = today >= 0 ? today : 0;
  const drawDay = () => {
    const pairs = SCHEDULE.days[schedDay] || [], d = schedDate(schedDay), isToday = schedDay === today;
    const m = new Date().getHours()*60 + new Date().getMinutes();
    let html = `<div class="sch-dayhead"><h2>${DAY_FULL[schedDay]}</h2><span>${d.getDate()} ${MON_GEN[d.getMonth()]}${isToday ? ' · сегодня' : ''}</span></div>`;
    if ((SCHEDULE.dayNotes||{})[schedDay]) html += `<div class="sch-joke">${esc(SCHEDULE.dayNotes[schedDay])}</div>`;
    if (!pairs.length) html += `<div class="sch-free"><div class="big">🎉</div><b>Пар нет</b><p>Можно выспаться. Или повторить конспект — решать тебе.</p></div>`;
    pairs.forEach((p, k) => {
      const [a, b] = SCHEDULE.times[p.n] || ['', ''], c = schedStyle(p.subj);
      if (k && p.n - pairs[k-1].n > 1) html += `<div class="sch-gap">☕ Окно — ${p.n - pairs[k-1].n - 1 === 1 ? 'одна пара' : (p.n - pairs[k-1].n - 1) + ' пары'}</div>`;
      const live = isToday && m >= toMin(a) && m < toMin(b), past = isToday && m >= toMin(b);
      const prog = live ? Math.round((m - toMin(a)) / (toMin(b) - toMin(a)) * 100) : 0;
      html += `<${c.id ? `button data-go="s-${c.id}"` : 'div'} class="sch-pair${live ? ' live' : ''}${past ? ' past' : ''}" style="--c:${c.c};--ci:${c.ci};--cs:${c.cs}">
        <div class="sch-time"><b>${a}</b><span>${b}</span><i>${p.n} пара</i></div>
        <div class="sch-body"><div class="sch-name"><span class="sch-em">${c.em}</span>${esc(p.subj)}${p.chg ? '<span class="sch-chg-tag">замена</span>' : ''}</div>
          <div class="sch-meta"><span class="sch-room">ауд. ${esc(p.room)}</span><span>👤 ${esc(p.teacher)}</span></div>
          ${hwFor(isoD(d), p.n).map(h => `<div class="sch-hw"><span class="sch-hw-ic">📝</span><div><b>ДЗ:</b> ${esc(h.text)}${h.author ? `<small> — ${esc(h.author)}</small>` : ''}</div></div>`).join('')}
          ${live ? `<div class="sch-live"><span>● Идёт сейчас · осталось ${toMin(b) - m} мин</span><div class="sch-prog"><i style="width:${prog}%"></i></div></div>` : ''}
        </div></${c.id ? 'button' : 'div'}>`;
    });
    $('#schday').innerHTML = html;
    document.querySelectorAll('.sch-tab').forEach(b => b.classList.toggle('on', +b.dataset.sday === schedDay));
  };
  const old = st && st.state === 'old';
  app.innerHTML = `
    <div class="sch-head"><h1>📅 Расписание</h1><p>С-201 · неделя ${schedWeekLabel()}</p></div>
    ${old ? `<div class="sch-warn">⏳ Это расписание прошлой недели — новое ещё не добавили.</div>` : ''}
    ${!old && (SCHEDULE.changes||[]).length ? `<div class="sch-chg"><b>⚠️ Изменения в расписании</b><ul>${SCHEDULE.changes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    <div class="sch-tabs">${DAY_SHORT.map((n, i) => { const d = schedDate(i); const cnt = (SCHEDULE.days[i]||[]).length;
      return `<button class="sch-tab${i === today ? ' today' : ''}" data-sday="${i}"><b>${n}</b><span>${d.getDate()}</span><i>${cnt ? '•'.repeat(Math.min(cnt, 5)) : '—'}</i>${HW.some(it => { const t = hwTarget(it); return t && t.date === isoD(d); }) ? '<em class="sch-tab-hw">📝</em>' : ''}</button>`; }).join('')}</div>
    <div id="schday"></div>
    ${(() => { const act = hwActive(); return `<div class="sch-hwlist"><h3>📝 Домашка${act.length ? ` · ${act.length}` : ''}</h3>
      ${act.length ? act.map(({it, t}) => { const di = t ? SCHEDULE.days.findIndex((_, i) => isoD(schedDate(i)) === t.date) : -1, c = schedStyle(it.subj);
        return `<button class="sch-hwitem" ${di >= 0 ? `data-sday="${di}"` : ''} style="--c:${c.c};--cs:${c.cs};--ci:${c.ci}"><span class="when">${t ? `${DAY_SHORT[di] || ''} ${+t.date.slice(8)} · ${t.pair} пара` : 'ближайшая пара'}</span><b>${c.em} ${esc(it.subj)}</b><span class="txt">${esc(it.text)}</span></button>`; }).join('')
        : '<p class="sch-hw-empty">Пока ничего не задали 🎉</p>'}
      <div class="sch-hw-how">Как добавить: напиши в чате группы <code>#дз микра выучить таблицу вакцин</code> — бот сам прикрепит ДЗ к ближайшей паре.</div></div>`; })()}`;
  drawDay();
  if (keep) window.scrollTo(0, sy);
  app.onclick = e => { const b = e.target.closest('[data-sday]'); if (b){ schedDay = +b.dataset.sday; drawDay(); if (b.classList.contains('sch-hwitem')) window.scrollTo({top:0, behavior:'smooth'}); } };
  let sx = 0; const box = $('#schday');
  box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  box.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 70){ schedDay = Math.max(0, Math.min(5, schedDay + (dx < 0 ? 1 : -1))); drawDay(); } }, {passive:true});
}

/* шутки */
const joke = k => { const a = (typeof JOKES !== 'undefined' && JOKES[k]) || ['']; return a[Math.floor(Math.random()*a.length)]; };
let jokeIdx = -1;
function nextHomeJoke(){ const a = JOKES.home; let i; do { i = Math.floor(Math.random()*a.length); } while (a.length > 1 && i === jokeIdx); jokeIdx = i; return a[i]; }

/* дневной / ночной режим */
function curTheme(){ return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
function themeBtn(){ const d = curTheme() === 'dark'; return `<button class="icon-btn theme-btn" data-act="theme" aria-label="${d ? 'Дневной режим' : 'Ночной режим'}" title="${d ? 'Дневной режим' : 'Ночной режим'}">${d ? '☀️' : '🌙'}</button>`; }
function applyTheme(t, animate){
  const h = document.documentElement;
  if (animate){ h.classList.add('theme-anim'); setTimeout(() => h.classList.remove('theme-anim'), 450); }
  h.dataset.theme = t;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#0b0d1a' : '#f6f2ff';
  document.querySelectorAll('.theme-btn').forEach(b => b.outerHTML = themeBtn());
}
applyTheme(curTheme());
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!store.get('theme', null)) applyTheme(e.matches ? 'dark' : 'light', true); }); } catch(e){}
function topBar(title, backHash, extra=''){
  extra = extra + themeBtn();
  topIn.innerHTML = backHash === null
    ? `<div class="top-title" style="padding-left:4px">🦷 Зубрёжка</div>${extra}`
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
/* текст полных версий (fulltext.json) — подгружается отдельно и кэшируется для офлайна */
let FT = null, ftLoading = false;
function loadFT(){
  if (FT || ftLoading) return; ftLoading = true;
  fetch('fulltext.json?v=' + (typeof FT_VER !== 'undefined' ? FT_VER : '0'))
    .then(r => r.ok ? r.json() : null)
    .then(d => { if (!d || !d.items) return; FT = d.items; QIDX = null;
      if ($('#qres') && quickQ.trim().length >= 2) renderQuick();
      if ($('#results') && sessionQ.trim().length >= 2) doSearch(sessionQ); })
    .catch(() => {}).finally(() => { ftLoading = false; });
}
function fullLabel(it){
  const F = FULL[it.l.id], ex = F && F.extra && F.extra.dir === it.ref;
  return '📄 ' + (ex ? esc(F.extra.title) : 'Полная версия') + (it.pg ? ' · стр. ' + it.pg : '') + (it.q ? ' · ' + esc(it.q) : '');
}
function fullBtn(it, cls){
  if (String(it.ref).includes('#')) return `<a class="${cls}" href="${it.ref}">Открыть в атласе →</a>`;
  return `<button class="${cls}" data-full="${it.l.id}|${it.ref}|${it.pg}">Открыть страницу ${it.pg} полной версии →</button>`;
}
let pendingViewer = null;
function openFullAt(lid, dir, pg){
  const F = FULL[lid], l = LEC[lid]; if (!F || !l) return;
  const ex = F.extra && F.extra.dir === dir;
  noteMode = 'full'; store.set('noteMode', 'full'); lecTab = 'notes';
  pendingViewer = [dir, ex ? F.extra.pages : F.pages, +pg, ex ? F.extra.title : l.title];
  go(hashId(lid));
}
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
  if (typeof EXAM !== 'undefined') Object.entries(EXAM).forEach(([sid, E]) => {
    const subj = SUBJ[sid]; if (!subj) return;
    const first = subj.lectures.find(l=>!l.soon); if (!first) return;
    [['theory', E.theory], ['practice', E.practice]].forEach(([kind, arr]) => arr.forEach(it => {
      const l = LEC[(it.lec||[])[0]] || first;
      items.push({ l, kind:'exam', exk: sid + '|' + examKey(kind, it.n), q: (kind==='theory' ? 'Экзамен, вопрос ' + it.n + ': ' : 'Практика ' + it.n + ': ') + it.q, a: it.short.join(' '), more: strip(it.full.map(blockText).join(' ')), kw:'', w:1.6 });
    }));
  });
  (FT||[]).forEach(([lid, ref, pg, h, t]) => {
    const l = LEC[lid]; if (!l || l.soon) return;
    items.push({ l, kind:'full', ref, pg, q: h || '', a: t, kw:'', w:.7 });
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
  loadFT();
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
      <li>Ищет и по кратким конспектам, и по полным версиям лекций.</li>
      <li>Работает без интернета.</li></ul></div>`;
    return;
  }
  const r = answerSearch(q, quickSubj);
  if (!r.length){ box.innerHTML = `<div class="empty">🤔 ${esc(joke('empty'))}<br><small>Попробуй другое слово или убери лишние</small></div>`; return; }
  const qs = qtoks(q);
  const hl = s => { let h = s; qs.forEach(t => { if (t.length < 3) return; h = h.replace(new RegExp('(^|[^а-яёa-z])(' + t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '[а-яёa-z]*)', 'gi'), '$1<mark>$2</mark>'); }); return h; };
  const src = it => it.kind === 'exam' ? `📝 ${esc(it.l.subject.short)} · вопросы к экзамену` : `${it.l.subject.emoji} ${esc(it.l.subject.short)} · ${esc(it.l.title)}`;
  const ans = it => {
    if (it.kind === 'exam') return hl(esc(it.a));
    if (it.kind !== 'full') return hl(it.a);
    const t = it.a, low = t.toLowerCase().replace(/ё/g,'е'); let pos = -1;
    qs.forEach(w => { if (w.length < 3) return; const i = low.indexOf(w); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
    const from = Math.max(0, pos - 140), cut = t.slice(from, from + 460);
    return hl(esc((from ? '…' : '') + cut + (from + 460 < t.length ? '…' : '')));
  };
  const ttl = it => it.kind === 'full' ? fullLabel(it) : hl(esc(it.q));
  const btn = it => it.kind === 'exam' ? `<button class="qopen" data-exopen="${it.exk}">Открыть в вопросах к экзамену →</button>` : it.kind === 'full' ? fullBtn(it, 'qopen') : `<button class="qopen" data-go="${go(it)}" ${it.si!=null?`data-sec="${it.si}"`:''}>Открыть в конспекте →</button>`;
  const go = it => hashId(it.l.id);
  // 🔊 Продиктовать: текст ответа кладём в реестр, в кнопке — только номер
  SAY.length = 0;
  const sayParts = it => {
    if (it.kind === 'exam'){ const [sid, key] = it.exk.split('|'), ex = EXAM[sid] && examFind(sid, key); if (ex) return ex.short; }
    if (it.kind === 'full'){ const tmp = document.createElement('div'); tmp.innerHTML = ans(it); return [tmp.textContent.replace(/^…/, '').replace(/…$/, '')]; }
    return [it.a];
  };
  const say = it => TTS_OK ? `<button class="say-btn" data-say="${SAY.push({ parts: sayParts(it), title: strip(it.q || '') }) - 1}">🔊 Продиктовать</button>` : '';
  const [top, ...rest] = r;
  const t = top.it;
  box.innerHTML = `
    <div class="qbest" style="--c:${t.l.subject.color}">
      <div class="qsrc">${src(t)}</div>
      <div class="qq">${ttl(t)}</div>
      <div class="qa">${ans(t)}</div>
      ${(t.kind==='sec'||t.kind==='exam') && t.more ? `<details class="qmore"><summary>Подробнее</summary><div>${hl(esc(t.more))}</div></details>` : ''}
      <div class="qbtns">${say(t)}${btn(t)}</div>
    </div>
    ${rest.length ? `<div class="section-label">Похожие ответы</div>` + rest.map(({it}) => `
      <details class="qalt"><summary><small>${src(it)}</small><b>${ttl(it)}</b></summary>
        <div class="qa">${ans(it)}</div>
        <div class="qbtns">${say(it)}${btn(it)}</div></details>`).join('') : ''}`;
}


/* ---------- 🔊 диктовка вслух (голос телефона; звук идёт туда же, куда музыка — в Bluetooth-наушники, если подключены) ---------- */
const TTS_OK = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
const SAY = [];
const TTS_RATES = [0.8, 1, 1.2, 1.5];
const TTS = { parts: [], list: [], i: 0, on: false, paused: false, done: false, gen: 0, tmr: 0, u: null, title: '', lock: null,
  rate: store.get('ttsRate', 1), dict: store.get('ttsDict', false) };
if (TTS_OK) try { speechSynthesis.getVoices(); } catch(e){} // Chrome подгружает голоса не сразу
function ttsVoice(){
  let vs = []; try { vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang)); } catch(e){}
  if (!vs.length) return null;
  const sc = v => (/enhanced|premium|улучш/i.test(v.name) ? 4 : 0) + (/milena|милена|google|yuri|юрий|katya|катя|dariya|svetlana|irina/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
  return vs.sort((a, b) => sc(b) - sc(a))[0];
}
// текст → то, что удобно слушать: без тегов, эмодзи и сокращений
function ttsClean(s){
  const W = '(^|[^а-яёa-z])';
  const rep = [[W + 'т\\.\\s?е\\.', 'то есть'], [W + 'т\\.\\s?к\\.', 'так как'], [W + 'и т\\.\\s?д\\.', 'и так далее'], [W + 'и т\\.\\s?п\\.', 'и тому подобное'],
    [W + 'т\\.\\s?н\\.', 'так называемый'], [W + 'напр\\.', 'например'], [W + 'в т\\.\\s?ч\\.', 'в том числе'], [W + 'мин\\.', 'минут'], [W + 'ч\\.(?=\\s|$)', 'часов']];
  let t = strip(String(s)).replace(/&nbsp;/g, ' ').replace(/&amp;/g, ' и ').replace(/&lt;/g, ' меньше ').replace(/&gt;/g, ' больше ').replace(/&quot;/g, '"');
  try { t = t.replace(/[\p{Extended_Pictographic}️‍]/gu, ''); } catch(e){}
  rep.forEach(([a, b]) => { t = t.replace(new RegExp(a, 'gi'), '$1' + b); });
  return t.replace(/\s*[→⇒➝➔]\s*/g, ' — ').replace(/≈/g, ' примерно ').replace(/≥/g, ' не меньше ').replace(/≤/g, ' не больше ')
    .replace(/±/g, ' плюс-минус ').replace(/°\s?С|°\s?C/g, ' градусов').replace(/°/g, ' градусов').replace(/×/g, ' на ').replace(/([а-яё]{4,})\/([а-яё]{4,})/gi, '$1 или $2').replace(/\s+/g, ' ').trim();
}
// режем на фразы: обычный режим — по предложениям, диктант — короткими кусками, чтобы успевать записывать
function ttsSplit(parts, dict){
  const max = dict ? 75 : 220, out = [];
  parts.forEach(p => {
    const t = ttsClean(p); if (!t) return;
    // предложения: точка + пробел, но не внутри «кавычек» и не перед строчной буквой
    const sents = []; let st = 0, q = 0;
    for (let i = 0; i < t.length; i++){
      const ch = t[i];
      if (ch === '«') q++; else if (ch === '»') q = Math.max(0, q - 1);
      else if (!q && '.!?…;'.includes(ch) && t[i+1] === ' ' && (ch === ';' || !/[a-zа-яё]/.test(t[i+2] || ''))){ sents.push(t.slice(st, i + 1)); st = i + 2; }
    }
    sents.push(t.slice(st));
    sents.forEach(sn => {
      sn = sn.trim(); if (!sn) return;
      if (sn.length <= max){ out.push(sn); return; }
      const parts = []; let cur = '';
      sn.replace(/([,:])\s+/g, '$1\u0001').replace(/\s+—\s+/g, ' —\u0001').replace(/\s+\(/g, '\u0001(').split('\u0001').forEach(b => {
        if (cur && (cur + ' ' + b).length > max){ parts.push(cur); cur = b; } else cur = cur ? cur + ' ' + b : b;
      });
      // короткий хвост приклеиваем к предыдущему куску
      if (cur){ if (parts.length && cur.length < max * .35 && (parts[parts.length-1] + ' ' + cur).length < max * 1.3) parts[parts.length-1] += ' ' + cur; else parts.push(cur); }
      out.push(...parts);
    });
  });
  return out;
}
function ttsStart(parts, title){
  if (!TTS_OK) return;
  const list = ttsSplit(parts, TTS.dict); if (!list.length){ toast('Тут нечего диктовать'); return; }
  Object.assign(TTS, { parts, list, i: 0, title: strip(title || ''), on: true, paused: false, done: false });
  ttsBar(); ttsLock(true); ttsPlay();
  if (!store.get('ttsTip')){ store.set('ttsTip', 1); toast('🎧 Звук идёт туда же, куда музыка: подключены наушники — будет в них'); }
  else if (!ttsVoice()) setTimeout(() => { if (TTS.on && !ttsVoice()) toast('Нет русского голоса в телефоне — поставь его в настройках озвучки'); }, 1500);
}
function ttsPlay(){
  const g = ++TTS.gen; clearTimeout(TTS.tmr);
  TTS.paused = false; TTS.done = false;
  const busy = speechSynthesis.speaking || speechSynthesis.pending;
  try { speechSynthesis.cancel(); } catch(e){}
  const go = () => {
    if (g !== TTS.gen) return;
    const u = new SpeechSynthesisUtterance(TTS.list[TTS.i]);
    u.lang = 'ru-RU'; const v = ttsVoice(); if (v) u.voice = v;
    u.rate = TTS.rate * (TTS.dict ? 0.85 : 1);
    u.onend = () => { if (g === TTS.gen) ttsAfter(g, u.text); };
    u.onerror = e => { if (g !== TTS.gen || e.error === 'interrupted' || e.error === 'canceled') return; ttsAfter(g, u.text); };
    TTS.u = u; // держим ссылку: иначе Chrome теряет onend
    speechSynthesis.speak(u); ttsUpd();
  };
  if (busy) setTimeout(go, 90); else go(); // первый запуск — прямо в нажатии (так требует iPhone)
}
function ttsAfter(g, text){
  if (TTS.i >= TTS.list.length - 1){ TTS.gen++; TTS.paused = true; TTS.done = true; ttsLock(false); ttsUpd(); return; }
  const pause = TTS.dict ? Math.min(6500, 800 + text.length * 60) / TTS.rate : 250; // в диктанте — пауза, чтобы записать
  TTS.tmr = setTimeout(() => { if (g !== TTS.gen) return; TTS.i++; ttsPlay(); }, pause);
}
function ttsPause(){ TTS.gen++; clearTimeout(TTS.tmr); try { speechSynthesis.cancel(); } catch(e){} TTS.paused = true; ttsLock(false); ttsUpd(); }
function ttsStop(){
  TTS.gen++; clearTimeout(TTS.tmr); try { speechSynthesis.cancel(); } catch(e){}
  TTS.on = false; ttsLock(false); const b = $('#tts'); if (b) b.remove(); document.documentElement.classList.remove('tts-on');
}
async function ttsLock(on){ // не даём экрану погаснуть, пока диктует (на iPhone с погасшим экраном озвучка встаёт)
  try {
    if (on && !TTS.lock && 'wakeLock' in navigator){ TTS.lock = await navigator.wakeLock.request('screen'); TTS.lock.addEventListener('release', () => { TTS.lock = null; }); }
    else if (!on && TTS.lock){ const l = TTS.lock; TTS.lock = null; await l.release(); }
  } catch(e){}
}
function ttsBar(){
  let b = $('#tts');
  if (!b){ b = document.createElement('div'); b.id = 'tts'; b.className = 'tts'; document.body.appendChild(b); }
  document.documentElement.classList.add('tts-on');
  b.innerHTML = `<div class="tts-top"><span class="tts-ic">🔊</span><div class="tts-txt"><small id="ttsTitle"></small><div id="ttsNow"></div></div><button class="tts-x" data-tts="stop" aria-label="Закрыть">✕</button></div>
    <div class="tts-ctl">
      <button data-tts="prev" aria-label="Предыдущая фраза">⏮</button>
      <button data-tts="again" aria-label="Повторить фразу">↺</button>
      <button data-tts="toggle" class="tts-main" id="ttsToggle" aria-label="Пауза">⏸</button>
      <button data-tts="next" aria-label="Следующая фраза">⏭</button>
      <button data-tts="rate" id="ttsRate" class="tts-txtbtn" aria-label="Скорость"></button>
      <button data-tts="mode" id="ttsMode" class="tts-txtbtn" aria-label="Режим"></button>
    </div>`;
  ttsUpd();
}
function ttsUpd(){
  if (!$('#tts')) return;
  const n = TTS.list.length;
  $('#ttsTitle').textContent = (TTS.done ? '✓ Готово' : `${TTS.i + 1} из ${n}`) + (TTS.title ? ' · ' + TTS.title : '');
  $('#ttsNow').textContent = TTS.done ? 'Нажми ▶, чтобы прослушать ещё раз' : TTS.list[TTS.i] || '';
  const tg = $('#ttsToggle'); tg.textContent = TTS.paused ? '▶' : '⏸'; tg.setAttribute('aria-label', TTS.paused ? 'Дальше' : 'Пауза');
  $('#ttsRate').textContent = String(TTS.rate).replace('.', ',') + '×';
  $('#ttsMode').textContent = TTS.dict ? '✍️ Диктант' : '🗣 Подряд';
}
function ttsCmd(a){
  const n = TTS.list.length;
  if (a === 'stop') return ttsStop();
  if (a === 'toggle'){ if (TTS.done){ TTS.i = 0; ttsLock(true); ttsPlay(); } else if (TTS.paused){ ttsLock(true); ttsPlay(); } else ttsPause(); return; }
  if (a === 'again'){ ttsLock(true); ttsPlay(); return; }
  if (a === 'prev'){ TTS.i = Math.max(0, TTS.i - 1); ttsLock(true); ttsPlay(); return; }
  if (a === 'next'){ if (TTS.i < n - 1){ TTS.i++; ttsLock(true); ttsPlay(); } return; }
  if (a === 'rate'){ TTS.rate = TTS_RATES[(TTS_RATES.indexOf(TTS.rate) + 1) % TTS_RATES.length]; store.set('ttsRate', TTS.rate); if (!TTS.paused) ttsPlay(); else ttsUpd(); return; }
  if (a === 'mode'){
    // пересобираем фразы и остаёмся примерно на том же месте
    const at = TTS.list.slice(0, TTS.i).join(' ').length;
    TTS.dict = !TTS.dict; store.set('ttsDict', TTS.dict); TTS.list = ttsSplit(TTS.parts, TTS.dict);
    let acc = 0, j = 0; while (j < TTS.list.length - 1 && acc + TTS.list[j].length < at){ acc += TTS.list[j].length + 1; j++; }
    TTS.i = TTS.done ? 0 : j;
    toast(TTS.dict ? '✍️ Диктант: по кусочку, с паузами, чтобы успевать писать' : '🗣 Подряд: читает без пауз');
    if (!TTS.paused) ttsPlay(); else ttsUpd(); return;
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !TTS.on || TTS.paused) return;
  ttsLock(true);
  // iPhone останавливает озвучку, если экран погас — продолжаем с текущей фразы
  setTimeout(() => { if (TTS.on && !TTS.paused && !speechSynthesis.speaking && !speechSynthesis.pending) ttsPlay(); }, 400);
});

/* ---------- views ---------- */
function viewHome(){
  setAccent(null);
  topBar('', null, `<button class="icon-btn" data-act="install">📲 На экран</button>`);
  const last = LEC[store.get('last','')];
  const lecCount = s => s.lectures.filter(l=>!l.soon).length;
  const word = n => n%10===1&&n%100!==11?'лекция':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'лекции':'лекций';
  app.innerHTML = `
    <div class="hero"><small>Группа С-201 · грызём гранит науки 🦷</small>
      <h1>Зубрёжка</h1><p>Зубы у нас крепкие — гранит науки выдержат. Конспекты простыми словами, карточки и тесты.</p></div>
    <button class="joke" data-act="joke" aria-label="Другая шутка"><span class="jk-ic">😄</span><span class="jk-t">${esc(nextHomeJoke())}</span><span class="jk-dice">🎲</span></button>
    <button class="quick-btn" data-go="otvet"><span class="qi">⚡</span><div><b>Быстрый ответ</b><span>Для устного опроса: вбил вопрос — получил ответ</span></div><span class="chev">${I.chev}</span></button>
    ${typeof SCHEDULE !== 'undefined' ? `<button class="sched-btn" data-go="raspisanie"><span class="sb-ic">📅</span><span class="sb-txt"><b>Расписание</b><span>${schedBtnText()}</span>${(SCHEDULE.changes||[]).length && !(schedNow()||{}).state?.startsWith?.('old') ? '<span class="sb-chg">⚠️ Изменения в расписании</span>' : ''}</span>${hwBadge()}${I.chev}</button>` : ''}
    <div class="search">${I.search}<input id="q" type="search" placeholder="Поиск по конспектам: «мейоз», «кодон»…" autocomplete="off"></div>
    <div id="results"></div>
    <div id="homeBody">
      ${last ? `<div class="section-label">Продолжить</div>
        <button class="continue" data-go="${hashId(last.id)}"><div class="em" style="background:${last.subject.soft}">${last.subject.emoji}</div>
        <div><b>${esc(last.title)}</b><span>${esc(last.subject.short)} · лекция ${last.num}</span></div><span class="chev">${I.chev}</span></button>` : ''}
      <div class="section-label">Предметы</div>
      <div class="subjects">${SUBJECTS.map(s=>`
        <button class="subj" data-go="s-${s.id}" style="--c:${s.color};--ci:${s.ink};--cs:${s.soft}">
          <div class="em" style="background:${s.soft}">${s.emoji}</div>
          <h3>${esc(s.name)}</h3>
          ${s.teacher ? `<div class="teacher">👤 ${esc(s.teacher)}</div>` : ''}
          <div class="meta"><span>${lecCount(s) ? lecCount(s)+' '+word(lecCount(s)) : 'скоро'}</span><span class="chev">${I.chev}</span></div>
          <div class="bar" style="background:${s.color}"></div>
        </button>`).join('')}</div>
      <button class="install" data-act="install"><span class="em">📲</span><div><b>Поставить на экран телефона</b><span>Будет открываться как приложение — iPhone и Android</span></div></button>
      <div class="foot">Материалы обновляются · одна ссылка для всей группы<br><button class="link-btn bug-link" data-bug="G">🐞 Нашёл ошибку на сайте?</button></div>
    </div>`;
  const q = $('#q');
  q.addEventListener('input', () => { loadFT(); doSearch(q.value); });
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
  (FT||[]).forEach(([lid, ref, pg, h, t]) => {
    const l = LEC[lid]; if (!l || l.soon) return;
    const idx = t.toLowerCase().indexOf(q); if (idx < 0) return;
    const from = Math.max(0, idx-50);
    hits.push({l, full:{l, ref, pg, q:h}, title:'', text:(from?'…':'')+t.slice(from, idx+q.length+80)+'…', score:.5});
  });
  hits.sort((a,b)=>b.score-a.score);
  const hl = s => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'), m=>`<mark>${m}</mark>`);
  const open = h => !h.full ? `<button class="res" data-go="${hashId(h.l.id)}" data-sec="${h.si}">`
    : String(h.full.ref).includes('#') ? `<a class="res" href="${h.full.ref}">` : `<button class="res" data-full="${h.l.id}|${h.full.ref}|${h.full.pg}">`;
  box.innerHTML = hits.length ? `<div class="section-label">Найдено: ${hits.length}</div>` + hits.slice(0,40).map(h=>`
    ${open(h)}
      <small style="color:${h.l.subject.color}">${h.l.subject.emoji} ${esc(h.l.subject.short)} · ${esc(h.l.title)}</small>
      <b>${h.full ? fullLabel(h.full) : hl(h.title)}</b><span>${hl(h.text)}</span>${h.full && String(h.full.ref).includes('#') ? '</a>' : '</button>'}`).join('') : `<div class="empty">🤔 ${esc(joke('empty'))}<br><small>Попробуй другое слово</small></div>`;
}

function viewSubject(s){
  setAccent(s);
  topBar(s.short, '', `<button class="icon-btn" data-go="otvet" aria-label="Быстрый ответ">⚡</button>`);
  app.innerHTML = `
    <div class="subj-head" style="background:linear-gradient(135deg, ${s.color}, ${s.ink})">
      <div class="em">${s.emoji}</div><h1>${esc(s.name)}</h1>
      ${s.teacher ? `<p class="t">👤 Преподаватель: <b>${esc(s.teacher)}</b></p>` : ''}<p>${s.lectures.filter(l=>!l.soon).length || 'пока нет'} ${s.lectures.filter(l=>!l.soon).length?'лекц.':'лекций'}</p></div>
    ${typeof EXAM !== 'undefined' && EXAM[s.id] ? examEntry(s) : ''}
    ${typeof TESTPDF !== 'undefined' && TESTPDF[s.id] ? TESTPDF[s.id].map(t=>`<button class="exam-entry" data-tfile="${esc(t.file)}|${esc(t.name)}" style="--c:${s.color};--ci:${s.ink};--cs:${s.soft}"><div class="ee-em">✅</div><div><b>${esc(t.title)}</b><span>${esc(t.sub)} · PDF</span></div><span class="chev">${I.chev}</span></button>`).join('') : ''}
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


/* ===== вопросы к экзамену ===== */
let examMode = store.get('examMode','full'), examQ = '', examTab = 'theory', examOnlyNew = false, pendingExam = null;
const EXM = {}; // режим отдельных вопросов
const examKey = (kind, n) => (kind==='theory' ? 't' : 'p') + n;
function examKnown(sid){ return (store.get('examKnown',{})[sid]) || {}; }
function examStats(sid){ const E = EXAM[sid], k = examKnown(sid); const all = E.theory.length + E.practice.length; return { all, known: Object.keys(k).filter(x=>k[x]).length }; }
function examEntry(s){
  const E = EXAM[s.id], st = examStats(s.id);
  return `<button class="exam-entry" data-go="exam-${s.id}" style="--c:${s.color};--ci:${s.ink};--cs:${s.soft}">
    <div class="ee-em">📝</div><div><b>${esc(E.title)}</b><span>${E.theory.length} вопросов + ${E.practice.length} практических · ответы полные и краткие</span>
    ${st.known?`<div class="ee-prog"><i style="width:${Math.round(st.known/st.all*100)}%"></i></div><small>знаю ${st.known} из ${st.all}</small>`:''}</div><span class="chev">${I.chev}</span></button>`;
}
function examBody(it, mode){
  const pics = it.pics || [];
  if (mode==='short') return `<ul class="ex-short">${it.short.map(x=>`<li>${x}</li>`).join('')}</ul>${pics.length?`<div class="ex-pics">${blockHTML(pics[0])}</div>`:''}`;
  const f = it.full.slice(); f.splice(Math.min(1, f.length), 0, ...pics);
  return `<div class="ex-full">${f.map(blockHTML).join('')}</div>`;
}
function examText(it){ return strip(it.q + ' ' + it.short.join(' ') + ' ' + it.full.map(blockText).join(' ')).toLowerCase().replace(/ё/g,'е'); }
function examItemHTML(sid, it, kind){
  const key = examKey(kind, it.n), kn = examKnown(sid)[key], mode = EXM[key] || examMode;
  const lecs = (it.lec||[]).filter(id=>LEC[id]).map(id=>`<button class="ex-lec" data-go="${hashId(id)}">📖 Лекция ${LEC[id].num}</button>`).join('');
  return `<details class="exq ${kn?'known':''}" data-key="${key}" id="ex-${key}">
    <summary><span class="ex-n">${kind==='theory'?it.n:'П'+it.n}</span><b>${esc(it.q)}</b><span class="ex-ok">${kn?'✓':''}</span></summary>
    <div class="ex-a">
      <div class="mode ex-mode"><button class="${mode==='full'?'on':''}" data-exm="full" data-key="${key}">📖 Полный ответ</button><button class="${mode==='short'?'on':''}" data-exm="short" data-key="${key}">⚡ Кратко</button></div>
      <div class="ex-body">${examBody(it, mode)}</div>
      <div class="ex-foot">${lecs}${TTS_OK ? `<button class="ex-lec ex-say" data-sayex="${key}">🔊 Продиктовать</button>` : ''}<button class="ex-lec ex-bug" data-bug="X|${sid}|${key}" aria-label="Нашёл ошибку" title="Нашёл ошибку">🐞</button><button class="ex-know ${kn?'on':''}" data-exknow="${key}">${kn?'✓ Знаю':'Отметить «знаю»'}</button></div>
    </div></details>`;
}
function viewExam(s){
  setAccent(s);
  const E = EXAM[s.id];
  topBar('Экзамен', 's-'+s.id, `<button class="icon-btn" data-go="otvet" aria-label="Быстрый ответ">⚡</button>`);
  app.innerHTML = `
    <div class="subj-head" style="background:linear-gradient(135deg, ${s.color}, ${s.ink})">
      <div class="em">📝</div><h1>${esc(E.title)}</h1><p class="t">${esc(s.name)} · 👤 ${esc(s.teacher||'')}</p><p>${esc(E.sub)}</p>
      <div class="ex-stat" id="exStat"></div></div>
    <div class="mode ex-tabs"><button data-extab="theory" class="${examTab==='theory'?'on':''}">Теория · ${E.theory.length}</button><button data-extab="practice" class="${examTab==='practice'?'on':''}">Практика · ${E.practice.length}</button></div>
    <div class="search ex-search">${I.search}<input id="exq" type="search" placeholder="Найти вопрос: стерилизация, отходы, бикс…" autocomplete="off" enterkeyhint="search"></div>
    <div class="ex-tools">
      <div class="mode ex-gmode"><button data-exg="full" class="${examMode==='full'?'on':''}">📖 Все полные</button><button data-exg="short" class="${examMode==='short'?'on':''}">⚡ Все краткие</button></div>
      <div class="actions">
        <button class="chip" data-exact="open">Раскрыть все</button><button class="chip" data-exact="close">Свернуть</button>
        <button class="chip ${examOnlyNew?'on':''}" data-exact="new">Только незнакомые</button>
        <button class="chip" data-exact="pdf">${I.pdf} PDF полный</button><button class="chip" data-exact="pdf-short">${I.pdf} PDF краткий</button>
      </div>
    </div>
    <div id="exList"></div>
    <div class="navrow"><button data-act="totop">↑ Наверх</button><button data-go="s-${s.id}">📚 Лекции</button><button data-go="otvet">⚡ Быстрый ответ</button><button data-go="">${I.home} Главная</button></div>`;
  const inp = $('#exq'); inp.value = examQ;
  let tmr; inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { examQ = inp.value; renderExamList(s); }, 120); });
  renderExamList(s);
  if (pendingExam){ const k = pendingExam; pendingExam = null; const el = $('#ex-'+k); if (el){ el.open = true; requestAnimationFrame(()=>el.scrollIntoView({block:'start'})); } }
}
function renderExamList(s){
  const E = EXAM[s.id], box = $('#exList'); if (!box) return;
  const st = examStats(s.id), stEl = $('#exStat');
  if (stEl) stEl.innerHTML = `<div class="ee-prog light"><i style="width:${Math.round(st.known/st.all*100)}%"></i></div><small>Знаю ${st.known} из ${st.all}</small>`;
  const q = examQ.trim().toLowerCase().replace(/ё/g,'е'), words = q.split(/\s+/).filter(w=>w.length>1).map(w=>w.length>5?w.slice(0,w.length-2):w);
  const kn = examKnown(s.id);
  let list = E[examTab];
  if (q) {
    // поиск сразу по обоим разделам
    list = [...E.theory.map(it=>[it,'theory']), ...E.practice.map(it=>[it,'practice'])].filter(([it]) => { const t = it._t || (it._t = examText(it)); return words.every(w => t.includes(w)); });
    box.innerHTML = list.length ? `<div class="section-label">Найдено: ${list.length}</div>` + list.map(([it,k]) => examItemHTML(s.id, it, k)).join('') : `<div class="empty">🤔 Ничего не нашлось. Попробуй другое слово.</div>`;
    return;
  }
  if (examOnlyNew) list = list.filter(it => !kn[examKey(examTab, it.n)]);
  box.innerHTML = list.length ? list.map(it => examItemHTML(s.id, it, examTab)).join('') : `<div class="empty">🎉 Все вопросы этого раздела отмечены как выученные!</div>`;
}
function examFind(sid, key){ const E = EXAM[sid]; return (key[0]==='t' ? E.theory : E.practice).find(it => it.n === +key.slice(1)); }
function printableExam(sid, mode){
  const E = EXAM[sid], s = SUBJ[sid];
  const part = (arr, kind, title) => `<h1 class="part">${title}</h1>` + arr.map(it => `<div class="q"><h2>${kind==='theory'?it.n:'П'+it.n}. ${esc(it.q)}</h2>${mode==='short' ? `<ul>${it.short.map(x=>`<li>${x}</li>`).join('')}</ul>${(it.pics||[]).slice(0,1).map(blockHTML).join('')}` : (()=>{ const f = it.full.slice(); f.splice(Math.min(1,f.length),0,...(it.pics||[])); return f.map(b=>blockHTML(b).replace('class="tbl"','')).join(''); })()}</div>`).join('');
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(E.title)}${mode==='short'?' — кратко':''}</title><style>
@page{size:A4;margin:15mm 14mm}
body{font-family:"Golos Text",Inter,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2030;line-height:1.45;font-size:10.8pt;max-width:780px;margin:0 auto;padding:16px}
.cover{border-radius:14px;padding:18px 20px;color:#fff;background:linear-gradient(135deg,${s.color},${s.ink});-webkit-print-color-adjust:exact;print-color-adjust:exact;margin-bottom:10px}
.cover h1{margin:0 0 6px;font-size:21pt} .cover p{margin:0;opacity:.92}
h1.part{font-size:16pt;color:${s.ink};margin:22px 0 6px;break-after:avoid;border-bottom:2px solid ${s.soft};padding-bottom:4px}
.q{margin:12px 0 14px}
.q h2{font-size:12pt;margin:0 0 6px;color:${s.ink};break-after:avoid}
.q ul,.q ol{margin:4px 0 6px;padding-left:20px} .q li{margin:2px 0}
h3{font-size:11pt;margin:8px 0 4px}
.box{border-radius:8px;padding:6px 10px;margin:6px 0;border-left:4px solid;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.box .tag{display:block;font-size:8pt;font-weight:800;text-transform:uppercase}
.sut{background:#fdecef;border-color:#e0527a}.simple{background:#e7f6ea;border-color:#3f9e5c}.imp{background:#fff4d9;border-color:#e0a000}.fact{background:#eef3ff;border-color:#5b7fd6}
.note{font-size:9.5pt;color:#6a6f82} p{margin:4px 0}
table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:6px 0;break-inside:avoid}
th{background:${s.soft};color:${s.ink};text-align:left;padding:5px 7px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
td{padding:5px 7px;border-bottom:1px solid #e6e4ef;vertical-align:top}
figure{text-align:center;margin:8px 0;break-inside:avoid} figure svg{max-width:100%;max-height:90mm;height:auto} figure.pic img{max-width:90%;max-height:110mm;border-radius:8px;border:1px solid #e6e4ef} figcaption:empty{display:none}
</style></head><body>
<div class="cover"><h1>📝 ${esc(E.title)}</h1><p>${esc(s.name)} · ${esc(s.teacher||'')}</p><p>${E.theory.length} вопросов по теории + ${E.practice.length} практических заданий · ${mode==='short'?'краткие ответы':'полные ответы'}</p></div>
${part(E.theory,'theory','Теория')}${part(E.practice,'practice','Практические задания')}
</body></html>`;
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
      <button class="chip bug-chip" data-bug="L|${l.id}">🐞 Нашёл ошибку</button>
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
    <div class="actions"><button class="chip" data-act="dl-full" data-id="${l.id}">${I.pdf} Скачать полный PDF</button><button class="chip bug-chip" data-bug="L|${l.id}|f">🐞 Нашёл ошибку</button>
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
        <p>Знаешь ${known.size} из ${l.cards.length} карточек</p><p class="done-joke">${esc(joke('cards'))}</p>
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
      <div class="fc-links"><button class="link-btn" data-act="cards-reset">Сбросить прогресс</button><button class="link-btn bug-link" data-bug="L|${l.id}|c${i}">🐞 Ошибка в карточке?</button></div>`;
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
        <p>${pct===1?'Идеально! Ты готов.':pct>=.6?'Хорошо! Пару тем стоит повторить.':'Повтори конспект и попробуй ещё раз.'}</p><p class="done-joke">${esc(joke(pct===1?'quizTop':pct>=.6?'quizMid':'quizLow'))}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="primary" data-act="quiz-again">Пройти ещё раз</button><button class="secondary" data-tab="notes">К конспекту</button></div></div>`;
      return;
    }
    const q = qs[pos];
    pane.innerHTML = `
      <div class="fc-top"><span>Вопрос ${pos+1} из ${qs.length}</span><span>правильно: ${score}</span></div>
      <div class="pbar"><i style="width:${pos/qs.length*100}%"></i></div>
      <div class="q-card"><h3>${q.q}</h3>${q.o.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}<div id="why"></div></div>
      <div class="fc-links"><button class="link-btn bug-link" data-bug="L|${l.id}|q${pos}">🐞 Ошибка в вопросе?</button></div>`;
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
figure{text-align:center;margin:10px 0;break-inside:avoid} figcaption{font-size:9pt;color:#6a6f82} figure svg{max-width:100%;height:auto} figure.pic img{max-width:92%;max-height:118mm;border-radius:8px;border:1px solid #e6e4ef}
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

function printableFull(l){
  const s = l.subject, secs = l.sections.concat(l.more||[]);
  const nShort = l.sections.length;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${esc(s.short)} — ${esc(l.title)} (полная версия)</title><style>
@page{size:A4;margin:14mm 14mm}
body{font-family:"Golos Text",Inter,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2030;line-height:1.5;font-size:10.8pt;max-width:780px;margin:0 auto}
.cover{border-radius:16px;padding:22px 24px;color:#fff;background:linear-gradient(135deg,${s.color},${s.ink});-webkit-print-color-adjust:exact;print-color-adjust:exact;margin-bottom:14px}
.cover .k{font-size:9.5pt;font-weight:700;opacity:.9;text-transform:uppercase;letter-spacing:.05em}
.cover h1{margin:6px 0 6px;font-size:23pt;line-height:1.15} .cover p{margin:0;opacity:.92}
.toc{border:1px solid #e6e4ef;border-radius:12px;padding:10px 16px;margin:0 0 10px;columns:2;column-gap:24px;font-size:10pt}
.toc div{break-inside:avoid;margin:2px 0} .toc b{color:${s.ink}}
.legend{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;font-size:8.5pt}
.legend span{padding:3px 8px;border-radius:6px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h2{font-size:15pt;margin:22px 0 8px;color:${s.ink};break-after:avoid;display:flex;gap:10px;align-items:center}
h2 .n{display:inline-grid;place-items:center;min-width:28px;height:28px;border-radius:9px;background:${s.color};color:#fff;font-size:12pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h2.more .n{background:${s.ink}}
.part{margin:26px 0 4px;padding:8px 14px;border-radius:10px;background:${s.soft};color:${s.ink};font-weight:800;font-size:12pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;break-after:avoid}
h3{font-size:11.5pt;margin:10px 0 4px;break-after:avoid}
.box{border-radius:8px;padding:7px 12px;margin:8px 0;border-left:4px solid;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.box .tag{display:block;font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.sut{background:#fdecef;border-color:#e0527a}.simple{background:#e7f6ea;border-color:#3f9e5c}.imp{background:#fff4d9;border-color:#e0a000}.fact{background:#eef3ff;border-color:#5b7fd6}
.note{font-size:9.5pt;color:#6a6f82;margin:6px 0} p{margin:6px 0} ul,ol{padding-left:22px;margin:6px 0} li{margin:3px 0}
table{border-collapse:collapse;width:100%;font-size:9.6pt;margin:8px 0;break-inside:avoid}
th{background:${s.soft};color:${s.ink};text-align:left;padding:6px 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
td{padding:6px 8px;border-bottom:1px solid #e6e4ef;vertical-align:top}
figure{text-align:center;margin:10px 0;break-inside:avoid} figure svg{max-width:100%;max-height:100mm;height:auto} figure.pic img{max-width:94%;max-height:120mm;border-radius:8px;border:1px solid #e6e4ef}
figcaption{font-size:9pt;color:#6a6f82;margin-top:3px} figcaption:empty{display:none}
.rem{background:#fff7d6;border-radius:12px;padding:10px 18px;margin-top:20px;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cards{columns:2;column-gap:18px;font-size:9.6pt} .cards div{break-inside:avoid;margin:0 0 7px;padding:6px 9px;border:1px solid #e6e4ef;border-radius:7px}
.quiz{font-size:9.6pt} .quiz div{break-inside:avoid;margin:0 0 6px}
.src{font-size:8.5pt;color:#9aa0ad;margin-top:16px}
</style></head><body>
<div class="cover"><div class="k">${esc(s.name)} · лекция ${l.num}${l.date?' · '+l.date:''} · полная версия</div><h1>${esc(l.title)}</h1><p>${esc(l.sub)}</p><p style="margin-top:6px">👤 ${esc(s.teacher||'')}</p></div>
<div class="toc">${secs.map((x,i)=>`<div><b>${i+1}.</b> ${esc(x.title)}${i>=nShort?' <span style="color:#9aa0ad">· подробнее</span>':''}</div>`).join('')}</div>
<div class="legend"><span style="background:#fdecef">Суть — главное одной фразой</span><span style="background:#e7f6ea">Простыми словами</span><span style="background:#fff4d9">Важно</span><span style="background:${s.soft}">Таблицы</span></div>
${secs.map((x,i)=>`${i===nShort?`<div class="part">📖 Подробнее — дополнительные материалы к теме</div>`:''}<h2 class="${i>=nShort?'more':''}"><span class="n">${i+1}</span><span>${esc(x.title)}</span></h2>${x.blocks.map(b=>blockHTML(b).replace('class="tbl"','')).join('')}`).join('')}
<div class="rem"><h2 style="margin-top:6px">📌 Что запомнить</h2><ul>${l.remember.map(r=>`<li>${r}</li>`).join('')}</ul></div>
${(l.facts||[]).map(f=>blockHTML(['fact',f])).join('')}
<h2>🃏 Вопросы для самопроверки</h2><div class="cards">${l.cards.map(c=>`<div><b>${c[0]}</b><br>${c[1]}</div>`).join('')}</div>
<h2>✅ Тест с ответами</h2><div class="quiz">${l.quiz.map((q,i)=>`<div><b>${i+1}. ${q.q}</b><br>Ответ: ${q.o[q.a]} — <span style="color:#6a6f82">${q.why}</span></div>`).join('')}</div>
<div class="src">Конспект составлен по лекции и дополнительным материалам преподавателя. Иллюстрации: схемы — собственные; иконки Healthicons (MIT); рисунки Servier Medical Art (CC BY 3.0), DBCLS (CC BY 4.0) и OpenClipart (CC0) из коллекции Bioicons; слайды — материалы к занятиям.</div>
</body></html>`;
}
function plainText(l){
  let t = `${l.subject.name} · лекция ${l.num}\n${l.title}\n\n`;
  l.sections.forEach((s,i)=>{ t += `${i+1}. ${s.title}\n`; s.blocks.forEach(b=>{
    const pre = {sut:'Суть: ',simple:'Простыми словами: ',imp:'Важно: ',note:'',fact:'Интересно: '}[b[0]] ?? '';
    if (b[0]==='ul'||b[0]==='ol') b[1].forEach((x,k)=>t+=`${b[0]==='ol'?(k+1)+'.':'•'} ${strip(x)}\n`);
    else if (b[0]==='table') { t += b[1].join(' | ')+'\n'; b[2].forEach(r=>t+=r.join(' | ')+'\n'); }
    else if (b[0]!=='svg' && b[0]!=='img') t += pre + strip(b[1]) + '\n';
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

/* ===== «Нашёл ошибку» → бот в Telegram (bot/homework_bot.py пересылает админу) ===== */
const BOT_CFG_URL = 'https://raw.githubusercontent.com/KapustaTrue/stomatologi/main/bot/config.json';
let botName = store.get('botName', ''), botLoad = null;
function loadBotName(){
  if (!botLoad) botLoad = fetch(BOT_CFG_URL + '?t=' + Math.floor(Date.now() / 600000), { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null).then(d => { if (d && d.username){ botName = d.username; store.set('botName', botName); } return botName; })
    .catch(() => botName).finally(() => { setTimeout(() => { botLoad = null; }, 60000); });
  return botLoad;
}
function secInView(){ let cur = 0; document.querySelectorAll('section.sec').forEach((el, i) => { if (el.getBoundingClientRect().top < window.innerHeight * .4) cur = i; }); return cur; }
let BUG = null; // {kind, id, code}
function bugPayload(){
  if (!BUG) return 'g';
  if (BUG.kind === 'L') return `e_${BUG.code}_${BUG.id}`;
  if (BUG.kind === 'X') return `x_${BUG.code}_${BUG.id}`;
  return 'g';
}
function bugLink(){ return botName ? `https://t.me/${botName}?start=${encodeURIComponent(bugPayload())}` : ''; }
function bugSyncLink(){
  const a = $('#bugGo'), miss = $('#bugMiss'); if (!a) return;
  const u = bugLink(); a.hidden = !u; if (u) a.href = u; if (miss) miss.hidden = !!u;
}
function openBug(spec){
  const [kind, id, code] = spec.split('|');
  let where = '', pick = '';
  if (kind === 'L' && LEC[id]){
    const l = LEC[id];
    const def = code || (lecTab === 'notes' ? String(secInView()) : lecTab === 'cards' ? 'c' : 'q');
    BUG = { kind, id, code: def };
    where = `${l.subject.emoji} ${l.subject.short} · лекция ${l.num}: ${l.title}`;
    const opts = [];
    if (/^c\d+$/.test(def)) opts.push([def, `Эта карточка (${+def.slice(1) + 1}-я по списку)`]);
    if (/^q\d+$/.test(def)) opts.push([def, `Этот вопрос теста (№${+def.slice(1) + 1})`]);
    l.sections.forEach((s, i) => opts.push([String(i), `${i + 1}. ${strip(s.title)}`]));
    opts.push(['r', '📌 Что запомнить']);
    if (FULL[l.id]) opts.push(['f', '🖼 Полная версия']);
    opts.push(['c', '🃏 Карточки'], ['q', '✅ Тест'], ['x', 'Другое']);
    pick = `<label class="bug-l" for="bugWhere">Где именно?</label><select id="bugWhere" class="bug-sel">${opts.map(([v, t]) => `<option value="${v}"${v === def ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  } else if (kind === 'X' && typeof EXAM !== 'undefined' && EXAM[id]){
    const it = examFind(id, code); BUG = { kind, id, code };
    where = `📝 ${EXAM[id].title} · ${code[0] === 't' ? 'вопрос ' + it.n : 'практика П' + it.n}: ${it.q}`;
  } else { BUG = { kind: 'G' }; where = '🦷 Сайт в целом'; }
  openSheet(`<h3>🐞 Нашёл ошибку?</h3>
    <p class="bug-p">Спасибо, что помогаешь! Сообщение уйдёт админу сайта в Telegram — он поправит.</p>
    <div class="os"><b>📍 ${esc(where)}</b>${pick}</div>
    <div class="os"><b>Как отправить</b><ol><li>Нажми кнопку ниже — откроется бот «Зубрёжки» в Telegram.</li><li>Нажми <b>«Старт»</b> (или «Запустить»).</li><li>Напиши одним сообщением, что не так и как правильно. Можно приложить скрин.</li></ol></div>
    <a id="bugGo" class="primary bug-go" target="_blank" rel="noopener" hidden>✈️ Открыть бота в Telegram</a>
    <div id="bugMiss" class="bug-miss" hidden>⏳ Бот ещё не подключён — пока напиши об ошибке в чат группы.</div>`);
  const sel = $('#bugWhere'); if (sel) sel.addEventListener('change', () => { BUG.code = sel.value; bugSyncLink(); });
  bugSyncLink();
  if (!botName) { const miss = $('#bugMiss'); if (miss){ miss.hidden = false; miss.textContent = '⏳ Ищу бота…'; }
    loadBotName().then(() => { const miss = $('#bugMiss'); if (miss) miss.textContent = '⏳ Бот ещё не подключён — пока напиши об ошибке в чат группы.'; bugSyncLink(); }); }
  else loadBotName().then(bugSyncLink);
}

/* ---------- routing ---------- */
function route(){
  closeSheet();
  const h = (location.hash||'').slice(1);
  let secIdx = null;
  if (pendingSec!=null){ secIdx = pendingSec; pendingSec = null; }
  if (h !== 'raspisanie') { schedDay = null; if (app.onclick) app.onclick = null; }
  // название вкладки — по разделу (его же видно в отчётах Метрики)
  const T = ' · Зубрёжка', sj = h.startsWith('s-') && SUBJ[h.slice(2)], ex = h.startsWith('exam-') && typeof EXAM !== 'undefined' && EXAM[h.slice(5)];
  document.title = h === 'otvet' ? 'Быстрый ответ' + T : h === 'raspisanie' ? 'Расписание' + T : sj ? sj.name + T
    : ex ? ex.title + T : (LEC[h] && !LEC[h].soon) ? `${LEC[h].subject.short} ${LEC[h].num}. ${LEC[h].title}` + T : 'Зубрёжка · С-201';
  if (h === 'otvet') viewQuick();
  else if (h === 'raspisanie' && typeof SCHEDULE !== 'undefined') viewSchedule();
  else if (h.startsWith('s-') && SUBJ[h.slice(2)]) viewSubject(SUBJ[h.slice(2)]);
  else if (h.startsWith('exam-') && typeof EXAM !== 'undefined' && EXAM[h.slice(5)] && SUBJ[h.slice(5)]) viewExam(SUBJ[h.slice(5)]);
  else if (LEC[h] && !LEC[h].soon) viewLecture(LEC[h], secIdx);
  else viewHome();
  if (secIdx==null || secIdx<0) window.scrollTo(0,0);
  if (pendingViewer){ const v = pendingViewer; pendingViewer = null; if (LEC[h] && FULL[h]) openViewer(...v); }
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
  const fb = e.target.closest('[data-full]');
  if (fb){ const [lid, dir, pg] = fb.dataset.full.split('|'); openFullAt(lid, dir, pg); return; }
  if (e.target.closest('[data-act="totop"]')){ window.scrollTo({top:0, behavior:'smooth'}); return; }
  const md = e.target.closest('[data-mode]');
  if (md){ noteMode = md.dataset.mode; store.set('noteMode', noteMode); const l = LEC[(location.hash||'').slice(1)]; if (l) renderNotes(l, $('#pane')); return; }
  const exm = e.target.closest('[data-exm]');
  if (exm){ const k = exm.dataset.key, sid = (location.hash||'').slice(6), it = examFind(sid, k); if (!it) return;
    EXM[k] = exm.dataset.exm; const d = exm.closest('.exq'); d.querySelectorAll('[data-exm]').forEach(b=>b.classList.toggle('on', b===exm)); d.querySelector('.ex-body').innerHTML = examBody(it, EXM[k]); return; }
  const exg = e.target.closest('[data-exg]');
  if (exg){ examMode = exg.dataset.exg; store.set('examMode', examMode); Object.keys(EXM).forEach(k=>delete EXM[k]);
    document.querySelectorAll('[data-exg]').forEach(b=>b.classList.toggle('on', b===exg));
    const sid = (location.hash||'').slice(6);
    document.querySelectorAll('.exq').forEach(d => { const it = examFind(sid, d.dataset.key); d.querySelectorAll('[data-exm]').forEach(b=>b.classList.toggle('on', b.dataset.exm===examMode)); d.querySelector('.ex-body').innerHTML = examBody(it, examMode); });
    toast(examMode==='full' ? '📖 Полные ответы' : '⚡ Краткие ответы'); return; }
  const ext = e.target.closest('[data-extab]');
  if (ext){ examTab = ext.dataset.extab; document.querySelectorAll('[data-extab]').forEach(b=>b.classList.toggle('on', b===ext)); renderExamList(SUBJ[(location.hash||'').slice(6)]); return; }
  const exk = e.target.closest('[data-exknow]');
  if (exk){ const sid = (location.hash||'').slice(6), k = exk.dataset.exknow, all = store.get('examKnown',{}); all[sid] = all[sid]||{}; all[sid][k] = !all[sid][k]; if (!all[sid][k]) delete all[sid][k]; store.set('examKnown', all);
    const on = !!all[sid][k], d = exk.closest('.exq'); d.classList.toggle('known', on); exk.classList.toggle('on', on); exk.textContent = on ? '✓ Знаю' : 'Отметить «знаю»'; d.querySelector('.ex-ok').textContent = on ? '✓' : '';
    const st = examStats(sid), stEl = $('#exStat'); if (stEl) stEl.innerHTML = `<div class="ee-prog light"><i style="width:${Math.round(st.known/st.all*100)}%"></i></div><small>Знаю ${st.known} из ${st.all}</small>`;
    if (on){ toast('✓ Отмечено'); if (examOnlyNew) setTimeout(()=>{ d.open = false; renderExamList(SUBJ[sid]); }, 350); } return; }
  const exa = e.target.closest('[data-exact]');
  if (exa){ const a = exa.dataset.exact, sid = (location.hash||'').slice(6);
    if (a==='open') document.querySelectorAll('.exq').forEach(d=>d.open=true);
    else if (a==='close') document.querySelectorAll('.exq').forEach(d=>d.open=false);
    else if (a==='new'){ examOnlyNew = !examOnlyNew; exa.classList.toggle('on', examOnlyNew); renderExamList(SUBJ[sid]); }
    else if (a==='pdf' || a==='pdf-short'){ const sh = a==='pdf-short'; openFile(`pdf/exam-${sid}${sh?'-short':''}.pdf`, `${EXAM[sid].title}${sh?' — кратко':''}.pdf`); }
    return; }
  const tb = e.target.closest('[data-tts]');
  if (tb){ ttsCmd(tb.dataset.tts); return; }
  const sy = e.target.closest('[data-say]');
  if (sy){ const x = SAY[+sy.dataset.say]; if (x) ttsStart(x.parts, x.title); return; }
  const sx = e.target.closest('[data-sayex]');
  if (sx){ const k = sx.dataset.sayex, sid = (location.hash||'').slice(6), it = examFind(sid, k); if (!it) return;
    const full = (EXM[k] || examMode) === 'full';
    ttsStart(full ? it.full.map(blockText) : it.short, (k[0]==='t' ? 'Вопрос ' + it.n : 'Практика ' + it.n) + (full ? ' · полный' : ' · кратко')); return; }
  const bg = e.target.closest('[data-bug]');
  if (bg){ e.preventDefault(); openBug(bg.dataset.bug); return; }
  if (e.target.closest('#bugGo')){ setTimeout(closeSheet, 400); return; }
  const tf = e.target.closest('[data-tfile]');
  if (tf){ const [u, n] = tf.dataset.tfile.split('|'); openFile(u, n); return; }
  const exo = e.target.closest('[data-exopen]');
  if (exo){ pendingExam = exo.dataset.exopen.split('|')[1]; examQ = ''; const sid = exo.dataset.exopen.split('|')[0]; examTab = pendingExam[0]==='t' ? 'theory' : 'practice'; go('exam-'+sid); return; }
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
  if (act==='joke'){ const el = t.querySelector('.jk-t'); t.classList.remove('jk-roll'); void t.offsetWidth; t.classList.add('jk-roll'); setTimeout(() => { el.textContent = nextHomeJoke(); }, 160); return; }
  if (act==='theme'){ const t = curTheme() === 'dark' ? 'light' : 'dark'; store.set('theme', t); applyTheme(t, true); toast(t === 'dark' ? '🌙 Ночной режим' : '☀️ Дневной режим'); return; }
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
window.__printableFull = id => printableFull(LEC[id]);
window.__lec = id => LEC[id]; window.__blockHTML = b => blockHTML(b);
window.__printableExam = (sid, mode) => printableExam(sid, mode||'full');
window.__ask = (q,s) => answerSearch(q,s||'').map(r=>[r.sc.toFixed(2), r.it.l.id, r.it.kind, r.it.q]);
if (!window.claude && 'serviceWorker' in navigator && location.protocol==='https:'){
  // новая версия сайта: как только свежий service worker взял управление — один раз перезагружаемся
  const hadSW = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW && !reloaded){ reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).then(r => {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState==='visible') r.update().catch(()=>{}); });
  }).catch(()=>{});
}
route();
setTimeout(loadFT, 2500);
if (typeof SCHEDULE !== 'undefined') loadHW();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && typeof SCHEDULE !== 'undefined') loadHW(); });
})();
