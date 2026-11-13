// ===== СХЕМЫ ДЛЯ ГЕНЕТИКИ, ЛЕКЦИЯ 10: роль генотипа и среды, фенокопии (собственные схемы) =====
Object.assign(SVG_EXTRA, (() => {
  const { C, svg, t, tc, box, arrow, title } = window.G79;
  const S = {};
  // маленькая двойная спираль ДНК; bad — красная метка мутации
  const dna = (x, y, w, h, bad) => {
    let p1 = '', p2 = '', r = '';
    for (let i = 0; i <= 24; i++) { const xx = x + w * i / 24, a = Math.sin(i / 24 * Math.PI * 3) * h / 2; p1 += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + (y + a).toFixed(1); p2 += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + (y - a).toFixed(1); if (i % 2 && i < 24) r += `<path d="M${xx.toFixed(1)} ${(y + a).toFixed(1)} L${xx.toFixed(1)} ${(y - a).toFixed(1)}" stroke="${bad && i === 11 ? C.RED : C.TL}" stroke-width="${bad && i === 11 ? 4 : 2}"/>`; }
    return r + `<path d="${p1}" stroke="${C.T}" stroke-width="3" fill="none"/><path d="${p2}" stroke="${C.AQ}" stroke-width="3" fill="none"/>` + (bad ? `<circle cx="${x + w * 11 / 24}" cy="${y}" r="11" fill="none" stroke="${C.RED}" stroke-width="2.2"/>` : '');
  };
  // человечек
  const person = (x, y, s = 1, c = C.T, fill = '#fff') => `<circle cx="${x}" cy="${y - 30 * s}" r="${11 * s}" fill="${fill}" stroke="${c}" stroke-width="2.2"/><path d="M${x - 16 * s} ${y + 14 * s} Q${x - 16 * s} ${y - 16 * s} ${x} ${y - 16 * s} Q${x + 16 * s} ${y - 16 * s} ${x + 16 * s} ${y + 14 * s} Z" fill="${fill}" stroke="${c}" stroke-width="2.2"/>`;
  const tag = (x, y, w, s, fill, col) => box(x - w / 2, y - 15, w, 26, fill, col, 13, 1.4) + tc(x, y + 3, s, `font-size="12" font-weight="800" fill="${col}"`);

  // 0. Генотип + среда = фенотип
  S.g10_formula = (() => {
    let b = box(14, 14, 200, 150, C.TS, C.T, 16) + title(114, 42, 'ГЕНОТИП') + dna(44, 92, 140, 34) + tc(114, 150, 'программа (ДНК)', `font-size="12" fill="${C.MUT}"`);
    b += tc(237, 100, '+', `font-size="34" font-weight="800" fill="${C.TI}"`);
    b += box(260, 14, 200, 150, C.AMBS, C.AMB, 16) + title(360, 42, 'СРЕДА', '#a86f00');
    // солнце, капля, яблоко — условия
    b += `<circle cx="310" cy="92" r="14" fill="#ffd34d"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return `<path d="M${(310 + 18 * Math.cos(r)).toFixed(1)} ${(92 + 18 * Math.sin(r)).toFixed(1)} L${(310 + 25 * Math.cos(r)).toFixed(1)} ${(92 + 25 * Math.sin(r)).toFixed(1)}" stroke="#f0b400" stroke-width="2.5"/>`; }).join('');
    b += `<path d="M360 70 Q374 92 374 100 A14 14 0 0 1 346 100 Q346 92 360 70Z" fill="#7cc4ef"/>`;
    b += `<circle cx="412" cy="98" r="16" fill="#ef6b5b"/><path d="M412 82 q4 -8 10 -8" stroke="#3f8f4d" stroke-width="2.5" fill="none"/>`;
    b += tc(360, 150, 'питание, инфекции, лекарства…', `font-size="11" fill="${C.MUT}"`);
    b += tc(483, 100, '=', `font-size="34" font-weight="800" fill="${C.TI}"`);
    b += box(506, 14, 200, 150, '#fff', C.T, 16, 2.2) + title(606, 42, 'ФЕНОТИП') + person(606, 110, 1.15) + tc(606, 150, 'внешность, анатомия, биохимия', `font-size="11.5" fill="${C.MUT}"`);
    b += box(14, 176, 692, 40, '#f5f8f7', C.LINE, 12) + tc(360, 201, 'Признак и большинство болезней — результат непрерывного взаимодействия генотипа и среды', `font-size="13" font-weight="700" fill="${C.TI}"`);
    return svg(720, 230, b);
  })();

  // 1. Три группы болезней
  S.g10_spectrum = (() => {
    let b = `<defs><linearGradient id="g10g" x1="0" x2="1"><stop offset="0" stop-color="${C.T}"/><stop offset=".5" stop-color="#8fb98a"/><stop offset="1" stop-color="${C.AMB}"/></linearGradient></defs>`;
    b += `<rect x="40" y="40" width="640" height="16" rx="8" fill="url(#g10g)"/>` + t(40, 30, 'роль ГЕНОТИПА', `font-size="12.5" font-weight="800" fill="${C.TI}"`) + t(680, 30, 'роль СРЕДЫ', `font-size="12.5" font-weight="800" fill="#a86f00" text-anchor="end"`);
    const cols = [
      [126, C.TS, C.T, C.TI, '1. НАСЛЕДСТВЕННЫЕ', 'детерминированы генотипом', ['болезнь предопределена', 'на 100% (ген, хромосомы);', 'среда влияет только', 'на тяжесть симптомов'], 'Даун, Клайнфельтер, гемофилия, дальтонизм, муковисцидоз, ахондроплазия'],
      [360, '#eef6e6', '#6aa84f', '#3d6e2b', '2. МУЛЬТИФАКТОРНЫЕ', 'наследственное предрасположение', ['гены создают уязвимость,', 'болезнь запускают', '«триггеры» среды', '— самая массовая группа'], 'гипертония, диабет II типа, ИБС, астма, язва желудка, шизофрения'],
      [594, C.AMBS, C.AMB, '#a86f00', '3. ЭКЗОГЕННЫЕ', 'средовые', ['вызваны мощным внешним', 'агентом; гены влияют', 'лишь на скорость', 'выздоровления'], 'травмы, переломы, ожоги, отравления, холера, чума'],
    ];
    cols.forEach(([x, f, s, ink, h, sub, lines, ex]) => {
      b += `<path d="M${x} 58 L${x} 72" stroke="${s}" stroke-width="2.5"/>` + box(x - 110, 74, 220, 250, f, s, 14);
      b += tc(x, 100, h, `font-weight="800" fill="${ink}" font-size="14"`) + tc(x, 118, sub, `font-size="11.5" fill="${C.MUT}"`);
      lines.forEach((l, i) => { b += tc(x, 146 + i * 18, l, `font-size="12.5"`); });
      b += `<rect x="${x - 98}" y="228" width="196" height="84" rx="10" fill="#fff"/>` + tc(x, 246, 'Примеры:', `font-size="11" font-weight="800" fill="${ink}"`);
      const w = ex.split(' '); let line = '', ls = [];
      w.forEach(word => { if ((line + ' ' + word).trim().length > 30) { ls.push(line.trim()); line = word; } else line += ' ' + word; }); ls.push(line.trim());
      ls.forEach((l, i) => { b += tc(x, 264 + i * 16, l, `font-size="11.5"`); });
    });
    return svg(720, 338, b);
  })();

  // 2. Мультифакторная болезнь: предрасположенность + триггеры
  S.g10_trigger = (() => {
    const row = (y, trig) => {
      let b = box(14, y, 180, 96, C.TS, C.T, 14) + tc(104, y + 26, 'Гены:', `font-weight="800" fill="${C.TI}" font-size="13"`) + tc(104, y + 46, 'предрасположенность', `font-size="12"`) + tc(104, y + 62, '(уязвимый фон)', `font-size="11.5" fill="${C.MUT}"`) + dna(54, y + 80, 100, 12);
      b += tc(214, y + 56, '+', `font-size="28" font-weight="800" fill="${C.TI}"`);
      if (trig) {
        b += box(234, y, 250, 96, C.AMBS, C.AMB, 14) + tc(359, y + 24, 'ТРИГГЕРЫ СРЕДЫ', `font-weight="800" fill="#a86f00" font-size="13"`);
        ['стресс', 'гиподинамия', 'курение', 'инфекции', 'питание'].forEach((s, i) => { const xx = 241 + (i % 3) * 80, yy = y + 46 + Math.floor(i / 3) * 30; b += box(xx, yy - 14, 76, 24, '#fff', C.AMB, 12, 1.2) + tc(xx + 38, yy + 2, s, `font-size="11" font-weight="700"`); });
        b += arrow(492, y + 48, 532, y + 48, C.RED, 2.5) + box(540, y + 10, 166, 76, '#fde3e5', C.RED, 14) + tc(623, y + 44, 'БОЛЕЗНЬ', `font-weight="800" fill="${C.RED}" font-size="15"`) + tc(623, y + 64, 'развивается', `font-size="12" fill="${C.RED}"`);
      } else {
        b += box(234, y, 250, 96, '#fff', C.LINE, 14) + tc(359, y + 44, 'триггеров нет', `font-weight="800" fill="${C.MUT}" font-size="13"`) + tc(359, y + 64, '(здоровый образ жизни)', `font-size="12" fill="${C.MUT}"`);
        b += arrow(492, y + 48, 532, y + 48, C.GR2, 2.5) + box(540, y + 10, 166, 76, '#e7f6ea', C.GR2, 14) + tc(623, y + 40, 'болезнь может', `font-weight="800" fill="#2f7a45" font-size="13"`) + tc(623, y + 58, 'не развиться', `font-weight="800" fill="#2f7a45" font-size="13"`);
      }
      return b;
    };
    return svg(720, 230, row(14, 1) + row(120, 0));
  })();

  // 3. ФКУ: генотип aa, разная среда
  S.g10_pku = (() => {
    let b = title(360, 30, 'Генотип один и тот же — aa (фенилкетонурия)');
    const row = (y, good) => {
      let r = box(14, y, 120, 92, C.TS, C.T, 14) + tc(74, y + 40, 'aa', `font-size="26" font-weight="800" fill="${C.TI}"`) + tc(74, y + 66, 'генотип', `font-size="11.5" fill="${C.MUT}"`);
      r += arrow(140, y + 46, 168, y + 46, C.GR, 2);
      r += box(174, y, 220, 92, good ? '#e7f6ea' : C.AMBS, good ? C.GR2 : C.AMB, 14) + tc(284, y + 24, good ? 'ДИЕТА БЕЗ ФЕНИЛАЛАНИНА' : 'ОБЫЧНОЕ ПИТАНИЕ', `font-weight="800" font-size="12.5" fill="${good ? '#2f7a45' : '#a86f00'}"`);
      r += tc(284, y + 46, good ? 'с первых дней жизни' : 'стандартная среда', `font-size="12"`) + tc(284, y + 66, good ? '(среду изменила медицина)' : 'мясо, молоко, яйца…', `font-size="11.5" fill="${C.MUT}"`);
      r += arrow(400, y + 46, 428, y + 46, C.GR, 2);
      if (!good) r += box(434, y, 132, 92, '#fff', C.AMB, 14) + tc(500, y + 34, 'накопление', `font-size="12.5" font-weight="700"`) + tc(500, y + 52, 'токсинов', `font-size="12.5" font-weight="700"`) + tc(500, y + 72, 'в крови', `font-size="11.5" fill="${C.MUT}"`);
      else r += box(434, y, 132, 92, '#fff', C.GR2, 14) + tc(500, y + 42, 'токсины', `font-size="12.5" font-weight="700"`) + tc(500, y + 60, 'не копятся', `font-size="12.5" font-weight="700"`);
      r += arrow(572, y + 46, 596, y + 46, good ? C.GR2 : C.RED, 2.5);
      r += box(602, y, 104, 92, good ? '#e7f6ea' : '#fde3e5', good ? C.GR2 : C.RED, 14) + person(654, y + 52, .75, good ? C.GR2 : C.RED);
      r += tc(654, y + 82, good ? 'здоров' : 'олигофрения', `font-size="11.5" font-weight="800" fill="${good ? '#2f7a45' : C.RED}"`);
      return r;
    };
    b += row(46, 0) + row(150, 1);
    b += box(14, 254, 692, 36, '#f5f8f7', C.LINE, 12) + tc(360, 277, 'Генотип остался дефектным, но фенотип благодаря медицине стал нормальным', `font-size="13" font-weight="700" fill="${C.TI}"`);
    return svg(720, 304, b);
  })();

  // 4. Наследственная болезнь vs фенокопия
  S.g10_phenocopy = (() => {
    let b = '';
    const col = (x, head, sub, bad, cause, kids, kidsCol) => {
      let r = box(x, 14, 300, 300, bad ? '#fde3e5' : C.TS, bad ? C.RED : C.T, 16) + tc(x + 150, 42, head, `font-weight="800" font-size="15" fill="${bad ? C.RED : C.TI}"`) + tc(x + 150, 60, sub, `font-size="12" fill="${C.MUT}"`);
      r += box(x + 20, 74, 260, 66, '#fff', C.LINE, 12) + t(x + 34, 96, 'ДНК:', `font-weight="800" font-size="12.5"`) + dna(x + 84, 108, 120, 26, bad) + t(x + 214, 112, bad ? 'мутация' : 'норма', `font-weight="800" font-size="12.5" fill="${bad ? C.RED : '#2f7a45'}"`);
      r += box(x + 20, 150, 260, 50, '#fff', C.LINE, 12) + t(x + 34, 172, 'Причина:', `font-weight="800" font-size="12.5"`) + t(x + 34, 190, cause, `font-size="12"`);
      r += box(x + 20, 210, 260, 40, '#fff', C.LINE, 12) + t(x + 34, 235, 'Фенотип: врождённый порок', `font-size="12.5" font-weight="700"`);
      r += box(x + 20, 260, 260, 42, kidsCol === C.RED ? '#fff' : '#e7f6ea', kidsCol, 12) + tc(x + 150, 286, kids, `font-size="12.5" font-weight="800" fill="${kidsCol}"`);
      return r;
    };
    b += col(14, 'НАСЛЕДСТВЕННАЯ БОЛЕЗНЬ', 'изменён генотип', 1, 'мутантный ген / хромосомы', 'передаётся потомству', C.RED);
    b += col(406, 'ФЕНОКОПИЯ', 'генотип НЕ изменён', 0, 'тератоген в критический период', 'не передаётся потомству', '#2f7a45');
    b += box(322, 196, 76, 56, '#fff', C.TI, 12, 2) + tc(360, 220, '=', `font-size="22" font-weight="800" fill="${C.TI}"`) + tc(360, 240, 'снаружи', `font-size="10.5" fill="${C.MUT}"`);
    b += tc(360, 120, '≠', `font-size="28" font-weight="800" fill="${C.RED}"`) + tc(360, 140, 'внутри', `font-size="10.5" fill="${C.MUT}"`);
    return svg(720, 328, b);
  })();

  // 5. Критический период — I триместр
  S.g10_critical = (() => {
    let b = title(360, 30, 'Беременность: 40 недель, 3 триместра');
    const x0 = 40, W = 640, wk = n => x0 + W * n / 40;
    b += `<rect x="${wk(0)}" y="64" width="${wk(12) - wk(0)}" height="40" rx="10" fill="${C.RED}" opacity=".85"/><rect x="${wk(12) + 3}" y="64" width="${wk(27) - wk(12) - 3}" height="40" rx="10" fill="${C.TL}"/><rect x="${wk(27) + 3}" y="64" width="${wk(40) - wk(27) - 3}" height="40" rx="10" fill="${C.T}" opacity=".6"/>`;
    b += tc((wk(0) + wk(12)) / 2, 89, 'I триместр', `font-weight="800" fill="#fff" font-size="14"`) + tc((wk(12) + wk(27)) / 2, 89, 'II триместр', `font-weight="800" fill="${C.TI}" font-size="14"`) + tc((wk(27) + wk(40)) / 2, 89, 'III триместр', `font-weight="800" fill="#fff" font-size="14"`);
    [0, 12, 27, 40].forEach(n => { b += tc(wk(n), 124, n + ' нед.', `font-size="11" fill="${C.MUT}"`); });
    b += box(wk(0), 138, wk(12) - wk(0), 116, '#fde3e5', C.RED, 12) + tc((wk(0) + wk(12)) / 2, 160, 'КРИТИЧЕСКИЙ ПЕРИОД', `font-weight="800" fill="${C.RED}" font-size="12.5"`);
    ['закладка и активное', 'формирование органов', '(морфогенез):', 'сердце, мозг, глаза,', 'конечности'].forEach((s, i) => { b += tc((wk(0) + wk(12)) / 2, 180 + i * 15, s, `font-size="11.5"`); });
    b += box(wk(12) + 3, 138, wk(40) - wk(12) - 3, 116, '#f5f8f7', C.LINE, 12) + tc((wk(12) + wk(40)) / 2, 172, 'Органы уже заложены — плод растёт и созревает', `font-size="12.5" font-weight="700" fill="${C.TI}"`);
    b += tc((wk(12) + wk(40)) / 2, 198, 'Тератоген в I триместре → порок развития (фенокопия),', `font-size="12"`) + tc((wk(12) + wk(40)) / 2, 216, 'хотя ДНК плода нормальная', `font-size="12"`);
    b += tc((wk(12) + wk(40)) / 2, 240, 'Краснуха опасна в первые 12 недель — триада Грегга', `font-size="11.5" fill="${C.MUT}"`);
    return svg(720, 268, b);
  })();

  // 6. Алкогольный синдром плода
  S.g10_fas = (() => {
    let b = box(14, 14, 300, 290, '#fff', C.LINE, 16);
    // лицо
    b += `<ellipse cx="150" cy="160" rx="92" ry="112" fill="#fde6c6" stroke="#d7a86e" stroke-width="2"/>`;
    b += `<path d="M98 140 q16 -6 32 0" stroke="${C.TX}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M170 140 q16 -6 32 0" stroke="${C.TX}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    b += `<path d="M150 150 L144 196 Q150 202 158 196" stroke="#c99060" stroke-width="2" fill="none"/>`;
    b += `<path d="M138 210 Q150 206 162 210" stroke="#d7a86e" stroke-width="1.4" fill="none" opacity=".6"/>`;
    b += `<path d="M124 232 Q150 228 176 232 Q150 236 124 232Z" fill="#d86a6a" stroke="#b84d4d" stroke-width="1.2"/>`;
    // выноски
    const call = (x1, y1, x2, y2, s1, s2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.RED}" stroke-width="1.6"/><circle cx="${x1}" cy="${y1}" r="3.5" fill="${C.RED}"/>` + t(x2 + 6, y2 + 4, s1, `font-size="12.5" font-weight="800" fill="${C.RED}"`) + (s2 ? t(x2 + 6, y2 + 20, s2, `font-size="11.5" fill="${C.MUT}"`) : '');
    b += call(204, 138, 330, 90, 'короткие глазные щели', '') + call(150, 216, 330, 186, 'сглаженный', 'носогубной желобок') + call(176, 232, 330, 262, 'тонкая верхняя губа', '');
    b += box(500, 26, 206, 266, C.TS, C.T, 14) + tc(603, 52, 'А также:', `font-weight="800" fill="${C.TI}" font-size="13.5"`);
    [['задержка роста', ''], ['микроцефалия', '(маленькие череп и мозг)'], ['пороки сердца', ''], ['внешне похожи на', 'хромосомные аномалии']].forEach(([a, c], i) => { b += box(514, 66 + i * 54, 178, 46, '#fff', C.TL, 10) + tc(603, 86 + i * 54 + (c ? -2 : 6), a, `font-size="12.5" font-weight="700"`) + (c ? tc(603, 102 + i * 54, c, `font-size="11" fill="${C.MUT}"`) : ''); });
    return svg(720, 318, b);
  })();

  // 7. Фенокопия: риск для потомства
  S.g10_risk = (() => {
    let b = '';
    const col = (x, head, sub, dnaBad, risk, riskTxt, col) => {
      let r = box(x, 14, 340, 216, '#fff', col, 16, 2) + tc(x + 170, 40, head, `font-weight="800" font-size="14" fill="${col}"`) + tc(x + 170, 58, sub, `font-size="12" fill="${C.MUT}"`);
      r += dna(x + 30, 92, 120, 24, dnaBad) + t(x + 166, 97, dnaBad ? 'ДНК изменена' : 'ДНК здорова', `font-size="13" font-weight="800" fill="${dnaBad ? C.RED : '#2f7a45'}"`);
      r += t(x + 24, 140, 'Риск болезни у его детей:', `font-size="12.5" font-weight="700"`);
      r += `<rect x="${x + 24}" y="152" width="292" height="22" rx="11" fill="#eef1f0"/><rect x="${x + 24}" y="152" width="${292 * risk}" height="22" rx="11" fill="${col}"/>`;
      r += tc(x + 170, 200, riskTxt, `font-size="13" font-weight="800" fill="${col}"`);
      return r;
    };
    b += col(14, 'ИСТИННАЯ ГЕНЕТИЧЕСКАЯ ГЛУХОТА', 'наследственная болезнь', 1, .82, 'крайне высокий', C.RED);
    b += col(366, 'ГЛУХОТА-ФЕНОКОПИЯ', 'мать перенесла краснуху при беременности', 0, .07, 'общепопуляционный (низкий)', '#2f7a45');
    b += box(14, 242, 692, 66, C.TS, C.T, 14) + t(32, 268, 'Мать ребёнка с фенокопией:', `font-weight="800" font-size="13" fill="${C.TI}"`) + t(32, 290, 'виновата среда (инфекция, лекарство) → исключить фактор риска → следующий ребёнок здоров', `font-size="12.5"`);
    return svg(720, 322, b);
  })();

  return S;
})());
