// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 6: хромосомная теория, сцепление, кроссинговер (собственные схемы) =====
Object.assign(SVG_EXTRA, (() => {
  const F = 'font-family="Golos Text,Inter,Segoe UI,Arial,sans-serif"';
  const P = '#7b61d6', INK = '#46309a', SOFT = '#f0ecff', PINK = '#e0527a', GREEN = '#3f9e5c', AMB = '#e0a000', GR = '#9aa0ad', TX = '#1d2030', MUT = '#6a6f82';
  const BL = '#4f7fd6', RD = '#d8434f';
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" ${F} font-size="13" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="18" fill="#fff"/>${body}</svg>`;
  const t = (x, y, s, o = '') => `<text x="${x}" y="${y}" ${o}>${s}</text>`;
  const tc = (x, y, s, o = '') => t(x, y, s, `text-anchor="middle" ${o}`);
  const box = (x, y, w, h, fill, stroke, rx = 12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
  const arrow = (x1, y1, x2, y2, c = GR) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 8; const p1 = [x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45)], p2 = [x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)];
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="2" fill="none"/><path d="M${x2} ${y2} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z" fill="${c}"/>`; };
  // хроматида: верх цвета c1 до точки split, низ — c2
  const chr = (x, y, h, c1, c2 = c1, split = .5, w = 14) => {
    const m = y + h * split;
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${c1}"/>`;
    if (c2 !== c1) g += `<rect x="${x}" y="${m}" width="${w}" height="${y + h - m}" rx="${w / 2}" fill="${c2}"/><rect x="${x}" y="${m}" width="${w}" height="${w / 2}" fill="${c2}"/>`;
    return g;
  };
  const gene = (x, y, lab, side = 1, w = 14) => `<rect x="${x - 1}" y="${y - 2}" width="${w + 2}" height="4" fill="#fff" opacity=".9"/>` + t(side > 0 ? x + w + 5 : x - 5, y + 4.5, lab, `font-weight="800" font-size="13" fill="${TX}" ${side > 0 ? '' : 'text-anchor="end"'}`);
  const gam = (x, y, lab, c = SOFT, s = P) => `<circle cx="${x}" cy="${y}" r="17" fill="${c}" stroke="${s}" stroke-width="1.6"/>` + tc(x, y + 4.5, lab, `font-weight="800" fill="${TX}" font-size="12.5"`);
  const S = {};

  // 1. Независимое и сцепленное наследование
  S.g6_mvm = (() => {
    let b = '';
    b += box(12, 12, 340, 236, '#fff', '#e6e4ef', 14) + tc(182, 36, 'Гены в РАЗНЫХ хромосомах', `font-weight="800" fill="${INK}" font-size="14"`);
    // две пары
    b += chr(52, 54, 80, BL) + chr(74, 54, 80, RD) + gene(52, 86, 'A', -1) + gene(74, 86, 'a');
    b += chr(150, 64, 60, BL) + chr(172, 64, 60, RD) + gene(150, 94, 'B', -1) + gene(172, 94, 'b');
    b += tc(118, 154, 'две разные пары хромосом', `fill="${MUT}" font-size="11.5"`);
    b += arrow(218, 96, 246, 96);
    ['AB', 'Ab', 'aB', 'ab'].forEach((g, i) => { b += gam(272 + (i % 2) * 40, 74 + Math.floor(i / 2) * 42, g); });
    b += tc(182, 184, '4 типа гамет поровну →', `fill="${TX}" font-size="12.5"`) + tc(182, 202, 'признаки наследуются независимо', `fill="${TX}" font-size="12.5" font-weight="700"`) + tc(182, 222, '(III закон Менделя)', `fill="${MUT}" font-size="12"`);
    b += box(368, 12, 340, 236, '#fff', P, 14) + tc(538, 36, 'Гены в ОДНОЙ хромосоме', `font-weight="800" fill="${INK}" font-size="14"`);
    b += chr(444, 52, 100, BL) + chr(466, 52, 100, RD) + gene(444, 74, 'A', -1) + gene(444, 128, 'B', -1) + gene(466, 74, 'a') + gene(466, 128, 'b');
    b += tc(462, 170, 'одна пара гомологов', `fill="${MUT}" font-size="11.5"`);
    b += arrow(530, 102, 560, 102);
    b += gam(596, 80, 'AB', '#e6eefc', BL) + gam(596, 124, 'ab', '#fdecef', RD);
    b += tc(650, 84, 'чаще', `fill="${MUT}" font-size="11"`) + tc(650, 128, 'всего', `fill="${MUT}" font-size="11"`);
    b += tc(538, 202, 'гены передаются вместе — сцепленно', `fill="${TX}" font-size="12.5" font-weight="700"`) + tc(538, 222, '(закон Моргана)', `fill="${MUT}" font-size="12"`);
    return svg(720, 260, b);
  })();

  // 2. Группы сцепления у человека
  S.g6_groups = (() => {
    let b = tc(360, 30, 'Число групп сцепления = гаплоидный набор хромосом (n). У человека — 23', `font-weight="700" fill="${INK}" font-size="14"`);
    b += box(16, 46, 688, 92, '#fff', '#e6e4ef', 14) + t(32, 68, '22 аутосомные группы — одинаковы у мужчин и женщин', `font-weight="700" fill="${TX}"`);
    for (let i = 0; i < 22; i++) { const h = 50 - i * 1.5, x = 40 + i * 30; b += chr(x, 128 - h, h, P, P, .5, 12) + tc(x + 6, 132 + 0, '', ''); b += `<rect x="${x}" y="${128 - h * .62}" width="12" height="3" fill="#fff" opacity=".8"/>`; }
    b += box(16, 152, 336, 96, '#fff', PINK, 14) + t(32, 176, 'Женщины: XX', `font-weight="800" fill="${PINK}" font-size="14"`);
    b += chr(60, 188, 48, PINK, PINK, .5, 13) + chr(82, 188, 48, PINK, PINK, .5, 13) + t(110, 210, 'две X-хромосомы —', `fill="${TX}" font-size="12.5"`) + t(110, 228, 'ОДИНАКОВАЯ группа сцепления', `fill="${TX}" font-size="12.5" font-weight="700"`);
    b += box(368, 152, 336, 96, '#fff', BL, 14) + t(384, 176, 'Мужчины: XY', `font-weight="800" fill="${BL}" font-size="14"`);
    b += chr(412, 188, 48, PINK, PINK, .5, 13) + chr(434, 206, 26, BL, BL, .5, 13) + t(462, 210, 'X и Y —', `fill="${TX}" font-size="12.5"`) + t(462, 228, 'ДВЕ РАЗНЫЕ группы сцепления', `fill="${TX}" font-size="12.5" font-weight="700"`);
    return svg(720, 262, b);
  })();

  // 3. Кроссинговер по шагам
  S.g6_cross = (() => {
    let b = '';
    const heads = ['1. Гомологи', '2. Конъюгация,', '3. Обмен', '4. Гаметы'];
    const subs = ['(по 2 хроматиды)', 'перекрест (хиазма)', 'участками', ''];
    heads.forEach((h, i) => { const cx = 92 + i * 180; b += tc(cx, 28, h, `font-weight="800" fill="${INK}" font-size="13.5"`) + tc(cx, 45, subs[i], `fill="${MUT}" font-size="11.5"`); if (i < 3) b += arrow(cx + 62, 140, cx + 112, 140); });
    const Y = 62, H = 150;
    // 1
    b += chr(46, Y, H, BL) + chr(64, Y, H, BL) + chr(108, Y, H, RD) + chr(126, Y, H, RD);
    b += gene(46, Y + 34, 'A', -1) + gene(46, Y + 116, 'B', -1) + gene(126, Y + 34, 'a') + gene(126, Y + 116, 'b');
    // 2: внутренние хроматиды перекрещиваются
    const x0 = 236;
    b += chr(x0, Y, H, BL) + chr(x0 + 70, Y, H, RD);
    b += `<path d="M${x0 + 25} ${Y + 7} C${x0 + 25} ${Y + 60} ${x0 + 52} ${Y + 80} ${x0 + 52} ${Y + 143}" stroke="${BL}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
    b += `<path d="M${x0 + 52} ${Y + 7} C${x0 + 52} ${Y + 60} ${x0 + 25} ${Y + 80} ${x0 + 25} ${Y + 143}" stroke="${RD}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
    b += `<circle cx="${x0 + 39}" cy="${Y + 75}" r="13" fill="none" stroke="${AMB}" stroke-width="2.5" stroke-dasharray="4 3"/>` + tc(x0 + 39, Y + 172, 'хиазма', `fill="${AMB}" font-weight="700" font-size="12"`);
    // 3: после обмена
    const x1 = 416;
    b += chr(x1, Y, H, BL) + chr(x1 + 18, Y, H, BL, RD) + chr(x1 + 62, Y, H, RD, BL) + chr(x1 + 80, Y, H, RD);
    b += gene(x1, Y + 34, 'A', -1) + gene(x1, Y + 116, 'B', -1) + gene(x1 + 80, Y + 34, 'a') + gene(x1 + 80, Y + 116, 'b');
    // 4: гаметы
    const g = [['AB', BL, BL, false], ['Ab', BL, RD, true], ['aB', RD, BL, true], ['ab', RD, RD, false]];
    g.forEach(([lab, c1, c2, cr], i) => {
      const x = 582 + (i % 2) * 74, y = 56 + Math.floor(i / 2) * 84;
      b += `<circle cx="${x + 7}" cy="${y + 34}" r="30" fill="${cr ? '#fff4d9' : '#f7f6fb'}" stroke="${cr ? AMB : '#e6e4ef'}" stroke-width="1.8"/>` + chr(x, y + 10, 48, c1, c2, .5, 14);
      b += t(x + 20, y + 40, lab, `font-weight="800" font-size="13" fill="${TX}"`);
    });
    b += `<rect x="562" y="232" width="14" height="14" rx="4" fill="#f7f6fb" stroke="#d9d6e6"/>` + t(582, 244, 'некроссоверные', `fill="${TX}" font-size="12"`);
    b += `<rect x="562" y="254" width="14" height="14" rx="4" fill="#fff4d9" stroke="${AMB}"/>` + t(582, 266, 'кроссоверные (новые)', `fill="${TX}" font-size="12"`);
    b += t(24, 248, 'Обмен идёт между НЕсестринскими хроматидами гомологичных хромосом', `fill="${TX}" font-size="12.5" font-weight="700"`);
    b += t(24, 266, 'в профазе I мейоза → сцепление нарушается, появляются новые сочетания аллелей', `fill="${MUT}" font-size="12"`);
    return svg(740, 282, b);
  })();

  // 4. Расстояние между генами и сила сцепления
  S.g6_distance = (() => {
    let b = tc(360, 28, 'Чем дальше гены друг от друга, тем чаще между ними перекрест', `font-weight="700" fill="${INK}" font-size="14"`);
    const Y = 92;
    b += `<rect x="40" y="${Y}" width="640" height="24" rx="12" fill="${SOFT}" stroke="${P}" stroke-width="1.6"/>`;
    const gx = { A: 90, B: 135, C: 560 };
    Object.entries(gx).forEach(([k, x]) => { b += `<rect x="${x - 3}" y="${Y}" width="6" height="24" fill="${INK}"/>` + tc(x, Y - 10, k, `font-weight="800" font-size="16" fill="${TX}"`); });
    // места возможных перекрестов (условно, равномерно)
    [180, 240, 300, 360, 420, 480, 520, 620, 112].forEach(x => { b += `<path d="M${x - 5} ${Y + 4} L${x + 5} ${Y + 20} M${x + 5} ${Y + 4} L${x - 5} ${Y + 20}" stroke="${PINK}" stroke-width="2.2" stroke-linecap="round"/>`; });
    b += `<path d="M90 ${Y + 34} v8 h45 v-8" stroke="${GREEN}" stroke-width="2" fill="none"/>` + t(56, Y + 62, 'A и B рядом: перекрест между ними редко', `fill="${GREEN}" font-weight="700" font-size="12.5"`) + t(56, Y + 80, '→ сильное сцепление', `fill="${TX}" font-size="12.5"`);
    b += `<path d="M90 ${Y - 30} v-6 h470 v6" stroke="${PINK}" stroke-width="2" fill="none"/>` + tc(325, Y - 42, 'A и C далеко: перекрест между ними часто → слабое сцепление', `fill="${PINK}" font-weight="700" font-size="12.5"`);
    b += t(400, Y + 62, '✕ — места, где может пройти перекрест', `fill="${MUT}" font-size="12"`);
    b += box(150, Y + 96, 420, 34, '#fff4d9', AMB, 10) + tc(360, Y + 118, '1 морганида = 1% кроссинговера (1% кроссоверных потомков)', `fill="${TX}" font-weight="700" font-size="13"`);
    return svg(720, 240, b);
  })();

  // 5. Генетическая карта (условный пример)
  S.g6_map = (() => {
    let b = tc(360, 28, 'Генетическая карта: порядок генов и расстояние между ними', `font-weight="700" fill="${INK}" font-size="14"`);
    const Y = 82, sc = 18, x0 = 80;
    const L = [['A', 0], ['B', 5], ['C', 17], ['D', 30]];
    b += `<rect x="${x0 - 30}" y="${Y - 10}" width="${30 * sc + 60}" height="20" rx="10" fill="${SOFT}" stroke="${P}" stroke-width="1.6"/>`;
    L.forEach(([g, d], i) => {
      const x = x0 + d * sc;
      b += `<rect x="${x - 3}" y="${Y - 10}" width="6" height="20" fill="${INK}"/>` + tc(x, Y - 18, g, `font-weight="800" font-size="16" fill="${TX}"`);
      if (i) { const xp = x0 + L[i - 1][1] * sc; b += `<path d="M${xp} ${Y + 18} v6 h${x - xp} v-6" stroke="${GR}" stroke-width="1.6" fill="none"/>` + tc((x + xp) / 2, Y + 42, `${d - L[i - 1][1]} морганид`, `fill="${TX}" font-size="12.5" font-weight="700"`) + tc((x + xp) / 2, Y + 58, `${d - L[i - 1][1]}% кроссинговера`, `fill="${MUT}" font-size="11.5"`); }
    });
    b += tc(360, 168, 'Условный пример. Зная частоту кроссинговера, учёные строят такие карты для хромосом человека', `fill="${MUT}" font-size="12"`);
    b += tc(360, 186, 'и находят, где лежит дефектный ген и с какими генами он наследуется вместе', `fill="${MUT}" font-size="12"`);
    return svg(720, 202, b);
  })();

  // 6. Основные положения хромосомной теории
  S.g6_theory = (() => {
    let b = tc(360, 28, 'Хромосомная теория наследственности — 4 положения', `font-weight="700" fill="${INK}" font-size="14"`);
    const cards = [
      ['1', 'Гены — в хромосомах', 'у каждой хромосомы свой набор генов'],
      ['2', 'Гены лежат линейно', 'друг за другом, каждый в своём локусе'],
      ['3', 'Группа сцепления', 'гены одной хромосомы; число групп = n'],
      ['4', 'Кроссинговер', 'рвёт сцепление, чаще у далёких генов'],
    ];
    cards.forEach(([n, h, s], i) => {
      const x = 16 + (i % 2) * 348, y = 44 + Math.floor(i / 2) * 92;
      b += box(x, y, 340, 82, '#fff', '#e6e4ef', 14) + `<circle cx="${x + 30}" cy="${y + 41}" r="17" fill="${P}"/>` + tc(x + 30, y + 47, n, `fill="#fff" font-weight="800" font-size="16"`);
      // мини-иконки
      const ix = x + 60, iy = y + 18;
      if (i === 0) b += chr(ix, iy, 46, P) + chr(ix + 16, iy, 46, P) + `<rect x="${ix}" y="${iy + 14}" width="30" height="3" fill="#fff"/><rect x="${ix}" y="${iy + 30}" width="30" height="3" fill="#fff"/>`;
      if (i === 1) { b += `<path d="M${ix - 8} ${iy + 23} H${ix + 30}" stroke="${GR}" stroke-width="2"/>`; [0, 1, 2, 3].forEach(k => { b += `<circle cx="${ix - 4 + k * 10}" cy="${iy + 23}" r="5.5" fill="${[P, PINK, AMB, GREEN][k]}"/>`; }); }
      if (i === 2) b += chr(ix + 6, iy, 46, P) + `<circle cx="${ix + 13}" cy="${iy + 12}" r="3" fill="#fff"/><circle cx="${ix + 13}" cy="${iy + 24}" r="3" fill="#fff"/><circle cx="${ix + 13}" cy="${iy + 36}" r="3" fill="#fff"/>`;
      if (i === 3) b += `<path d="M${ix} ${iy} C${ix} ${iy + 20} ${ix + 26} ${iy + 26} ${ix + 26} ${iy + 46}" stroke="${BL}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${ix + 26} ${iy} C${ix + 26} ${iy + 20} ${ix} ${iy + 26} ${ix} ${iy + 46}" stroke="${RD}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      b += t(x + 102, y + 36, h, `font-weight="800" fill="${TX}" font-size="13.5"`) + t(x + 102, y + 56, s, `fill="${MUT}" font-size="11.5"`);
    });
    return svg(720, 236, b);
  })();

  return S;
})());
