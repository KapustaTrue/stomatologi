// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 5: взаимодействие генов и свойства генов (собственные схемы) =====
Object.assign(SVG_EXTRA, (() => {
  const F = 'font-family="Golos Text,Inter,Segoe UI,Arial,sans-serif"';
  const P = '#7b61d6', INK = '#46309a', SOFT = '#f0ecff', PINK = '#e0527a', GREEN = '#3f9e5c', AMB = '#e0a000', GR = '#9aa0ad', TX = '#1d2030', MUT = '#6a6f82';
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" ${F} font-size="13" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="18" fill="#fff"/>${body}</svg>`;
  const t = (x, y, s, o = '') => `<text x="${x}" y="${y}" ${o}>${s}</text>`;
  const tc = (x, y, s, o = '') => t(x, y, s, `text-anchor="middle" ${o}`);
  const sup = s => `<tspan baseline-shift="super" font-size="70%">${s}</tspan>`;
  const sub = s => `<tspan baseline-shift="sub" font-size="70%">${s}</tspan>`;
  const box = (x, y, w, h, fill, stroke, rx = 12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
  const arrow = (x1, y1, x2, y2, c = GR) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 8; const p1 = [x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45)], p2 = [x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)];
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="2" fill="none"/><path d="M${x2} ${y2} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z" fill="${c}"/>`; };
  const ok = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${GREEN}"/><path d="M${x - 5} ${y} l3.5 3.5 l6.5 -7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const no = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${PINK}"/><path d="M${x - 4.5} ${y - 4.5} l9 9 M${x + 4.5} ${y - 4.5} l-9 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  // эритроцит: диск с вдавлением
  const rbc = (x, y, r = 16, c = '#d8434f') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r * .45}" fill="#fff" opacity=".28"/>`;
  const sickle = (x, y, c = '#b8323d') => `<path d="M${x - 14} ${y + 9} Q${x - 6} ${y - 20} ${x + 14} ${y - 9} Q${x - 1} ${y - 7} ${x - 14} ${y + 9}Z" fill="${c}"/>`;
  const person = (x, y, fill, stroke) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/><path d="M${x - 7} ${y + 17} v-5 q0 -5.5 7 -5.5 q7 0 7 5.5 v5z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
  // кисть: пальцы + большой палец; extra — шестой палец, bump — кожный вырост
  const hand = (x, y, extra, bump, c = '#f3c9a8', s = '#b9805a') => {
    let g = '';
    const fing = [[0, 30], [11, 36], [22, 34], [33, 27]];
    fing.forEach(([dx, h]) => { g += `<rect x="${x + dx}" y="${y - h + 6}" width="9" height="${h}" rx="4.5" fill="${c}" stroke="${s}" stroke-width="1.3"/>`; });
    if (extra) g += `<rect x="${x + 44}" y="${y - 12}" width="8" height="22" rx="4" fill="${c}" stroke="${PINK}" stroke-width="2"/>`;
    g += `<rect x="${x - 2}" y="${y}" width="46" height="46" rx="12" fill="${c}" stroke="${s}" stroke-width="1.3"/>`;
    g += `<rect x="${x - 16}" y="${y + 12}" width="22" height="9" rx="4.5" transform="rotate(-35 ${x - 5} ${y + 16})" fill="${c}" stroke="${s}" stroke-width="1.3"/>`;
    if (bump) g += `<circle cx="${x + 46}" cy="${y + 8}" r="4.5" fill="${c}" stroke="${PINK}" stroke-width="2"/>`;
    return g;
  };
  const S = {};

  // 1. Карта темы
  S.g5_map = (() => {
    let b = box(210, 14, 300, 40, P, P, 14) + tc(360, 39, 'Взаимодействие генов и свойства генов', `fill="#fff" font-weight="700" font-size="14"`);
    const cols = [
      [16, 'Аллельные гены', 'одна пара, один локус', ['Полное доминирование', 'Неполное доминирование', 'Кодоминирование', 'Сверхдоминирование'], P],
      [250, 'Неаллельные гены', 'разные локусы / хромосомы', ['Комплементарность', 'Эпистаз', 'Полимерия'], PINK],
      [484, 'Свойства генов', 'как проявляется ген', ['Плейотропия', 'Пенетрантность', 'Экспрессивность'], GREEN],
    ];
    cols.forEach(([x, h, s, items, c]) => {
      b += `<path d="M360 54 V70 H${x + 110} V84" stroke="${GR}" stroke-width="2" fill="none"/>`;
      b += box(x, 84, 220, 50, '#fff', c) + tc(x + 110, 105, h, `font-weight="700" fill="${c}" font-size="14"`) + tc(x + 110, 124, s, `fill="${MUT}" font-size="11.5"`);
      items.forEach((it, i) => { b += box(x + 14, 146 + i * 38, 192, 30, '#f7f6fb', '#e6e4ef', 9) + tc(x + 110, 166 + i * 38, it, `fill="${TX}"`); });
    });
    return svg(720, 310, b);
  })();

  // 2. Четыре типа взаимодействия аллельных генов: как выглядит гетерозигота
  S.g5_dom4 = (() => {
    let b = '';
    const cols = [
      ['Полное', 'доминирование', 'Aa = AA'],
      ['Неполное', 'доминирование', 'Aa — середина'],
      ['Кодоминирование', '', 'Aa — оба сразу'],
      ['Сверх-', 'доминирование', 'Aa сильнее всех'],
    ];
    cols.forEach(([h1, h2, cap], i) => {
      const x = 14 + i * 176;
      b += box(x, 12, 164, 236, i === 3 ? '#fff' : '#fff', '#e6e4ef', 14);
      b += tc(x + 82, 36, h1, `font-weight="700" fill="${INK}" font-size="14"`) + tc(x + 82, 54, h2, `font-weight="700" fill="${INK}" font-size="14"`);
      const labs = i === 2 ? [`I${sup('A')}I${sup('A')}`, `I${sup('A')}I${sup('B')}`, `I${sup('B')}I${sup('B')}`] : ['AA', 'Aa', 'aa'];
      [0, 1, 2].forEach(k => {
        const cy = 92 + k * 46, cx = x + 52;
        let shape;
        if (i === 0) shape = `<circle cx="${cx}" cy="${cy}" r="17" fill="${k < 2 ? '#d8434f' : '#fff'}" stroke="${k < 2 ? '#d8434f' : GR}" stroke-width="2"/>`;
        else if (i === 1) shape = `<circle cx="${cx}" cy="${cy}" r="17" fill="${['#d8434f', '#f2a0b0', '#fff'][k]}" stroke="${['#d8434f', '#e77d93', GR][k]}" stroke-width="2"/>`;
        else if (i === 2) shape = k === 1 ? `<path d="M${cx} ${cy - 17} A17 17 0 0 0 ${cx} ${cy + 17}Z" fill="${AMB}"/><path d="M${cx} ${cy - 17} A17 17 0 0 1 ${cx} ${cy + 17}Z" fill="#4f7fd6"/><circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="${INK}" stroke-width="2"/>`
          : `<circle cx="${cx}" cy="${cy}" r="17" fill="${k === 0 ? AMB : '#4f7fd6'}"/>`;
        else { const r = [15, 21, 10][k]; shape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${k === 1 ? GREEN : '#9fcfae'}"/>`; if (k === 1) shape += `<path d="M${cx} ${cy - 9} l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8z" fill="#fff"/>`; }
        b += shape + t(x + 84, cy + 5, labs[k], `font-weight="700" fill="${TX}" font-size="15"`);
      });
      b += `<rect x="${x + 12}" y="${214}" width="140" height="24" rx="8" fill="${SOFT}"/>` + tc(x + 82, 231, cap, `fill="${INK}" font-weight="700" font-size="12.5"`);
    });
    return svg(720, 260, b);
  })();

  // 3. Талассемия — неполное доминирование в медицине
  S.g5_thal = (() => {
    let b = tc(330, 30, 'Талассемия: у гетерозиготы — промежуточная (лёгкая) форма', `font-weight="700" fill="${INK}" font-size="14"`);
    const d = [['AA', 'здоровы', 0, GREEN, 5, false], ['Aa', 'лёгкая (минорная) форма', .4, AMB, 4, true], ['aa', 'тяжёлая форма,|гибель в детстве', 1, PINK, 3, true]];
    d.forEach(([g, s, sev, c, n, pale], i) => {
      const x = 16 + i * 212;
      b += box(x, 46, 200, 158, '#fff', c, 14) + tc(x + 100, 76, g, `font-weight="800" font-size="20" fill="${TX}"`);
      for (let k = 0; k < 5; k++) { const px = x + 36 + k * 32, py = 106; if (k < n) b += rbc(px, py, pale && k >= n - (i === 2 ? 3 : 1) ? 9 : 12, pale && k >= n - (i === 2 ? 3 : 1) ? '#f0a3aa' : '#d8434f'); }
      s.split('|').forEach((l, j, a) => { b += tc(x + 100, (a.length > 1 ? 138 : 146) + j * 16, l, `fill="${TX}" font-size="12.5"`); });
      b += `<rect x="${x + 24}" y="164" width="152" height="12" rx="6" fill="#eeedf3"/><rect x="${x + 24}" y="164" width="${Math.max(6, 152 * sev)}" height="12" rx="6" fill="${c}"/>`;
      b += tc(x + 100, 194, 'тяжесть болезни', `fill="${MUT}" font-size="11"`);
    });
    return svg(660, 216, b);
  })();

  // 4. Сверхдоминирование: серповидноклеточная анемия и малярия
  S.g5_sickle = (() => {
    let b = tc(350, 30, 'Серповидноклеточная анемия и тропическая малярия', `font-weight="700" fill="${INK}" font-size="14"`);
    const d = [
      ['AA', ['нет анемии,', 'но нет и защиты', 'от тропической малярии'], GR, 0],
      ['Aa', ['нет тяжёлой анемии', '+ устойчивость', 'к тропической малярии'], GREEN, 1],
      ['aa', ['тяжёлая форма', 'малокровия', '(серповидные эритроциты)'], PINK, 2],
    ];
    d.forEach(([g, lines, c, i]) => {
      const x = 16 + i * 228;
      b += box(x, 46, 212, 214, i === 1 ? '#eef8f1' : '#fff', c, 14);
      if (i === 1) b += `<rect x="${x + 46}" y="36" width="120" height="22" rx="11" fill="${GREEN}"/>` + tc(x + 106, 52, 'преимущество', `fill="#fff" font-weight="700" font-size="12"`);
      b += tc(x + 106, 84, g, `font-weight="800" font-size="20" fill="${TX}"`);
      const cells = i === 0 ? ['r', 'r', 'r', 'r'] : i === 1 ? ['r', 'r', 's', 'r'] : ['s', 's', 's', 's'];
      cells.forEach((k, j) => { const px = x + 52 + j * 36, py = 120; b += k === 'r' ? rbc(px, py, 14) : sickle(px, py + 2); });
      lines.forEach((l, j) => { b += tc(x + 106, 170 + j * 19, l, `fill="${TX}" font-size="12.5" ${j === 1 && i === 1 ? 'font-weight="700"' : ''}`); });
    });
    return svg(700, 272, b);
  })();

  // 5. Комплементарность: наследование нормального слуха
  S.g5_hearing = (() => {
    let b = tc(350, 28, 'Комплементарность: чтобы слышать, нужны ОБА доминантных гена', `font-weight="700" fill="${INK}" font-size="14"`);
    b += box(16, 48, 150, 46, SOFT, P) + tc(91, 69, 'ген A', `font-weight="800" fill="${INK}" font-size="15"`) + tc(91, 86, 'развитие улитки', `fill="${TX}" font-size="12"`);
    b += box(16, 108, 150, 46, '#fdecef', PINK) + tc(91, 129, 'ген B', `font-weight="800" fill="${PINK}" font-size="15"`) + tc(91, 146, 'слуховой нерв', `fill="${TX}" font-size="12"`);
    b += arrow(168, 71, 214, 96) + arrow(168, 131, 214, 108);
    b += box(218, 76, 116, 52, '#eef8f1', GREEN) + tc(276, 99, 'A + B', `font-weight="800" fill="${GREEN}" font-size="15"`) + tc(276, 117, '= слух есть', `fill="${TX}" font-size="12"`);
    const r = [[`A_B_`, 'слышит', true, 'улитка + нерв'], ['A_bb', 'глухой', false, 'нет слухового нерва'], ['aaB_', 'глухой', false, 'нет улитки'], ['aabb', 'глухой', false, 'нет ни того, ни другого']];
    r.forEach(([g, s, good, why], i) => {
      const y = 48 + i * 40;
      b += box(356, y, 328, 32, good ? '#eef8f1' : '#fff', good ? GREEN : '#e6e4ef', 9);
      b += (good ? ok(376, y + 16) : no(376, y + 16)) + t(396, y + 21, g, `font-weight="800" fill="${TX}" font-size="14"`) + t(452, y + 21, s, `font-weight="700" fill="${good ? GREEN : PINK}"`) + t(518, y + 21, why, `fill="${MUT}" font-size="12"`);
    });
    b += tc(350, 228, 'Глухие родители aaBB × AAbb могут родить ребёнка AaBb с нормальным слухом', `fill="${MUT}" font-size="12"`);
    return svg(700, 244, b);
  })();

  // 6. Бомбейский феномен (рецессивный эпистаз)
  S.g5_bombay = (() => {
    let b = tc(360, 28, '«Бомбейский феномен»: hh не даёт закрепиться антигенам A и B', `font-weight="700" fill="${INK}" font-size="14"`);
    const row = (y, hh) => {
      let g = t(16, y + 30, hh ? 'hh' : 'H_', `font-weight="800" font-size="18" fill="${hh ? PINK : GREEN}"`);
      g += box(62, y, 128, 50, '#f7f6fb', '#e6e4ef') + tc(126, y + 22, 'вещество-', `fill="${TX}" font-size="12"`) + tc(126, y + 38, 'предшественник', `fill="${TX}" font-size="12"`);
      if (!hh) g += arrow(192, y + 25, 236, y + 25, GREEN) + tc(214, y + 17, 'H', `font-weight="800" fill="${GREEN}"`);
      else g += `<path d="M192 ${y + 25} H236" stroke="${GR}" stroke-width="2" stroke-dasharray="4 4"/>` + no(214, y + 25);
      g += box(240, y, 128, 50, hh ? '#fff' : SOFT, hh ? '#e6e4ef' : P) + tc(304, y + 22, hh ? 'основы' : 'основа для', `fill="${hh ? GR : TX}" font-size="12"`) + tc(304, y + 38, hh ? 'нет' : 'антигенов', `fill="${hh ? GR : TX}" font-size="12"`);
      g += (hh ? `<path d="M370 ${y + 25} H414" stroke="${GR}" stroke-width="2" stroke-dasharray="4 4"/>` : arrow(370, y + 25, 414, y + 25, P)) + `<text x="392" y="${y + 17}" text-anchor="middle" font-size="11" font-weight="700" fill="${hh ? GR : INK}">I${sup('A')}I${sup('B')}</text>`;
      const cx = 456, cy = y + 25;
      g += rbc(cx, cy, 18);
      if (!hh) { g += `<path d="M${cx - 6} ${cy - 20} l6 -11 l6 11z" fill="${AMB}"/><path d="M${cx + 14} ${cy + 10} l11 6 l-11 6z" fill="${AMB}"/><circle cx="${cx + 23}" cy="${cy - 9}" r="5" fill="#4f7fd6"/><circle cx="${cx - 22}" cy="${cy + 10}" r="5" fill="#4f7fd6"/>`; }
      g += t(492, y + 20, hh ? 'антигенов нет' : 'антигены A и B', `font-weight="700" fill="${TX}"`) + t(492, y + 38, hh ? '→ по фенотипу I группа' : '→ IV группа', `fill="${hh ? PINK : GREEN}" font-weight="700"`);
      return g;
    };
    b += row(48, false) + row(118, true);
    b += tc(360, 196, `Гены IV группы (I${sup('A')}I${sup('B')}) у человека есть, но «прикрепить» антигены к мембране эритроцита не на что`, `fill="${MUT}" font-size="12"`);
    return svg(720, 212, b);
  })();

  // 7. Генетический радикал 9:3:3:1 и как объединяются группы
  S.g5_radical = (() => {
    const gam = ['AB', 'Ab', 'aB', 'ab'];
    const col = { AB: P, Ab: PINK, aB: AMB, ab: GR };
    let b = tc(140, 26, 'AaBb × AaBb: 16 сочетаний', `font-weight="700" fill="${INK}" font-size="13.5"`);
    gam.forEach((g, i) => { b += tc(70 + i * 46, 48, g, `font-weight="700" fill="${MUT}" font-size="12"`); b += t(10, 80 + i * 46, g, `font-weight="700" fill="${MUT}" font-size="12"`); });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const g1 = gam[r], g2 = gam[c];
      const A = (g1[0] === 'A' || g2[0] === 'A'), B = (g1[1] === 'B' || g2[1] === 'B');
      const k = (A ? 'A' : 'a') + (B ? 'B' : 'b');
      const x = 48 + c * 46, y = 56 + r * 46;
      b += `<rect x="${x}" y="${y}" width="42" height="42" rx="8" fill="${col[k]}"/>`;
      const geno = (g1[0] + g2[0]).split('').sort().join('') + (g1[1] + g2[1]).split('').sort().join('');
      b += tc(x + 21, y + 26, geno, `fill="#fff" font-weight="700" font-size="11"`);
    }
    const leg = [['A_B_', '9', P], ['A_bb', '3', PINK], ['aaB_', '3', AMB], ['aabb', '1', GR]];
    leg.forEach(([g, n, c], i) => { b += `<rect x="${48 + i * 62}" y="252" width="14" height="14" rx="4" fill="${c}"/>` + t(66 + i * 62, 264, `${g} ${n}`, `fill="${TX}" font-size="11.5" font-weight="700"`); });
    b += tc(140, 292, 'генетический радикал 9 : 3 : 3 : 1', `fill="${MUT}" font-size="12"`);
    // справа: варианты расщепления
    b += t(272, 26, 'Как группы объединяются в фенотипы (F₂)', `font-weight="700" fill="${INK}" font-size="13.5"`);
    const rows = [
      ['9 : 3 : 3 : 1', [9, 3, 3, 1], 'комплементарность (4 разных)'],
      ['9 : 7', [9, 7], 'комплементарность или рецессивный эпистаз'],
      ['9 : 6 : 1', [9, 6, 1], 'комплементарность'],
      ['12 : 3 : 1', [12, 3, 1], 'доминантный эпистаз'],
      ['13 : 3', [13, 3], 'доминантный эпистаз'],
      ['9 : 3 : 4', [9, 3, 4], 'рецессивный эпистаз'],
      ['15 : 1', [15, 1], 'некумулятивная полимерия'],
      ['1 : 4 : 6 : 4 : 1', [1, 4, 6, 4, 1], 'кумулятивная полимерия'],
    ];
    const pal = ['#7b61d6', '#e0527a', '#e0a000', '#9aa0ad', '#3f9e5c'];
    const polyPal = ['#fbe9ec', '#f2b8c3', '#e77d93', '#c9405e', '#8e1d3a'];
    rows.forEach(([lab, parts, name], i) => {
      const y = 40 + i * 32, x0 = 272, W = 176;
      let x = x0;
      parts.forEach((n, j) => { const w = W * n / 16; const c = i === 7 ? polyPal[j] : pal[j]; b += `<rect x="${x.toFixed(1)}" y="${y}" width="${(w - 1.5).toFixed(1)}" height="22" rx="5" fill="${c}"/>`; if (w > 14) b += tc((x + w / 2).toFixed(1), y + 15.5, n, `fill="${i === 7 && j < 2 ? INK : '#fff'}" font-size="11" font-weight="700"`); x += w; });
      b += t(x0 + W + 10, y + 15.5, lab, `font-weight="800" fill="${TX}" font-size="12.5"`) + t(x0 + W + 108, y + 15.5, name, `fill="${MUT}" font-size="11.5"`);
    });
    return svg(810, 306, b);
  })();

  // 8. Кумулятивная полимерия: чем больше доминантных аллелей, тем ярче
  S.g5_polyscale = (() => {
    let b = tc(350, 28, 'Кумулятивная полимерия: окраска зерна пшеницы (A₁a₁A₂a₂ × A₁a₁A₂a₂)', `font-weight="700" fill="${INK}" font-size="14"`);
    const d = [[0, 1, 'белое', '#f6efe6', `a${sub('1')}a${sub('1')}a${sub('2')}a${sub('2')}`], [1, 4, 'светло-розовое', '#f2c4cb', ''], [2, 6, 'розовое', '#e48b9b', ''], [3, 4, 'красное', '#c63d4f', ''], [4, 1, 'тёмно-красное', '#8c1d2c', `A${sub('1')}A${sub('1')}A${sub('2')}A${sub('2')}`]];
    d.forEach(([n, cnt, name, c, g], i) => {
      const x = 30 + i * 132;
      const h = cnt * 16;
      b += `<rect x="${x + 26}" y="${150 - h}" width="64" height="${h}" rx="6" fill="${c}" stroke="${n === 0 ? '#d8cfc2' : 'none'}"/>`;
      b += tc(x + 58, 144 - h, `${cnt}/16`, `font-weight="800" fill="${TX}" font-size="13"`);
      b += `<ellipse cx="${x + 58}" cy="176" rx="26" ry="12" fill="${c}" stroke="${n === 0 ? '#d8cfc2' : 'none'}" transform="rotate(-12 ${x + 58} 176)"/>`;
      b += tc(x + 58, 206, name, `fill="${TX}" font-size="12.5"`) + tc(x + 58, 224, `доминантных: ${n}`, `fill="${MUT}" font-size="11.5"`);
      if (g) b += tc(x + 58, 242, g, `fill="${INK}" font-size="12" font-weight="700"`);
    });
    return svg(700, 254, b);
  })();

  // 9. Плейотропия: синдром Марфана
  S.g5_pleio = (() => {
    let b = tc(350, 28, 'Плейотропия: один ген — сразу несколько разных признаков', `font-weight="700" fill="${INK}" font-size="14"`);
    b += `<circle cx="140" cy="148" r="70" fill="${SOFT}" stroke="${P}" stroke-width="2"/>` + tc(140, 132, '1 ген', `font-weight="800" fill="${INK}" font-size="18"`) + tc(140, 154, '↓', `fill="${INK}" font-size="16"`) + tc(140, 176, 'белок фибриллин', `fill="${TX}" font-size="12.5" font-weight="700"`);
    b += tc(140, 238, 'синдром Марфана', `fill="${PINK}" font-weight="700" font-size="13"`);
    const items = [
      [62, 'Глаза', 'вывих хрусталика', 'eye'],
      [138, 'Скелет', 'очень высокий рост, «паучьи пальцы»', 'bone'],
      [214, 'Сердце и сосуды', 'аневризма аорты → разрыв', 'heart'],
    ];
    items.forEach(([y, h, s, ic]) => {
      b += arrow(212, 148, 300, y + 2, P);
      b += box(306, y - 26, 378, 56, '#fff', '#e6e4ef');
      const cx = 336, cy = y + 2;
      if (ic === 'eye') b += `<path d="M${cx - 18} ${cy} Q${cx} ${cy - 16} ${cx + 18} ${cy} Q${cx} ${cy + 16} ${cx - 18} ${cy}Z" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="6.5" fill="${P}"/><circle cx="${cx + 3}" cy="${cy - 3}" r="2.5" fill="#fff"/>`;
      if (ic === 'bone') b += `<g transform="rotate(-35 ${cx} ${cy})"><rect x="${cx - 13}" y="${cy - 3.5}" width="26" height="7" rx="3" fill="#efe6d6" stroke="#a89470" stroke-width="1.5"/><circle cx="${cx - 15}" cy="${cy - 4}" r="4.5" fill="#efe6d6" stroke="#a89470" stroke-width="1.5"/><circle cx="${cx - 15}" cy="${cy + 4}" r="4.5" fill="#efe6d6" stroke="#a89470" stroke-width="1.5"/><circle cx="${cx + 15}" cy="${cy - 4}" r="4.5" fill="#efe6d6" stroke="#a89470" stroke-width="1.5"/><circle cx="${cx + 15}" cy="${cy + 4}" r="4.5" fill="#efe6d6" stroke="#a89470" stroke-width="1.5"/></g>`;
      if (ic === 'heart') b += `<path d="M${cx} ${cy + 15} C${cx - 26} ${cy - 2} ${cx - 14} ${cy - 22} ${cx} ${cy - 9} C${cx + 14} ${cy - 22} ${cx + 26} ${cy - 2} ${cx} ${cy + 15}Z" fill="${PINK}"/>`;
      b += t(366, y - 2, h, `font-weight="800" fill="${TX}" font-size="14"`) + t(366, y + 17, s, `fill="${MUT}" font-size="12.5"`);
    });
    return svg(700, 256, b);
  })();

  // 10. Пенетрантность: отосклероз ~40%
  S.g5_penet = (() => {
    let b = tc(350, 28, 'Отосклероз: пенетрантность около 40% — из 100 носителей гена', `font-weight="700" fill="${INK}" font-size="14"`);
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 20), c = i % 20, x = 60 + c * 29, y = 48 + r * 30;
      const sick = (c + r * 3) % 5 < 2; // ровно 40 из 100, вперемешку
      b += person(x, y, sick ? PINK : '#fff', sick ? PINK : P);
    }
    b += `<circle cx="150" cy="218" r="7" fill="${PINK}"/>` + t(164, 223, '40 — реально оглохнут', `font-weight="700" fill="${TX}"`);
    b += `<circle cx="380" cy="218" r="7" fill="#fff" stroke="${P}" stroke-width="1.6"/>` + t(394, 223, '60 — здоровы, но могут передать ген детям', `font-weight="700" fill="${TX}"`);
    return svg(700, 240, b);
  })();

  // 11. Экспрессивность: полидактилия в одной семье
  S.g5_express = (() => {
    let b = tc(350, 28, 'Экспрессивность: генотип один — тяжесть разная (полидактилия в семье)', `font-weight="700" fill="${INK}" font-size="14"`);
    const d = [
      ['Брат 1', ['шесть пальцев', 'на руках и ногах'], 1, true, false],
      ['Брат 2', ['шесть пальцев', 'только на руках'], .62, true, false],
      ['Отец', ['небольшой кожный вырост', 'около мизинца'], .22, false, true],
    ];
    d.forEach(([who, lines, sev, ex, bump], i) => {
      const x = 16 + i * 228;
      b += box(x, 44, 212, 200, '#fff', '#e6e4ef', 14) + tc(x + 106, 68, who, `font-weight="800" fill="${INK}" font-size="15"`);
      b += hand(x + 82, 116, ex, bump);
      lines.forEach((l, j) => { b += tc(x + 106, 190 + j * 17, l, `fill="${TX}" font-size="12.5"`); });
      b += `<rect x="${x + 30}" y="${222}" width="152" height="10" rx="5" fill="#eeedf3"/><rect x="${x + 30}" y="222" width="${152 * sev}" height="10" rx="5" fill="${PINK}"/>`;
    });
    return svg(700, 256, b);
  })();

  return S;
})());
