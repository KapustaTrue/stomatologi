// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 7: генетика пола, сцепленное с полом наследование (собственные схемы) =====
// Общие помощники для лекций 7–9 (бирюзово-зелёная гамма) — window.G79
window.G79 = (() => {
  const F = 'font-family="Golos Text,Inter,Segoe UI,Arial,sans-serif"';
  const C = { T: '#0fa38a', TI: '#0b6458', TS: '#dcf5ef', TL: '#8fdccb', AQ: '#1fb5c9', GR2: '#46b06a', PINK: '#e0527a', PINKS: '#fde8ee', BLUE: '#3f7fd6', BLUES: '#e6efff', RED: '#d8434f', AMB: '#e09a00', AMBS: '#fff3d6', GR: '#9aa0ad', LINE: '#e2e8e6', TX: '#1d2030', MUT: '#5f6b72' };
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" ${F} font-size="13" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="18" fill="#fff"/>${body}</svg>`;
  const t = (x, y, s, o = '') => `<text x="${x}" y="${y}" fill="${C.TX}" ${o}>${s}</text>`;
  const tc = (x, y, s, o = '') => t(x, y, s, `text-anchor="middle" ${o}`);
  const box = (x, y, w, h, fill, stroke, rx = 12, sw = 1.6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c = C.GR, w = 2) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 8; const p1 = [x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45)], p2 = [x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)];
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" fill="none"/><path d="M${x2} ${y2} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z" fill="${c}"/>`; };
  // хромосома: два плеча с перетяжкой (cen — доля длины до центромеры)
  const chrom = (x, y, h, c, cen = .4, w = 10) => {
    const a = h * cen - 1.5, b = h - h * cen - 1.5;
    return `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(a, w * .6)}" rx="${w / 2}" fill="${c}"/><rect x="${x}" y="${y + h * cen + 1.5}" width="${w}" height="${b}" rx="${w / 2}" fill="${c}"/>`;
  };
  // символы родословной: мужчина — квадрат, женщина — круг; st: h — здоров, s — болен, c — носитель
  const man = (x, y, st = 'h', r = 15, c = C.BLUE) => `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" rx="3" fill="${st === 's' ? c : '#fff'}" stroke="${c}" stroke-width="2.2"/>` + (st === 'c' ? `<circle cx="${x}" cy="${y}" r="${r * .32}" fill="${c}"/>` : '');
  const woman = (x, y, st = 'h', r = 15, c = C.PINK) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${st === 's' ? c : '#fff'}" stroke="${c}" stroke-width="2.2"/>` + (st === 'c' ? `<circle cx="${x}" cy="${y}" r="${r * .32}" fill="${c}"/>` : '');
  const legend = (x, y) => man(x, y, 'h', 8) + t(x + 13, y + 4, 'здоров', `font-size="11" fill="${C.MUT}"`) + man(x + 74, y, 's', 8) + t(x + 87, y + 4, 'болен', `font-size="11" fill="${C.MUT}"`) + woman(x + 142, y, 'c', 8) + t(x + 155, y + 4, 'носительница', `font-size="11" fill="${C.MUT}"`) + t(x + 248, y + 4, '□ — мужчина, ○ — женщина', `font-size="11" fill="${C.MUT}"`);
  const X = (a, sup = '') => `X<tspan dy="-6" font-size="10">${a}</tspan><tspan dy="6">${sup}</tspan>`;
  const title = (x, y, s, c = C.TI, size = 15) => tc(x, y, s, `font-weight="800" fill="${c}" font-size="${size}"`);
  return { C, svg, t, tc, box, arrow, chrom, man, woman, legend, X, title };
})();

Object.assign(SVG_EXTRA, (() => {
  const { C, svg, t, tc, box, arrow, chrom, man, woman, legend, X, title } = window.G79;
  const S = {};

  // 1. Кариотип: 22 пары аутосом + половые хромосомы
  S.g7_karyo = (() => {
    let b = title(240, 30, '22 пары аутосом — одинаковы у всех');
    for (let i = 0; i < 22; i++) {
      const row = i < 11 ? 0 : 1, col = i % 11, x = 26 + col * 41, base = row ? 222 : 120;
      const h = Math.round(80 - i * 2.2), cen = [.48, .45, .47, .3, .3, .38, .37, .33, .34, .33, .4, .3, .15, .15, .15, .43, .32, .3, .45, .45, .2, .2][i];
      b += chrom(x, base - h, h, C.TL, cen, 9) + chrom(x + 13, base - h, h, C.TL, cen, 9);
      b += tc(x + 11, base + 15, i + 1, `font-size="11" fill="${C.MUT}" font-weight="700"`);
    }
    b += box(482, 16, 224, 244, C.TS, C.T, 14) + title(594, 40, '23-я пара — половые', C.TI, 14);
    b += box(496, 52, 96, 160, '#fff', C.PINK, 10) + tc(544, 74, '♀ женщина', `font-weight="800" fill="${C.PINK}" font-size="12.5"`);
    b += chrom(526, 92, 74, C.PINK, .4, 11) + chrom(547, 92, 74, C.PINK, .4, 11) + tc(544, 186, '46, XX', `font-weight="800" font-size="14"`) + tc(544, 203, 'X + X', `font-size="11" fill="${C.MUT}"`);
    b += box(600, 52, 96, 160, '#fff', C.BLUE, 10) + tc(648, 74, '♂ мужчина', `font-weight="800" fill="${C.BLUE}" font-size="12.5"`);
    b += chrom(628, 92, 74, C.PINK, .4, 11) + chrom(650, 140, 26, C.BLUE, .12, 11) + tc(648, 186, '46, XY', `font-weight="800" font-size="14"`) + tc(648, 203, 'X + Y', `font-size="11" fill="${C.MUT}"`);
    b += tc(594, 236, 'гоносомы определяют пол', `font-size="12" fill="${C.TI}" font-weight="700"`);
    b += tc(240, 258, 'аутосомы (A) — неполовые хромосомы, 22 пары', `font-size="12" fill="${C.MUT}"`);
    return svg(720, 272, b);
  })();

  // 2. X и Y хромосомы
  S.g7_xy = (() => {
    let b = '';
    b += box(14, 14, 330, 232, '#fff', C.LINE, 14) + title(179, 38, 'X-хромосома', C.PINK);
    b += chrom(84, 56, 170, C.PINK, .4, 26);
    b += `<path d="M118 124 h18" stroke="${C.GR}" stroke-width="1.5"/>` + t(140, 128, 'центромера', `font-size="12" fill="${C.MUT}"`);
    b += t(140, 76, 'крупная', `font-weight="800" font-size="13"`) + t(140, 94, 'субметацентрическая —', `font-size="12" fill="${C.MUT}"`) + t(140, 110, 'плечи разной длины', `font-size="12" fill="${C.MUT}"`);
    b += t(140, 160, 'много генов «общего', `font-size="12" fill="${C.MUT}"`) + t(140, 176, 'назначения»: свёртывание', `font-size="12" fill="${C.MUT}"`) + t(140, 192, 'крови, цветовое зрение,', `font-size="12" fill="${C.MUT}"`) + t(140, 208, 'белки мышц…', `font-size="12" fill="${C.MUT}"`);
    b += box(358, 14, 348, 232, '#fff', C.LINE, 14) + title(532, 38, 'Y-хромосома', C.BLUE);
    b += chrom(420, 120, 76, C.BLUE, .12, 26);
    b += `<rect x="420" y="146" width="26" height="12" fill="${C.AMB}"/>` + `<path d="M450 152 h18" stroke="${C.AMB}" stroke-width="2"/>` + t(472, 157, 'ген SRY', `font-weight="800" fill="${C.AMB}" font-size="14"`);
    b += t(472, 176, '«переключатель» на мужской тип:', `font-size="12" fill="${C.MUT}"`) + t(472, 192, 'запускает развитие семенников', `font-size="12" fill="${C.MUT}"`);
    b += t(472, 76, 'мелкая', `font-weight="800" font-size="13"`) + t(472, 94, 'акроцентрическая — центромера', `font-size="12" fill="${C.MUT}"`) + t(472, 110, 'почти на конце', `font-size="12" fill="${C.MUT}"`);
    b += `<path d="M412 138 v54" stroke="${C.T}" stroke-width="2.5"/>` + t(380, 222, 'негомологичный (уникальный) участок Y — в нём', `font-size="11.5" fill="${C.TI}" font-weight="700"`) + t(380, 238, 'гены голандрических признаков (только у мужчин)', `font-size="11.5" fill="${C.TI}" font-weight="700"`);
    return svg(720, 260, b);
  })();

  // 3. Три типа наследования
  S.g7_types = (() => {
    const card = (x, col, soft, head, sub, l1, l2, l3) => box(x, 16, 222, 186, soft, col, 14) + tc(x + 111, 44, head, `font-weight="800" fill="${col}" font-size="14.5"`) + tc(x + 111, 63, sub, `font-size="12" fill="${C.MUT}"`) +
      `<line x1="${x + 18}" y1="76" x2="${x + 204}" y2="76" stroke="${col}" stroke-opacity=".35"/>` + tc(x + 111, 104, l1, `font-size="12.5" font-weight="700"`) + tc(x + 111, 128, l2, `font-size="12.5"`) + tc(x + 111, 168, l3, `font-size="12" fill="${C.MUT}"`);
    let b = card(14, C.PINK, C.PINKS, 'X-рецессивное', 'ген в X, проявляется в aa', 'болеют в основном мужчины', 'женщины — носительницы', 'гемофилия, дальтонизм');
    b += card(249, C.T, C.TS, 'X-доминантное', 'ген в X, хватает одной копии', 'женщины болеют в 2 раза чаще', 'у мужчин — тяжелее', 'фосфат-диабет, тёмная эмаль');
    b += card(484, C.BLUE, C.BLUES, 'Y-сцепленное', 'голандрическое, ген в Y', 'только мужчины', 'от отца — всем сыновьям', 'гипертрихоз ушных раковин');
    return svg(720, 218, b);
  })();

  // 4. X-рецессивное: мать-носительница × здоровый отец
  S.g7_xr = (() => {
    let b = title(360, 30, 'Мать-носительница × здоровый отец');
    b += woman(250, 72, 'c', 18) + tc(250, 110, X('A') + X('a'), `font-weight="800" font-size="14"`) + tc(250, 126, 'носительница', `font-size="11" fill="${C.MUT}"`);
    b += man(470, 72, 'h', 18) + tc(470, 110, X('A') + 'Y', `font-weight="800" font-size="14"`) + tc(470, 126, 'здоров', `font-size="11" fill="${C.MUT}"`);
    b += `<line x1="270" y1="72" x2="450" y2="72" stroke="${C.GR}" stroke-width="2"/><line x1="360" y1="72" x2="360" y2="146" stroke="${C.GR}" stroke-width="2"/><line x1="135" y1="146" x2="585" y2="146" stroke="${C.GR}" stroke-width="2"/>`;
    const kids = [[135, 'w', 'h', X('A') + X('A'), 'здорова'], [285, 'w', 'c', X('A') + X('a'), 'носительница'], [435, 'm', 'h', X('A') + 'Y', 'здоров'], [585, 'm', 's', X('a') + 'Y', 'БОЛЕН']];
    kids.forEach(([x, g, st, gt, lab]) => {
      b += `<line x1="${x}" y1="146" x2="${x}" y2="166" stroke="${C.GR}" stroke-width="2"/>` + (g === 'w' ? woman(x, 184, st, 17) : man(x, 184, st, 17));
      b += tc(x, 222, gt, `font-weight="800" font-size="14"`) + tc(x, 239, lab, `font-size="12" font-weight="700" fill="${st === 's' ? C.RED : C.MUT}"`);
    });
    b += box(60, 252, 600, 30, C.TS, C.T, 10, 1.2) + tc(360, 272, 'дочери: 50% здоровы, 50% носительницы · сыновья: 50% здоровы, 50% больны', `font-size="12.5" font-weight="700" fill="${C.TI}"`);
    b += legend(150, 302);
    return svg(720, 318, b);
  })();

  // 5. Крест-накрест
  S.g7_criss = (() => {
    let b = t(22, 30, 'I', `font-weight="800" font-size="14" fill="${C.MUT}"`) + t(22, 120, 'II', `font-weight="800" font-size="14" fill="${C.MUT}"`) + t(22, 210, 'III', `font-weight="800" font-size="14" fill="${C.MUT}"`);
    // I
    b += man(200, 34, 's', 16) + tc(200, 71, X('a') + 'Y', `font-weight="800"`) + tc(200, 86, 'больной дед', `font-size="11" fill="${C.RED}" font-weight="700"`);
    b += woman(320, 34, 'h', 16) + tc(320, 71, X('A') + X('A'), `font-weight="800"`);
    b += `<line x1="216" y1="34" x2="304" y2="34" stroke="${C.GR}" stroke-width="2"/><line x1="260" y1="34" x2="260" y2="94" stroke="${C.GR}" stroke-width="2"/><line x1="150" y1="94" x2="370" y2="94" stroke="${C.GR}" stroke-width="2"/>`;
    // II
    b += `<line x1="150" y1="94" x2="150" y2="108" stroke="${C.GR}" stroke-width="2"/>` + man(150, 124, 'h', 16) + tc(150, 161, X('A') + 'Y', `font-weight="800"`) + tc(150, 176, 'сын здоров', `font-size="11" fill="${C.MUT}"`);
    b += `<line x1="370" y1="94" x2="370" y2="108" stroke="${C.GR}" stroke-width="2"/>` + woman(370, 124, 'c', 16) + t(346, 122, X('A') + X('a'), `font-weight="800" text-anchor="end"`) + t(346, 140, 'дочь-носительница', `font-size="11" fill="${C.PINK}" font-weight="700" text-anchor="end"`);
    b += man(490, 124, 'h', 16) + tc(490, 161, X('A') + 'Y', `font-weight="800"`) + `<line x1="386" y1="124" x2="474" y2="124" stroke="${C.GR}" stroke-width="2"/><line x1="430" y1="124" x2="430" y2="186" stroke="${C.GR}" stroke-width="2"/><line x1="370" y1="186" x2="490" y2="186" stroke="${C.GR}" stroke-width="2"/>`;
    // III
    b += `<line x1="370" y1="186" x2="370" y2="198" stroke="${C.GR}" stroke-width="2"/>` + man(370, 214, 's', 16) + tc(370, 251, X('a') + 'Y', `font-weight="800"`) + tc(370, 266, 'больной внук', `font-size="11" fill="${C.RED}" font-weight="700"`);
    b += `<line x1="490" y1="186" x2="490" y2="198" stroke="${C.GR}" stroke-width="2"/>` + woman(490, 214, 'h', 16) + tc(490, 251, X('A') + X('A'), `font-weight="800"`);
    // путь гена
    b += `<path d="M218 48 C 300 70, 330 100, 356 112" stroke="${C.RED}" stroke-width="3" fill="none" stroke-dasharray="6 4"/><path d="M370 142 C 360 170, 360 180, 366 196" stroke="${C.RED}" stroke-width="3" fill="none" stroke-dasharray="6 4"/>`;
    b += `<path d="M190 52 L160 106" stroke="${C.BLUE}" stroke-width="2" stroke-dasharray="3 4" fill="none"/>` + t(56, 84, 'сыну — только Y', `font-size="11.5" fill="${C.BLUE}" font-weight="700"`);
    b += box(546, 60, 160, 150, C.TS, C.T, 12, 1.2) + tc(626, 86, 'Путь гена', `font-weight="800" fill="${C.TI}"`) + tc(626, 110, 'мужчина', `font-size="12.5"`) + tc(626, 128, '↓', `font-size="14" fill="${C.RED}"`) + tc(626, 146, 'женщина', `font-size="12.5"`) + tc(626, 164, '↓', `font-size="14" fill="${C.RED}"`) + tc(626, 182, 'мужчина', `font-size="12.5"`) + tc(626, 200, '«крест-накрест»', `font-size="11.5" fill="${C.MUT}"`);
    return svg(720, 280, b);
  })();

  // 6. X-доминантное
  S.g7_xd = (() => {
    const fam = (ox, pf, pm, gf, gm, kids, res) => {
      let b = box(ox, 14, 340, 262, '#fff', C.LINE, 14);
      b += woman(ox + 100, 50, pm, 16) + tc(ox + 100, 88, gm, `font-weight="800"`) + man(ox + 240, 50, pf, 16) + tc(ox + 240, 88, gf, `font-weight="800"`);
      b += `<line x1="${ox + 116}" y1="50" x2="${ox + 224}" y2="50" stroke="${C.GR}" stroke-width="2"/><line x1="${ox + 170}" y1="50" x2="${ox + 170}" y2="110" stroke="${C.GR}" stroke-width="2"/><line x1="${ox + 56}" y1="110" x2="${ox + 284}" y2="110" stroke="${C.GR}" stroke-width="2"/>`;
      kids.forEach(([g, st, gt], i) => { const x = ox + 56 + i * 76; b += `<line x1="${x}" y1="110" x2="${x}" y2="126" stroke="${C.GR}" stroke-width="2"/>` + (g === 'w' ? woman(x, 142, st, 15) : man(x, 142, st, 15)) + tc(x, 181, gt, `font-weight="800" font-size="12.5"`) + tc(x, 197, st === 's' ? (g === 'm' ? 'болен' : 'больна') : (g === 'm' ? 'здоров' : 'здорова'), `font-size="11" fill="${st === 's' ? C.RED : C.MUT}" font-weight="700"`); });
      b += box(ox + 14, 208, 312, 56, C.TS, C.T, 10, 1.2) + tc(ox + 170, 230, res[0], `font-size="12.5" font-weight="800" fill="${C.TI}"`) + tc(ox + 170, 250, res[1], `font-size="12" fill="${C.TI}"`);
      return b;
    };
    let b = fam(14, 's', 'h', X('A') + 'Y', X('a') + X('a'), [['w', 's', X('A') + X('a')], ['w', 's', X('A') + X('a')], ['m', 'h', X('a') + 'Y'], ['m', 'h', X('a') + 'Y']], ['Больной ОТЕЦ → всем дочерям', 'ни одному сыну (сын получает Y)']);
    b += fam(366, 'h', 's', X('a') + 'Y', X('A') + X('a'), [['w', 's', X('A') + X('a')], ['w', 'h', X('a') + X('a')], ['m', 's', X('A') + 'Y'], ['m', 'h', X('a') + 'Y']], ['Больная МАТЬ → 50% детей', 'и сыновьям, и дочерям']);
    b += tc(360, 296, 'Здесь A — доминантный мутантный ген (болезнь), a — норма', `font-size="12" fill="${C.MUT}"`);
    return svg(720, 308, b);
  })();

  // 7. Голандрическое наследование
  S.g7_y = (() => {
    let b = '';
    b += man(250, 40, 's', 16) + woman(370, 40, 'h', 16) + tc(250, 72, 'XY*', `font-weight="800"`) + tc(370, 72, 'XX', `font-weight="800"`);
    b += `<line x1="266" y1="40" x2="354" y2="40" stroke="${C.GR}" stroke-width="2"/><line x1="310" y1="40" x2="310" y2="96" stroke="${C.GR}" stroke-width="2"/><line x1="130" y1="96" x2="490" y2="96" stroke="${C.GR}" stroke-width="2"/>`;
    [[130, 'm', 's'], [250, 'w', 'h'], [370, 'm', 's'], [490, 'w', 'h']].forEach(([x, g, st]) => { b += `<line x1="${x}" y1="96" x2="${x}" y2="110" stroke="${C.GR}" stroke-width="2"/>` + (g === 'm' ? man(x, 126, st, 16) : woman(x, 126, st, 16)) + tc(x, 158, g === 'm' ? 'XY*' : 'XX', `font-weight="800"`) + tc(x, 174, g === 'm' ? 'сын — есть' : 'дочь — нет', `font-size="11" fill="${g === 'm' ? C.BLUE : C.MUT}" font-weight="700"`); });
    b += `<line x1="130" y1="180" x2="130" y2="198" stroke="${C.GR}" stroke-width="2"/>` + man(130, 212, 's', 14) + tc(130, 242, 'внук', `font-size="11" fill="${C.BLUE}" font-weight="700"`);
    b += `<line x1="370" y1="180" x2="370" y2="198" stroke="${C.GR}" stroke-width="2"/>` + man(370, 212, 's', 14) + tc(370, 242, 'внук', `font-size="11" fill="${C.BLUE}" font-weight="700"`);
    b += box(530, 26, 176, 200, C.BLUES, C.BLUE, 12, 1.2) + tc(618, 52, 'Y* — Y с геном', `font-weight="800" fill="${C.BLUE}"`) + tc(618, 80, 'отец → сын → внук', `font-size="12.5" font-weight="700"`) + tc(618, 104, 'по прямой мужской', `font-size="12"`) + tc(618, 120, 'линии, как фамилия', `font-size="12"`) + tc(618, 152, 'женщины не болеют', `font-size="12" fill="${C.MUT}"`) + tc(618, 168, 'и не передают —', `font-size="12" fill="${C.MUT}"`) + tc(618, 184, 'у них нет Y', `font-size="12" fill="${C.MUT}"`);
    return svg(720, 256, b);
  })();

  // 8. Облысение — признак, зависимый от пола
  S.g7_bald = (() => {
    const head = (x, y, hair, col) => {
      let g = `<ellipse cx="${x}" cy="${y + 4}" rx="22" ry="26" fill="#f6d7bf" stroke="#c99a7a" stroke-width="1.5"/><circle cx="${x - 8}" cy="${y + 4}" r="2" fill="${C.TX}"/><circle cx="${x + 8}" cy="${y + 4}" r="2" fill="${C.TX}"/><path d="M${x - 7} ${y + 16} q7 5 14 0" stroke="${C.TX}" stroke-width="1.5" fill="none"/>`;
      if (hair === 'full') g += `<path d="M${x - 23} ${y} q0 -32 23 -32 q23 0 23 32 q-6 -14 -23 -16 q-17 2 -23 16z" fill="${col}"/>`;
      if (hair === 'long') g += `<path d="M${x - 24} ${y + 26} q-6 -58 24 -58 q30 0 24 58 l-6 0 q2 -30 -4 -36 q-14 -10 -28 0 q-6 6 -4 36z" fill="${col}"/>`;
      if (hair === 'thin') g += `<path d="M${x - 24} ${y + 26} q-6 -50 4 -52" stroke="${col}" stroke-width="3" fill="none"/><path d="M${x + 24} ${y + 26} q6 -50 -4 -52" stroke="${col}" stroke-width="3" fill="none"/>` + [-12, -4, 4, 12].map(d => `<path d="M${x + d} ${y - 22} q2 -6 0 -9" stroke="${col}" stroke-width="1.5" fill="none"/>`).join('');
      if (hair === 'bald') g += `<path d="M${x - 22} ${y + 2} q-2 -10 3 -14" stroke="${col}" stroke-width="4" fill="none"/><path d="M${x + 22} ${y + 2} q2 -10 -3 -14" stroke="${col}" stroke-width="4" fill="none"/>`;
      return g;
    };
    const HC = '#6b4a2f';
    let b = tc(140, 44, 'генотип', `font-weight="800" fill="${C.MUT}"`) + tc(330, 44, '♂ мужчины', `font-weight="800" fill="${C.BLUE}" font-size="14"`) + tc(560, 44, '♀ женщины', `font-weight="800" fill="${C.PINK}" font-size="14"`);
    const rows = [['AA', 'bald', 'лысеет', 'thin', 'сильное поредение'], ['Aa', 'bald', 'лысеет', 'long', 'норма'], ['aa', 'full', 'норма', 'long', 'норма']];
    rows.forEach(([g, m, ml, f, fl], i) => {
      const y = 92 + i * 78;
      b += `<line x1="40" y1="${y - 40}" x2="680" y2="${y - 40}" stroke="${C.LINE}"/>` + tc(140, y + 8, g, `font-weight="800" font-size="20" fill="${C.TI}"`);
      b += head(290, y, m, HC) + t(326, y + 8, ml, `font-size="13" font-weight="700" fill="${ml === 'норма' ? C.MUT : C.RED}"`);
      b += head(520, y, f, HC) + t(556, y + 8, fl, `font-size="13" font-weight="700" fill="${fl === 'норма' ? C.MUT : C.RED}"`);
    });
    b += box(40, 286, 640, 46, C.TS, C.T, 10, 1.2) + tc(360, 305, 'Ген в аутосоме. У мужчин (андрогены) A ведёт себя как доминантный — хватает Aa,', `font-size="12" fill="${C.TI}" font-weight="700"`) + tc(360, 322, 'у женщин — как рецессивный: проявляется только в AA', `font-size="12" fill="${C.TI}" font-weight="700"`);
    return svg(720, 346, b);
  })();

  // 9. Три понятия — не путать
  S.g7_three = (() => {
    const col = (x, c, soft, h1, where, how, ex) => box(x, 16, 222, 200, soft, c, 14) + tc(x + 111, 44, h1[0], `font-weight="800" fill="${c}" font-size="14"`) + tc(x + 111, 62, h1[1], `font-weight="800" fill="${c}" font-size="14"`) +
      box(x + 16, 76, 190, 30, '#fff', c, 8, 1) + tc(x + 111, 96, where, `font-size="12.5" font-weight="700"`) + tc(x + 111, 130, how[0], `font-size="12"`) + tc(x + 111, 147, how[1], `font-size="12"`) + tc(x + 111, 178, ex[0], `font-size="12" fill="${C.MUT}"`) + tc(x + 111, 195, ex[1], `font-size="12" fill="${C.MUT}"`);
    let b = col(14, C.PINK, C.PINKS, ['Сцепленные', 'с полом'], 'ген в X или Y', ['передача зависит от того,', 'кому достаётся X или Y'], ['гемофилия, дальтонизм,', 'гипертрихоз ушей']);
    b += col(249, C.AMB, C.AMBS, ['Ограниченные', 'полом'], 'ген в аутосоме', ['есть у обоих, проявляется', 'только у одного пола'], ['тембр голоса, молоко', 'у женщин']);
    b += col(484, C.T, C.TS, ['Зависимые', 'от пола'], 'ген в аутосоме', ['доминирование зависит', 'от половых гормонов'], ['преждевременное', 'облысение']);
    return svg(720, 230, b);
  })();

  return S;
})());
