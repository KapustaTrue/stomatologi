// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 9: мутационная изменчивость, классификация мутаций, мутагены (собственные схемы) =====
Object.assign(SVG_EXTRA, (() => {
  const { C, svg, t, tc, box, arrow, chrom, title } = window.G79;
  const S = {};
  const NUC = { A: '#46b06a', T: '#e0527a', G: '#e09a00', C: '#3f7fd6' };
  const nuc = (x, y, l, w = 26, mark = '') => `<rect x="${x}" y="${y}" width="${w}" height="28" rx="6" fill="${NUC[l] || '#ccc'}" ${mark ? `stroke="${C.TX}" stroke-width="2.5"` : ''}/>` + tc(x + w / 2, y + 19, l, `font-weight="800" fill="#fff" font-size="14"`);

  // 1. Модификация vs мутация
  S.g9_vs = (() => {
    const rows = [['Что меняется', 'только фенотип', 'генотип (ДНК, хромосомы)'], ['Передаётся детям?', 'нет', 'да (если в половых клетках)'], ['У кого', 'у всех под действием фактора', 'у отдельных особей'], ['Предсказуемость', 'определённая (известно, что будет)', 'ненаправленная'], ['Обратимость', 'обратима', 'стойкая'], ['Пример', 'загар, мышцы спортсмена', 'гемофилия, синдром Дауна']];
    let b = box(220, 12, 236, 38, C.AMBS, C.AMB, 10) + tc(338, 37, 'МОДИФИКАЦИЯ', `font-weight="800" fill="#a86f00" font-size="14"`) + box(468, 12, 238, 38, '#fde3e5', C.RED, 10) + tc(587, 37, 'МУТАЦИЯ', `font-weight="800" fill="${C.RED}" font-size="14"`);
    rows.forEach(([h, a, m], i) => { const y = 60 + i * 34; b += `<rect x="14" y="${y}" width="692" height="30" rx="8" fill="${i % 2 ? '#fff' : '#f5f8f7'}"/>` + t(26, y + 20, h, `font-weight="800" font-size="12.5" fill="${C.TI}"`) + tc(338, y + 20, a, `font-size="12.5"`) + tc(587, y + 20, m, `font-size="12.5"`); });
    return svg(720, 272, b);
  })();

  // 2. Свойства мутаций
  S.g9_props = (() => {
    const items = [['Наследственные', 'изменён генотип —', 'копируется при делении'], ['Индивидуальные', '(дискретные) — у', 'отдельных особей'], ['Ненаправленные', 'не угадать, какой', 'ген изменится'], ['Без переходных', 'форм — сразу новый', 'признак']];
    let b = '';
    items.forEach(([h, l1, l2], i) => { const x = 14 + i * 174; b += box(x, 14, 166, 150, i % 2 ? C.TS : '#fff', C.T, 14) + `<circle cx="${x + 83}" cy="44" r="17" fill="${C.T}"/>` + tc(x + 83, 50, i + 1, `font-weight="800" fill="#fff" font-size="15"`) + tc(x + 83, 88, h, `font-weight="800" fill="${C.TI}" font-size="13.5"`) + tc(x + 83, 114, l1, `font-size="12"`) + tc(x + 83, 132, l2, `font-size="12"`); });
    b += box(14, 176, 692, 64, '#fff', C.LINE, 12) + t(30, 200, 'Последствия мутаций:', `font-weight="800" font-size="13"`);
        b += `<rect x="30" y="212" width="480" height="16" rx="8" fill="${C.RED}" opacity=".85"/><rect x="514" y="212" width="12" height="16" rx="4" fill="${C.GR2}"/>` + tc(270, 225, 'вредные и нейтральные — подавляющее большинство', `font-size="11" fill="#fff" font-weight="700"`) + t(534, 225, 'полезные — крайне редко', `font-size="11" fill="${C.GR2}" font-weight="700"`);
    return svg(720, 254, b);
  })();

  // 3. Соматические и генеративные
  S.g9_soma = (() => {
    let b = box(14, 14, 340, 250, C.AMBS, C.AMB, 14) + tc(184, 42, 'СОМАТИЧЕСКИЕ', `font-weight="800" fill="#a86f00" font-size="15"`) + tc(184, 60, 'в клетках тела', `font-size="12" fill="${C.MUT}"`);
    const cell = (x, y, r, bad) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${bad ? '#f6b7a0' : '#fde6c6'}" stroke="${bad ? C.RED : '#d7b27a'}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r * .38}" fill="${bad ? C.RED : '#c79a5a'}"/>`;
    b += cell(70, 120, 18) + cell(110, 104, 18) + cell(108, 142, 18, 1) + cell(150, 122, 18);
    b += arrow(176, 122, 206, 122, C.GR);
    [[238, 100], [262, 120], [236, 140], [270, 92], [284, 146], [300, 116], [258, 160], [226, 120]].forEach(([x, y]) => { b += cell(x, y, 14, 1); });
    b += tc(110, 182, 'мутация в одной клетке', `font-size="11.5" fill="${C.MUT}"`) + tc(262, 186, 'митоз → опухоль', `font-size="11.5" fill="${C.RED}" font-weight="700"`);
    b += tc(184, 222, 'передаётся только дочерним клеткам,', `font-size="12.5" font-weight="700"`) + tc(184, 242, 'детям — НЕТ', `font-size="12.5" font-weight="800" fill="#a86f00"`);
    b += box(366, 14, 340, 250, C.TS, C.T, 14) + tc(536, 42, 'ГЕНЕРАТИВНЫЕ', `font-weight="800" fill="${C.TI}" font-size="15"`) + tc(536, 60, 'в половых клетках', `font-size="12" fill="${C.MUT}"`);
    b += `<ellipse cx="410" cy="120" rx="10" ry="7" fill="${C.RED}"/><path d="M400 120 q-12 -8 -22 0" stroke="${C.RED}" stroke-width="2" fill="none"/>` + tc(400, 146, 'гамета', `font-size="11" fill="${C.MUT}"`) + tc(400, 160, 'с мутацией', `font-size="11" fill="${C.RED}"`);
    b += arrow(428, 120, 458, 120, C.GR) + `<circle cx="486" cy="120" r="20" fill="${C.PINKS}" stroke="${C.RED}" stroke-width="2"/>` + tc(486, 125, 'зигота', `font-size="10.5" fill="${C.RED}" font-weight="700"`) + arrow(510, 120, 540, 120, C.GR);
    // ребёнок — все клетки
    b += `<circle cx="600" cy="98" r="15" fill="#fde6c6" stroke="${C.RED}" stroke-width="2"/><rect x="584" y="116" width="32" height="44" rx="12" fill="#fde6c6" stroke="${C.RED}" stroke-width="2"/>`;
    [[594, 130], [606, 140], [596, 150], [604, 124]].forEach(([x, y]) => { b += `<circle cx="${x}" cy="${y}" r="3" fill="${C.RED}"/>`; });
    b += tc(600, 180, 'мутация во ВСЕХ', `font-size="11.5" fill="${C.RED}" font-weight="700"`) + tc(600, 194, 'клетках ребёнка', `font-size="11.5" fill="${C.RED}" font-weight="700"`);
    b += tc(536, 222, 'передаётся потомству →', `font-size="12.5" font-weight="700"`) + tc(536, 242, 'наследственные болезни', `font-size="12.5" font-weight="800" fill="${C.TI}"`);
    return svg(720, 278, b);
  })();

  // 4. Три уровня мутаций
  S.g9_levels = (() => {
    let b = '';
    const card = (x, col, soft, n, h, sub, lvl, ex) => box(x, 14, 222, 246, soft, col, 14) + tc(x + 111, 42, n + '. ' + h, `font-weight="800" fill="${col}" font-size="15"`) + tc(x + 111, 60, sub, `font-size="12" fill="${C.MUT}"`) + tc(x + 111, 210, lvl, `font-size="12.5" font-weight="700"`) + tc(x + 111, 232, ex, `font-size="12" fill="${C.MUT}"`);
    b += card(14, C.GR2, '#e8f6ec', 1, 'Генные', '(точковые)', 'нуклеотиды внутри гена', 'ФКУ, муковисцидоз, альбинизм');
    ['A', 'T', 'G', 'C', 'A'].forEach((l, i) => { b += nuc(44 + i * 33, 96, l, 28, i === 2 ? 1 : 0); });
    b += tc(125, 150, '↑ одна «буква»', `font-size="12" fill="${C.GR2}" font-weight="700"`) + tc(125, 168, 'в ДНК', `font-size="12" fill="${C.GR2}" font-weight="700"`);
    b += card(249, C.AMB, C.AMBS, 2, 'Хромосомные', '(аберрации)', 'структура хромосомы', '«кошачий крик» (делеция 5p)');
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((l, i) => { const del = l === 'C'; b += `<rect x="${282 + i * 26}" y="96" width="24" height="30" rx="${i === 0 || i === 5 ? 10 : 3}" fill="${del ? '#fff' : '#f0c36a'}" stroke="${del ? C.RED : '#d29a20'}" stroke-width="1.6" ${del ? 'stroke-dasharray="4 3"' : ''}/>` + tc(294 + i * 26, 116, l, `font-weight="800" font-size="13" fill="${del ? C.RED : C.TX}"`); });
    b += tc(360, 150, 'участок C утрачен', `font-size="12" fill="#a86f00" font-weight="700"`) + tc(360, 168, '(видно в микроскоп)', `font-size="12" fill="#a86f00"`);
    b += card(484, C.RED, '#fde3e5', 3, 'Геномные', 'число хромосом', 'сколько хромосом в наборе', 'Даун, Тернер, Клайнфельтер');
    b += chrom(548, 84, 60, C.TL, .35, 13) + chrom(566, 84, 60, C.TL, .35, 13) + chrom(584, 84, 60, C.RED, .35, 13);
    b += tc(595, 168, 'лишняя хромосома (47)', `font-size="12" fill="${C.RED}" font-weight="700"`);
    b += t(612, 120, '+1', `font-size="18" font-weight="800" fill="${C.RED}"`);
    return svg(720, 274, b);
  })();

  // 5. Генные мутации: замена, выпадение, вставка
  S.g9_point = (() => {
    const seqRow = (y, label, seq, col, mark, note, words) => {
      let g = t(18, y + 19, label, `font-weight="800" font-size="13.5" fill="${col}"`);
      let x = 140;
      seq.forEach((l, i) => { if (i && i % 3 === 0) x += 10; if (l === '_') { g += `<rect x="${x}" y="${y}" width="25" height="28" rx="6" fill="#fff" stroke="${C.RED}" stroke-width="2" stroke-dasharray="4 3"/>`; } else g += nuc(x, y, l, 25, mark.includes(i)); x += 28; });
      g += t(x + 14, y + 13, note[0], `font-size="12" fill="${col}" font-weight="800"`) + t(x + 14, y + 29, note[1], `font-size="11.5" fill="${C.MUT}"`);
      let wx = 140; words.forEach((w, i) => { g += tc(wx + 40, y + 46, w, `font-size="12" font-weight="800" fill="${/[✗?]/.test(w) ? C.RED : C.TI}"`); wx += 94; });
      return g;
    };
    let b = tc(360, 24, 'ДНК читается тройками нуклеотидов (триплетами) — как фраза из трёхбуквенных слов', `font-size="12.5" fill="${C.MUT}"`);
    b += seqRow(40, 'Норма', 'TACGGTAAGCAT'.split(''), C.TI, [], ['всё правильно', 'нормальный белок'], ['КОТ', 'БЫЛ', 'СЕР', '·']);
    b += seqRow(108, 'Замена', 'TACGGTAACCAT'.split(''), C.AMB, [8], ['одна «буква»', 'одно слово испорчено'], ['КОТ', 'БЫЛ', 'СЕ✗', '·']);
    b += seqRow(176, 'Выпадение', 'TACGTAAGCAT'.split(''), C.RED, [], ['G выпал →', 'сдвиг рамки'], ['КОТ', 'ЫЛС', 'ЕР?', '???']);
    b += seqRow(244, 'Вставка', 'TACGGGTAAGCAT'.split(''), C.RED, [5], ['лишний G →', 'сдвиг рамки'], ['КОТ', 'ББЫ', 'ЛСЕ', 'Р??']);
    b += box(14, 304, 692, 40, C.TS, C.T, 10, 1.2) + tc(360, 329, 'Выпадение или вставка сдвигают рамку считывания на рибосоме → абсолютно дефектный белок', `font-size="12.5" fill="${C.TI}" font-weight="800"`);
    return svg(720, 356, b);
  })();

  // 6. Хромосомные перестройки
  S.g9_aberr = (() => {
    const seg = (x, y, letters, cols, opts = {}) => { let g = ''; letters.forEach((l, i) => { const c = cols[i] || '#bfe9de'; const first = i === 0, last = i === letters.length - 1; g += `<rect x="${x + i * 25}" y="${y}" width="23" height="28" rx="${first || last ? 11 : 3}" fill="${c}" stroke="${opts.stroke && opts.stroke.includes(i) ? C.RED : 'none'}" stroke-width="2.4"/>` + tc(x + i * 25 + 11.5, y + 19, l, `font-weight="800" font-size="13"`); }); return g; };
    const N = 'ABCDEFG'.split(''), base = N.map(() => C.TL);
    let b = t(160, 26, 'норма', `font-size="12" fill="${C.MUT}" font-weight="700"`) + t(470, 26, 'после мутации', `font-size="12" fill="${C.MUT}" font-weight="700"`);
    const rows = [
      ['Делеция', 'утрата участка', N, 'ABDEFG'.split(''), [], 'C'],
      ['Дупликация', 'удвоение участка', N, 'ABCCDEFG'.split(''), [2, 3], ''],
      ['Инверсия', 'поворот на 180°', N, 'ABEDCFG'.split(''), [2, 3, 4], ''],
    ];
    rows.forEach(([h, sub, a, m, st, lost], i) => {
      const y = 40 + i * 62;
      b += t(18, y + 14, h, `font-weight="800" font-size="13.5" fill="${C.TI}"`) + t(18, y + 31, sub, `font-size="11.5" fill="${C.MUT}"`);
      b += seg(150, y, a, base) + arrow(330, y + 14, 380, y + 14, C.GR) + seg(400, y, m, m.map((l, k) => st.includes(k) ? C.AMB : C.TL), { stroke: st });
      if (lost) b += t(560, y + 19, '✗ C потерян', `font-size="12" fill="${C.RED}" font-weight="800"`);
    });
    // транслокация
    const y = 226;
    b += t(18, y + 14, 'Транслокация', `font-weight="800" font-size="13.5" fill="${C.TI}"`) + t(18, y + 31, 'перенос на', `font-size="11.5" fill="${C.MUT}"`) + t(18, y + 46, 'негомологичную', `font-size="11.5" fill="${C.MUT}"`);
    const P = 'MNOPQ'.split('');
    b += seg(150, y - 6, N, base) + seg(150, y + 28, P, P.map(() => '#c9d8f5'));
    b += arrow(330, y + 22, 380, y + 22, C.GR);
    b += seg(400, y - 6, 'ABCDE'.split(''), 'ABCDE'.split('').map(() => C.TL)) + seg(400, y + 28, 'MNOPQFG'.split(''), ['#c9d8f5', '#c9d8f5', '#c9d8f5', '#c9d8f5', '#c9d8f5', C.AMB, C.AMB], { stroke: [5, 6] });
    b += t(590, y + 47, '← FG «переехали»', `font-size="12" fill="#a86f00" font-weight="800"`);
    return svg(720, 300, b);
  })();

  // 7. Геномные мутации
  S.g9_genome = (() => {
    const set = (x, y, cols, lab, sub, col) => { let g = ''; cols.forEach((c, i) => { g += chrom(x + i * 18, y, 64, c, .35, 13); }); return g + tc(x + (cols.length * 18 - 5) / 2, y + 88, lab, `font-weight="800" font-size="14" fill="${col}"`) + tc(x + (cols.length * 18 - 5) / 2, y + 106, sub, `font-size="11.5" fill="${C.MUT}"`); };
    let b = tc(105, 34, 'Норма', `font-weight="800" fill="${C.TI}" font-size="14"`) + set(84, 52, [C.TL, C.TL], '2n = 46', 'пара хромосом', C.TI);
    b += `<line x1="196" y1="20" x2="196" y2="240" stroke="${C.LINE}" stroke-width="2"/>`;
    b += tc(330, 34, 'Анеуплоидия (гетероплоидия)', `font-weight="800" fill="${C.RED}" font-size="14"`) + tc(330, 52, 'меняется число отдельных хромосом', `font-size="11.5" fill="${C.MUT}"`);
    b += set(240, 70, [C.TL, C.TL, C.RED], 'Трисомия', '2n + 1 = 47', C.RED) + set(386, 70, [C.TL], 'Моносомия', '2n − 1 = 45', C.RED);
    b += `<rect x="404" y="70" width="13" height="64" rx="6.5" fill="none" stroke="${C.RED}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    b += `<line x1="470" y1="20" x2="470" y2="240" stroke="${C.LINE}" stroke-width="2"/>`;
    b += tc(590, 34, 'Полиплоидия', `font-weight="800" fill="${C.AMB}" font-size="14"`) + tc(590, 52, 'кратно n: 3n, 4n', `font-size="11.5" fill="${C.MUT}"`);
    b += set(552, 70, [C.TL, C.TL, C.AMB], '3n = 69', 'у человека летальна', C.AMB);
    b += box(14, 196, 692, 50, C.TS, C.T, 10, 1.2) + tc(360, 217, 'Анеуплоидии — хромосомные болезни (Даун, Эдвардс, Патау, Тернер, Клайнфельтер).', `font-size="12.5" fill="${C.TI}" font-weight="700"`) + tc(360, 235, 'Полная полиплоидия у человека — эмбрион погибает внутриутробно.', `font-size="12.5" fill="${C.TI}" font-weight="700"`);
    return svg(720, 258, b);
  })();

  // 8. Нерасхождение хромосом в мейозе
  S.g9_nondisj = (() => {
    const cellC = (x, y, r, chroms, lab, col = C.T) => { let g = `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.TS}" stroke="${col}" stroke-width="1.8"/>`; const n = chroms.length; chroms.forEach((c, i) => { g += chrom(x - n * 7 + i * 14 + 1, y - 18, 36, c, .35, 11); }); if (!n) g += tc(x, y + 5, '∅', `font-size="20" fill="${C.RED}"`); return g + tc(x, y + r + 18, lab, `font-size="12" font-weight="800" fill="${col}"`); };
    let b = t(16, 28, 'Норма', `font-weight="800" fill="${C.TI}" font-size="13.5"`) + t(370, 28, 'Нерасхождение', `font-weight="800" fill="${C.RED}" font-size="13.5"`);
    b += cellC(80, 100, 34, [C.BLUE, C.PINK], 'пара') + arrow(118, 86, 160, 66) + arrow(118, 114, 160, 134) + cellC(190, 60, 26, [C.BLUE], 'n') + cellC(190, 146, 26, [C.PINK], 'n');
    b += arrow(220, 60, 256, 60, C.GR) + tc(290, 64, '46 ✓', `font-weight="800" fill="${C.TI}"`);
    b += `<line x1="350" y1="20" x2="350" y2="200" stroke="${C.LINE}" stroke-width="2"/>`;
    b += cellC(430, 100, 34, [C.BLUE, C.PINK], 'пара', C.RED) + arrow(468, 86, 510, 66, C.RED) + arrow(468, 114, 510, 134, C.RED) + cellC(540, 60, 26, [C.BLUE, C.PINK], 'n + 1', C.RED) + cellC(540, 146, 26, [], 'n − 1', C.RED);
    b += arrow(570, 60, 600, 60, C.GR) + t(608, 56, '+ гамета →', `font-size="11.5" fill="${C.MUT}"`) + t(608, 72, '47, трисомия', `font-size="12.5" font-weight="800" fill="${C.RED}"`);
    b += arrow(570, 146, 600, 146, C.GR) + t(608, 142, '+ гамета →', `font-size="11.5" fill="${C.MUT}"`) + t(608, 158, '45, моносомия', `font-size="12.5" font-weight="800" fill="${C.RED}"`);
    b += box(14, 206, 692, 34, C.TS, C.T, 10, 1.2) + tc(360, 228, 'Геномные мутации возникают из-за нарушения расхождения хромосом в анафазе мейоза или митоза', `font-size="12.5" fill="${C.TI}" font-weight="700"`);
    return svg(720, 252, b);
  })();

  // 9. Кариотип при синдроме Дауна
  S.g9_down = (() => {
    let b = '';
    for (let i = 0; i < 22; i++) {
      const row = i < 11 ? 0 : 1, col = i % 11, x = 24 + col * 50, base = row ? 222 : 112;
      const h = Math.round(80 - i * 2.2), cen = [.48, .45, .47, .3, .3, .38, .37, .33, .34, .33, .4, .3, .15, .15, .15, .43, .32, .3, .45, .45, .2, .2][i];
      const n = i === 20 ? 3 : 2, c = i === 20 ? C.RED : C.TL;
      for (let k = 0; k < n; k++) b += chrom(x + k * 12 - (n === 3 ? 6 : 0), base - h, h, c, cen, 9);
      b += tc(x + 10, base + 15, i + 1, `font-size="11" fill="${i === 20 ? C.RED : C.MUT}" font-weight="${i === 20 ? 800 : 700}"`);
    }
    b += box(580, 40, 126, 190, C.PINKS, C.PINK, 12, 1.2) + tc(643, 64, 'XX', `font-weight="800" fill="${C.PINK}" font-size="14"`) + chrom(626, 80, 74, C.PINK, .4, 11) + chrom(648, 80, 74, C.PINK, .4, 11);
    b += tc(643, 184, '47, XX, +21', `font-weight="800" font-size="13" fill="${C.RED}"`) + tc(643, 204, 'трисомия 21', `font-size="11.5" fill="${C.MUT}"`);
    b += `<rect x="452" y="176" width="64" height="66" rx="12" fill="none" stroke="${C.RED}" stroke-width="2.4"/>`;
    return svg(720, 248, b);
  })();

  // 10. Физические мутагены
  S.g9_phys = (() => {
    let b = '';
    // ионизирующее
    b += box(14, 14, 222, 240, '#fff', C.LINE, 14) + tc(125, 40, 'Ионизирующее', `font-weight="800" fill="${C.TI}" font-size="13.5"`) + tc(125, 56, 'рентген, гамма, изотопы', `font-size="11.5" fill="${C.MUT}"`);
    b += `<path d="M40 100 l20 -6 l-10 14 l22 -6 l-10 14 l26 -8" stroke="${C.AMB}" stroke-width="3" fill="none"/>`;
    b += `<path d="M110 80 v40" stroke="${C.BLUE}" stroke-width="6" stroke-linecap="round"/><path d="M128 80 v14" stroke="${C.BLUE}" stroke-width="6" stroke-linecap="round"/><path d="M128 108 v12" stroke="${C.BLUE}" stroke-width="6" stroke-linecap="round"/><path d="M122 99 l12 4" stroke="${C.RED}" stroke-width="3"/>`;
    b += [[160, 86], [176, 104], [158, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.RED}"/><path d="M${x - 8} ${y} h-6 M${x + 8} ${y} h6 M${x} ${y - 8} v-6" stroke="${C.RED}" stroke-width="1.5"/>`).join('');
    b += tc(125, 150, 'выбивают электроны →', `font-size="11.5"`) + tc(125, 166, 'свободные радикалы →', `font-size="11.5"`) + tc(125, 182, 'разрыв связей в ДНК', `font-size="11.5"`) + tc(125, 212, 'хромосомные', `font-size="12.5" font-weight="800" fill="${C.RED}"`) + tc(125, 230, 'аберрации', `font-size="12.5" font-weight="800" fill="${C.RED}"`);
    // УФ
    b += box(249, 14, 222, 240, '#fff', C.LINE, 14) + tc(360, 40, 'Ультрафиолет (УФ)', `font-weight="800" fill="${C.TI}" font-size="13.5"`) + tc(360, 56, 'меньше проникает — кожа', `font-size="11.5" fill="${C.MUT}"`);
    b += `<line x1="276" y1="76" x2="444" y2="76" stroke="${C.BLUE}" stroke-width="3"/><line x1="276" y1="134" x2="444" y2="134" stroke="${C.BLUE}" stroke-width="3"/>`;
    ['A', 'T', 'T', 'G'].forEach((l, i) => { const x = 290 + i * 40, isT = l === 'T'; b += `<rect x="${x}" y="78" width="26" height="24" rx="5" fill="${NUC[l]}"/>` + tc(x + 13, 95, l, `font-weight="800" fill="#fff"`) + `<rect x="${x}" y="108" width="26" height="24" rx="5" fill="#ddd"/>`; });
    b += `<path d="M355 90 h16" stroke="${C.TX}" stroke-width="6"/>`;
    b += tc(360, 158, 'склеивает соседние тимины:', `font-size="11.5"`) + tc(360, 174, 'тиминовый димер (Т=Т)', `font-size="12" font-weight="800"`) + tc(360, 212, 'меланома,', `font-size="12.5" font-weight="800" fill="${C.RED}"`) + tc(360, 230, 'рак кожи', `font-size="12.5" font-weight="800" fill="${C.RED}"`);
    // температура
    b += box(484, 14, 222, 240, '#fff', C.LINE, 14) + tc(595, 40, 'Высокая температура', `font-weight="800" fill="${C.TI}" font-size="13.5"`);
    b += `<path d="M540 80 q14 -10 28 0 t28 0 t28 0" stroke="${C.GR2}" stroke-width="5" fill="none"/>` + tc(595, 104, 'фермент', `font-size="11.5" fill="${C.MUT}"`) + arrow(595, 112, 595, 128, C.RED) + `<path d="M545 140 l12 8 l-8 6 l16 4 l-10 8 l22 -2 l-6 8 l20 -4" stroke="${C.GR2}" stroke-width="4" fill="none"/>`;
    b += tc(595, 192, 'денатурация ферментов', `font-size="11.5"`) + tc(595, 208, 'репликации и репарации', `font-size="11.5"`) + tc(595, 232, 'больше ошибок в ДНК', `font-size="12.5" font-weight="800" fill="${C.RED}"`);
    return svg(720, 268, b);
  })();

  // 11. Сводная схема мутагенов
  S.g9_mutagens = (() => {
    const col = (x, c, soft, h, items) => box(x, 14, 222, 232, soft, c, 14) + tc(x + 111, 42, h, `font-weight="800" fill="${c}" font-size="15"`) + items.map((s, i) => t(s.startsWith('   ') ? x + 28 : x + 16, 74 + i * 22, s.trim(), `font-size="12.3"`)).join('');
    let b = col(14, C.BLUE, C.BLUES, 'ФИЗИЧЕСКИЕ', ['• ионизирующее излучение:', '   рентген, гамма-лучи,', '   радиоактивные изотопы', '• ультрафиолет (УФ)', '• повышенная температура']);
    b += col(249, C.AMB, C.AMBS, 'ХИМИЧЕСКИЕ', ['• табак: никотин, смолы,', '   бензпирен', '• бензол, формальдегид,', '   пестициды', '• лекарства: цитостатики', '• нитриты, нитрозамины', '• аналоги азот. оснований']);
    b += col(484, C.GR2, '#e8f6ec', 'БИОЛОГИЧЕСКИЕ', ['• вирусы: краснуха,', '   гепатит B, ЦМВ,', '   ВПЧ, герпес', '• токсины грибов:', '   афлатоксин', '   (плесень Аспергилл)']);
    return svg(720, 260, b);
  })();

  // 12. Антимутагенез
  S.g9_repair = (() => {
    let b = box(14, 14, 400, 236, '#fff', C.LINE, 14) + tc(214, 40, '1. Репарация ДНК', `font-weight="800" fill="${C.TI}" font-size="14.5"`) + tc(214, 58, 'ферменты вырезают повреждение', `font-size="11.5" fill="${C.MUT}"`);
    const strand = (y, letters, bad, gap) => letters.split('').map((l, i) => { if (gap && gap.includes(i)) return `<rect x="${54 + i * 30}" y="${y}" width="26" height="24" rx="5" fill="#fff" stroke="${C.GR}" stroke-dasharray="3 3"/>`; return `<rect x="${54 + i * 30}" y="${y}" width="26" height="24" rx="5" fill="${bad && bad.includes(i) ? C.RED : NUC[l]}"/>` + tc(67 + i * 30, y + 17, bad && bad.includes(i) ? '✗' : l, `font-weight="800" fill="#fff" font-size="12.5"`); }).join('');
    b += t(26, 92, '①', `font-size="14" fill="${C.MUT}"`) + strand(76, 'ATGCATGCAT', [4, 5]);
    b += t(26, 140, '②', `font-size="14" fill="${C.MUT}"`) + strand(124, 'ATGCATGCAT', null, [4, 5]) + `<text x="186" y="118" font-size="18">✂</text>`;
    b += t(26, 188, '③', `font-size="14" fill="${C.MUT}"`) + strand(172, 'ATGCATGCAT');
    b += tc(214, 224, 'повреждённый участок заменён правильным', `font-size="12" font-weight="700" fill="${C.TI}"`);
    b += box(428, 14, 278, 236, C.TS, C.T, 14) + tc(567, 40, '2. Иммунный контроль', `font-weight="800" fill="${C.TI}" font-size="14.5"`) + tc(567, 58, 'Т-лимфоциты', `font-size="11.5" fill="${C.MUT}"`);
    b += `<circle cx="500" cy="134" r="34" fill="#c9b2d6" stroke="#7a5a95" stroke-width="2"/><circle cx="496" cy="132" r="22" fill="#9b7ab6"/>` + tc(500, 190, 'Т-лимфоцит', `font-size="11.5" font-weight="700"`);
    b += arrow(540, 134, 586, 134, C.RED, 3);
    b += `<path d="M620 100 q30 -6 40 20 q12 30 -14 44 q-30 10 -46 -10 q-14 -24 2 -44z" fill="#f2b98a" stroke="${C.RED}" stroke-width="2"/><circle cx="632" cy="132" r="14" fill="${C.RED}" opacity=".7"/>` + tc(636, 190, 'клетка с мутацией', `font-size="11.5" font-weight="700" fill="${C.RED}"`);
    b += tc(567, 224, 'распознаёт и уничтожает', `font-size="12" font-weight="700" fill="${C.TI}"`);
    return svg(720, 264, b);
  })();

  return S;
})());
