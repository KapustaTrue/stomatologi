// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 8: изменчивость, модификации, норма реакции (собственные схемы) =====
Object.assign(SVG_EXTRA, (() => {
  const { C, svg, t, tc, box, arrow, chrom, title } = window.G79;
  const S = {};

  // 1. Наследственность и изменчивость
  S.g8_two = (() => {
    let b = box(16, 18, 300, 150, C.BLUES, C.BLUE, 16) + tc(166, 50, 'НАСЛЕДСТВЕННОСТЬ', `font-weight="800" fill="${C.BLUE}" font-size="16"`) + tc(166, 78, 'сохраняет признаки вида', `font-size="13"`) + tc(166, 96, 'в ряду поколений', `font-size="13"`) + tc(166, 136, '«копировать»', `font-size="15" font-weight="800" fill="${C.BLUE}"`);
    b += box(404, 18, 300, 150, C.TS, C.T, 16) + tc(554, 50, 'ИЗМЕНЧИВОСТЬ', `font-weight="800" fill="${C.TI}" font-size="16"`) + tc(554, 78, 'даёт новые признаки', `font-size="13"`) + tc(554, 96, 'и свойства', `font-size="13"`) + tc(554, 136, '«менять»', `font-size="15" font-weight="800" fill="${C.TI}"`);
    b += arrow(330, 80, 392, 80, C.GR) + arrow(392, 106, 330, 106, C.GR) + tc(360, 132, 'противо-', `font-size="11" fill="${C.MUT}"`) + tc(360, 146, 'положны', `font-size="11" fill="${C.MUT}"`);
    b += box(16, 182, 688, 56, '#fff', C.LINE, 12) + tc(360, 205, 'Роль изменчивости в медицине двоякая:', `font-size="13" font-weight="800"`) + tc(360, 225, '＋ адаптация к условиям среды   ·   − врождённые пороки и наследственные болезни', `font-size="13" fill="${C.MUT}"`);
    return svg(720, 252, b);
  })();

  // 2. Дерево классификации
  S.g8_tree = (() => {
    let b = box(260, 14, 200, 44, C.TI, C.TI, 12) + tc(360, 42, 'ИЗМЕНЧИВОСТЬ', `font-weight="800" fill="#fff" font-size="16"`);
    b += arrow(320, 58, 180, 92, C.GR) + arrow(400, 58, 540, 92, C.GR);
    b += box(20, 94, 320, 112, C.AMBS, C.AMB, 14) + tc(180, 120, 'Ненаследственная', `font-weight="800" fill="#a86f00" font-size="15"`) + tc(180, 140, 'модификационная · фенотипическая', `font-size="12" fill="${C.MUT}"`) + tc(180, 156, '· определённая', `font-size="12" fill="${C.MUT}"`) + tc(180, 186, 'ДНК и генотип НЕ меняются', `font-size="13" font-weight="800"`);
    b += box(380, 94, 320, 112, C.TS, C.T, 14) + tc(540, 120, 'Наследственная', `font-weight="800" fill="${C.TI}" font-size="15"`) + tc(540, 140, 'генотипическая · неопределённая', `font-size="12" fill="${C.MUT}"`) + tc(540, 186, 'меняется генетический материал', `font-size="13" font-weight="800"`);
    b += arrow(470, 206, 440, 240, C.GR) + arrow(610, 206, 640, 240, C.GR);
    b += box(330, 242, 200, 78, '#fff', C.T, 12) + tc(430, 266, 'Комбинативная', `font-weight="800" fill="${C.TI}" font-size="14"`) + tc(430, 286, 'новые сочетания', `font-size="12"`) + tc(430, 302, 'родительских аллелей', `font-size="12"`);
    b += box(546, 242, 160, 78, '#fff', C.RED, 12) + tc(626, 266, 'Мутационная', `font-weight="800" fill="${C.RED}" font-size="14"`) + tc(626, 286, 'мутации: ДНК,', `font-size="12"`) + tc(626, 302, 'число хромосом', `font-size="12"`);
    b += tc(180, 236, 'пример: загар, мышцы', `font-size="12" fill="${C.MUT}"`) + tc(180, 254, 'спортсмена, вес тела', `font-size="12" fill="${C.MUT}"`) + tc(180, 284, 'потомству', `font-size="12.5" fill="#a86f00" font-weight="700"`) + tc(180, 302, 'НЕ передаётся', `font-size="12.5" fill="#a86f00" font-weight="700"`);
    return svg(720, 334, b);
  })();

  // 3. Источники комбинативной изменчивости
  S.g8_comb = (() => {
    const BL = C.BLUE, RD = C.PINK;
    let b = '';
    const pan = (x, n, h1, h2) => box(x, 14, 222, 228, '#fff', C.LINE, 14) + `<circle cx="${x + 24}" cy="38" r="13" fill="${C.T}"/>` + tc(x + 24, 43, n, `font-weight="800" fill="#fff"`) + t(x + 44, 36, h1, `font-weight="800" font-size="13.5" fill="${C.TI}"`) + t(x + 44, 52, h2, `font-weight="800" font-size="13.5" fill="${C.TI}"`);
    // 1 кроссинговер
    b += pan(14, 1, 'Кроссинговер', 'в профазе I мейоза');
    b += chrom(70, 76, 110, BL, .45, 14) + chrom(92, 76, 110, RD, .45, 14) + `<path d="M84 150 L92 150" stroke="#fff" stroke-width="3"/>`;
    b += `<path d="M78 146 L98 160 M98 146 L78 160" stroke="${C.TX}" stroke-width="2.5"/>`;
    b += arrow(118, 130, 150, 130, C.GR) + chrom(162, 76, 110, BL, .45, 14) + `<rect x="162" y="140" width="14" height="46" rx="7" fill="${RD}"/><rect x="162" y="140" width="14" height="8" fill="${RD}"/>` + chrom(184, 76, 110, RD, .45, 14) + `<rect x="184" y="140" width="14" height="46" rx="7" fill="${BL}"/><rect x="184" y="140" width="14" height="8" fill="${BL}"/>`;
    b += tc(125, 212, 'хромосомы меняются', `font-size="12" fill="${C.MUT}"`) + tc(125, 228, 'участками', `font-size="12" fill="${C.MUT}"`);
    // 2 независимое расхождение
    b += pan(249, 2, 'Независимое', 'расхождение хромосом');
    const pair = (x, y, c1, c2) => chrom(x, y, 34, c1, .4, 9) + chrom(x + 12, y, 34, c2, .4, 9);
    b += pair(292, 74, BL, RD) + pair(324, 74, BL, RD) + tc(320, 126, 'клетка 2n', `font-size="11" fill="${C.MUT}"`);
    b += arrow(356, 92, 384, 92, C.GR);
    const gam = (x, y, c1, c2) => `<circle cx="${x}" cy="${y}" r="20" fill="${C.TS}" stroke="${C.T}" stroke-width="1.4"/>` + chrom(x - 9, y - 13, 26, c1, .4, 7) + chrom(x + 2, y - 13, 26, c2, .4, 7);
    b += gam(410, 76, BL, BL) + gam(456, 76, RD, RD) + gam(410, 126, BL, RD) + gam(456, 126, RD, BL);
    b += tc(360, 178, '2 пары → 4 варианта гамет', `font-size="12" font-weight="700"`) + tc(360, 198, 'у человека 23 пары →', `font-size="12" fill="${C.MUT}"`) + tc(360, 214, '2²³ ≈ 8,4 млн вариантов', `font-size="12" fill="${C.MUT}"`);
    // 3 случайное слияние гамет
    b += pan(484, 3, 'Случайное', 'слияние гамет');
    b += `<circle cx="640" cy="130" r="42" fill="${C.PINKS}" stroke="${C.PINK}" stroke-width="2"/>` + tc(640, 135, 'яйцеклетка', `font-size="11" fill="${C.PINK}" font-weight="700"`);
    [[520, 86], [512, 124], [522, 162], [552, 104], [548, 150]].forEach(([x, y], i) => { b += `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="${i === 3 ? C.BLUE : '#b8c7e6'}"/><path d="M${x - 7} ${y} q-8 -6 -16 0" stroke="${i === 3 ? C.BLUE : '#b8c7e6'}" stroke-width="1.5" fill="none"/>`; });
    b += arrow(562, 106, 596, 118, C.BLUE);
    b += tc(595, 200, 'какой сперматозоид', `font-size="12" fill="${C.MUT}"`) + tc(595, 216, 'успеет — дело случая', `font-size="12" fill="${C.MUT}"`);
    return svg(720, 256, b);
  })();

  // 4. Свойства модификаций
  S.g8_props = (() => {
    const items = [['Ненаследственные', 'не пишутся в ДНК', 'половых клеток', 'мышцы не передаются детям'], ['Групповые', 'одинаковы у всех', '(определённые)', 'в горах у всех ↑ эритроциты'], ['Адаптивные', 'помогают выжить,', 'сохраняют гомеостаз', 'больше гемоглобина — больше O₂'], ['Обратимые', 'фактор исчез —', 'признак вернулся', 'загар бледнеет зимой'], ['Зависят от силы', 'и длительности', 'фактора', 'дольше на солнце — темнее']];
    let b = '';
    items.forEach(([h, l1, l2, ex], i) => {
      const x = 12 + i * 140;
      b += box(x, 14, 132, 226, i % 2 ? C.TS : '#fff', C.T, 14) + `<circle cx="${x + 66}" cy="46" r="18" fill="${C.T}"/>` + tc(x + 66, 52, i + 1, `font-weight="800" fill="#fff" font-size="16"`);
      b += tc(x + 66, 90, h, `font-weight="800" fill="${C.TI}" font-size="12.5"`) + tc(x + 66, 114, l1, `font-size="11.5"`) + tc(x + 66, 130, l2, `font-size="11.5"`);
      b += `<line x1="${x + 16}" y1="152" x2="${x + 116}" y2="152" stroke="${C.T}" stroke-opacity=".35"/>` + tc(x + 66, 174, 'пример:', `font-size="10.5" fill="${C.MUT}"`);
      const w = ex.split(' '), half = Math.ceil(w.length / 2);
      b += tc(x + 66, 194, w.slice(0, half).join(' '), `font-size="11.5" fill="${C.MUT}" font-weight="700"`) + tc(x + 66, 210, w.slice(half).join(' '), `font-size="11.5" fill="${C.MUT}" font-weight="700"`);
    });
    return svg(720, 254, b);
  })();

  // 5. Загар: обратимость и зависимость от фактора
  S.g8_tan = (() => {
    const x0 = 70, y0 = 210, W = 460, H = 150, months = ['май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек', 'янв'];
    let b = `<line x1="${x0}" y1="${y0}" x2="${x0 + W}" y2="${y0}" stroke="${C.GR}" stroke-width="1.5"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - H - 14}" stroke="${C.GR}" stroke-width="1.5"/>`;
    months.forEach((m, i) => { b += tc(x0 + 20 + i * 54, y0 + 18, m, `font-size="11" fill="${C.MUT}"`); });
    b += `<rect x="${x0 + 40}" y="${y0 - H - 8}" width="${54 * 3.2}" height="${H + 8}" fill="${C.AMBS}" opacity=".7"/>` + tc(x0 + 40 + 86, y0 - H + 6, '☀ лето — много УФ', `font-size="11.5" fill="#a86f00" font-weight="700"`);
    b += `<line x1="${x0}" y1="${y0 - 128}" x2="${x0 + W}" y2="${y0 - 128}" stroke="${C.RED}" stroke-width="2" stroke-dasharray="7 5"/>` + t(x0 + W + 8, y0 - 124, 'предел генотипа', `font-size="12" fill="${C.RED}" font-weight="700"`) + t(x0 + W + 8, y0 - 108, '(норма реакции)', `font-size="11.5" fill="${C.RED}"`);
    const curve = (k, c) => { let d = ''; for (let i = 0; i <= 80; i++) { const x = x0 + 20 + i * (54 * 8 / 80), m = i / 10; let v = m < 0.4 ? 0 : m < 3.6 ? (1 - Math.exp(-(m - 0.4) * 1.1)) : (1 - Math.exp(-3.2 * 1.1)) * Math.exp(-(m - 3.6) * .75); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - 10 - v * k).toFixed(1); } return `<path d="${d}" stroke="${c}" stroke-width="3" fill="none"/>`; };
    b += curve(112, '#8a5a2b') + curve(60, '#d9a066');
    b += box(560, 140, 150, 72, '#fff', C.LINE, 10) + `<line x1="570" y1="160" x2="594" y2="160" stroke="#8a5a2b" stroke-width="3"/>` + t(600, 164, 'много солнца', `font-size="11.5"`) + `<line x1="570" y1="186" x2="594" y2="186" stroke="#d9a066" stroke-width="3"/>` + t(600, 190, 'мало солнца', `font-size="11.5"`);
    b += t(x0 - 8, y0 - H - 20, 'пигментация кожи', `font-size="12" fill="${C.MUT}" font-weight="700"`);
    b += tc(360, y0 + 42, 'Сильнее и дольше фактор → сильнее загар, но не выше предела генотипа.', `font-size="12.5" fill="${C.TI}" font-weight="700"`) + tc(360, y0 + 60, 'Нет УФ → загар постепенно уходит (обратимость).', `font-size="12.5" fill="${C.TI}" font-weight="700"`);
    return svg(720, 286, b);
  })();

  // 6. Норма реакции — коридор
  S.g8_norm = (() => {
    const sx = v => 60 + (v - 150) * 15; // 150..190 см
    let b = title(360, 30, 'Рост человека: гены задают коридор, среда — точку в нём', C.TI, 14.5);
    // шкала
    b += `<line x1="${sx(150)}" y1="214" x2="${sx(190)}" y2="214" stroke="${C.GR}" stroke-width="1.5"/>`;
    for (let v = 150; v <= 190; v += 5) b += `<line x1="${sx(v)}" y1="210" x2="${sx(v)}" y2="218" stroke="${C.GR}"/>` + tc(sx(v), 234, v, `font-size="11" fill="${C.MUT}"`);
    b += t(sx(190) + 16, 238, 'см', `font-size="11" fill="${C.MUT}"`);
    // генотип 1
    b += box(sx(168), 56, sx(186) - sx(168), 54, C.TS, C.T, 10, 2) + t(sx(168) + 6, 51, 'генотип А: норма реакции 168–186 см', `font-size="12" font-weight="800" fill="${C.TI}"`);
    [[169, 'голод, болезни'], [177, 'обычные условия'], [185, 'питание, спорт, сон']].forEach(([v, l], i) => { b += `<circle cx="${sx(v)}" cy="83" r="8" fill="${C.T}"/>` + tc(sx(v), 130 + (i % 2) * 14, l, `font-size="11" fill="${C.MUT}"`) + `<line x1="${sx(v)}" y1="92" x2="${sx(v)}" y2="${118 + (i % 2) * 14}" stroke="${C.T}" stroke-opacity=".4"/>`; });
    // генотип 2
    b += box(sx(154), 156, sx(170) - sx(154), 34, C.AMBS, C.AMB, 10, 2) + t(sx(154), 151, 'генотип Б: 154–170 см', `font-size="12" font-weight="800" fill="#a86f00"`);
    [156, 162, 169].forEach(v => { b += `<circle cx="${sx(v)}" cy="173" r="6" fill="${C.AMB}"/>`; });
    b += t(sx(186) + 6, 78, '⛔ выше', `font-size="11.5" fill="${C.RED}" font-weight="700"`) + t(sx(186) + 6, 94, 'не вырастет', `font-size="11.5" fill="${C.RED}"`);
    return svg(720, 250, b);
  })();

  // 7. Широкая и узкая норма реакции
  S.g8_widenarrow = (() => {
    let b = box(14, 14, 340, 250, C.TS, C.T, 14) + tc(184, 42, 'ШИРОКАЯ норма реакции', `font-weight="800" fill="${C.TI}" font-size="14.5"`) + tc(184, 60, 'количественные признаки', `font-size="12" fill="${C.MUT}"`);
    b += `<rect x="40" y="82" width="288" height="18" rx="9" fill="${C.TL}"/>`;
    [52, 88, 120, 150, 190, 228, 262, 300, 318].forEach(x => { b += `<circle cx="${x}" cy="91" r="5" fill="${C.TI}"/>`; });
    b += tc(184, 122, 'значение сильно «гуляет» от условий', `font-size="12"`);
    ['масса тела, подкожный жир', 'рост, мышечная сила', 'лейкоциты, эритроциты', 'артериальное давление', 'пигментация кожи'].forEach((s, i) => { b += t(40, 150 + i * 21, '• ' + s, `font-size="12.5"`); });
    b += box(366, 14, 340, 250, C.PINKS, C.PINK, 14) + tc(536, 42, 'УЗКАЯ норма реакции', `font-weight="800" fill="${C.PINK}" font-size="14.5"`) + tc(536, 60, 'качественные признаки', `font-size="12" fill="${C.MUT}"`);
    b += `<line x1="392" y1="91" x2="680" y2="91" stroke="${C.LINE}" stroke-width="2"/><rect x="528" y="82" width="16" height="18" rx="8" fill="${C.PINK}"/><circle cx="536" cy="91" r="5" fill="#fff"/>`;
    b += tc(536, 122, 'среда почти не может сдвинуть', `font-size="12"`);
    ['группа крови AB0, резус-фактор', 'цвет радужки глаза', 'узоры пальцев (дерматоглифика)', 'строение и расположение', 'сердца и крупных сосудов'].forEach((s, i) => { b += t(392, 150 + i * 21, (i === 4 ? '  ' : '• ') + s, `font-size="12.5"`); });
    return svg(720, 278, b);
  })();

  // 8. Клиника: медицинская норма = коридор нормы реакции
  S.g8_clinic = (() => {
    const gauge = (y, name, unit, lo, hi, min, max, pts) => {
      const X0 = 150, W = 520, sx = v => X0 + (v - min) / (max - min) * W;
      let g = t(20, y + 6, name, `font-weight="800" font-size="13.5"`) + t(20, y + 24, unit, `font-size="11.5" fill="${C.MUT}"`);
      g += `<rect x="${X0}" y="${y - 6}" width="${W}" height="16" rx="8" fill="#fbe3e5"/><rect x="${sx(lo)}" y="${y - 6}" width="${sx(hi) - sx(lo)}" height="16" fill="${C.TL}"/>`;
      g += tc(sx(lo), y + 30, String(lo).replace('.', ','), `font-size="12" font-weight="800" fill="${C.TI}"`) + tc(sx(hi), y + 30, String(hi).replace('.', ','), `font-size="12" font-weight="800" fill="${C.TI}"`) + tc((sx(lo) + sx(hi)) / 2, y + 30, 'норма', `font-size="11.5" fill="${C.TI}"`);
      pts.forEach(([v, l, bad]) => { g += `<path d="M${sx(v)} ${y - 10} l-6 -10 h12z" fill="${bad ? C.RED : C.TI}"/>` + tc(sx(v), y - 26, l, `font-size="11" fill="${bad ? C.RED : C.MUT}" font-weight="700"`); });
      return g;
    };
    let b = gauge(70, 'Глюкоза крови', 'ммоль/л', 3.3, 5.5, 2, 9, [[4.2, 'натощак'], [5.3, 'после еды'], [7.8, 'выход за коридор', 1]]);
    b += gauge(160, 'Пульс', 'уд/мин', 60, 80, 40, 120, [[64, 'покой'], [77, 'волнение'], [104, 'выход за коридор', 1]]);
    b += box(20, 206, 680, 42, C.TS, C.T, 10, 1.2) + tc(360, 225, 'Колебания внутри коридора — норма (широкая норма реакции). Задача медицины — не допустить', `font-size="12" fill="${C.TI}" font-weight="700"`) + tc(360, 241, 'выхода за его пределы: срыва адаптации и перехода в патологию.', `font-size="12" fill="${C.TI}" font-weight="700"`);
    return svg(720, 262, b);
  })();

  return S;
})());
