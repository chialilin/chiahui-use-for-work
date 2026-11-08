'use strict';
/* 關卡 4：密度 — D = M / V，用密度辨認物質並判斷沉浮 */

GAMES.density = {
  id: 'density',
  island: 'measure',
  icon: '🧊',
  title: '密度偵探社',
  subtitle: '密度計算・沉浮判斷',
  intro: `<ul>
    <li>密度 = 質量 ÷ 體積：<b>D = M / V</b>，常用單位 g/cm³</li>
    <li>密度是物質的<b>特性</b>，可以用來辨認物質；同一種物質切成兩半，密度不變</li>
    <li>水的密度約為 <b>1 g/cm³</b></li>
    <li>物體密度 &lt; 液體密度 → <b>浮</b>；物體密度 &gt; 液體密度 → <b>沉</b></li>
    <li>會浮的物體用排水法時，可用細針把它壓入水中</li>
  </ul>`,
  how: '<p>共 4 個神秘物體，每個 3 步：算密度 → 查密度表找出物質 → 預測沉浮。</p>',

  async run(sh) {
    const MATS = [
      { n: '木頭', d: 0.6, c: '#c58b4c' }, { n: '冰', d: 0.9, c: '#b3e5fc' },
      { n: '玻璃', d: 2.5, c: '#80cbc4' }, { n: '鋁', d: 2.7, c: '#cfd8dc' },
      { n: '鐵', d: 7.9, c: '#757575' }, { n: '銅', d: 8.9, c: '#d07a3f' },
      { n: '鉛', d: 11.3, c: '#78909c' }, { n: '金', d: 19.3, c: '#ffd54f' },
    ];
    const WATER = { n: '水', d: 1.0, c: 'rgba(41,182,246,.55)' };
    const MERCURY = { n: '水銀', d: 13.6, c: 'rgba(176,190,197,.7)' };
    const byName = n => MATS.find(m => m.n === n);

    // 安排題目：第 1 題會浮、第 4 題是水銀
    const first = byName(U.pick(['木頭', '冰']));
    const last = byName(U.pick(['鐵', '銅', '鉛', '金']));
    const mid = U.shuffle(MATS.filter(m => m !== first && m !== last && m.d > 1)).slice(0, 2);
    const plan = [[first, WATER], [mid[0], WATER], [mid[1], WATER], [last, MERCURY]];

    const table = MATS.concat([WATER, MERCURY]).sort((a, b) => a.d - b.d)
      .map(m => `<div class="mat"><span>${m.n}</span><b>${m.d.toFixed(1)}</b></div>`).join('');

    for (let r = 0; r < plan.length; r++) {
      if (!sh.alive) return;
      sh.setRound(r + 1, plan.length);
      const [m, liq] = plan[r];
      const V = U.pick([10, 20, 25, 40, 50]);
      const M = U.round(m.d * V, 1);
      const V1 = U.rand(10, 30), V2 = V1 + V;
      const floater = m.d < 1;

      sh.stage.innerHTML = `
        <div class="card">
          <p class="q">🕵️ 神秘物體 <b>#${r + 1}</b>：算出密度，找出它是什麼！</p>
          <div class="data-grid">
            <div class="data"><span>⚖️ 天平測質量</span><b>M = ${U.fmt(M)} g</b></div>
            <div class="data"><span>🧪 排水法${floater ? '（細針壓入）' : ''}</span><b>${V1} → ${V2} mL</b></div>
          </div>
          <svg class="tank-svg" viewBox="0 0 300 170" role="img" aria-label="水槽">
            <rect x="30" y="18" width="240" height="144" rx="8" fill="rgba(236,239,241,.6)"/>
            <g class="dobj" style="transform:translate(132px,24px)">
              <rect width="36" height="36" rx="5" fill="#9e9e9e" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>
              <text x="18" y="25" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">?</text>
            </g>
            <rect x="32" y="70" width="236" height="90" fill="${liq.c}"/>
            <text x="258" y="88" text-anchor="end" font-size="13" font-weight="700" fill="${liq === WATER ? '#01579b' : '#37474f'}">${liq.n}（${liq.d.toFixed(1)}）</text>
            <rect x="30" y="18" width="240" height="144" rx="8" fill="none" stroke="#78909c" stroke-width="3"/>
          </svg>
          <p class="q step"></p>
          <div class="ask-host"></div>
          <div class="vol-log inline"></div>
          <details class="dtable" open><summary>📋 密度表（g/cm³）</summary><div class="mat-grid">${table}</div></details>
        </div>`;

      const $ = s => sh.stage.querySelector(s);
      const step = $('.step'), host = $('.ask-host'), log = $('.vol-log');
      let pts = 0;

      // 步驟 1：算密度
      step.innerHTML = '步驟 1/3：先算體積 V，再算密度 <b>D = M ÷ V</b>';
      const a = await U.askNumber(host, { label: 'D =', unit: 'g/cm³' });
      if (!sh.alive) return;
      const ok1 = Math.abs(a.value - m.d) <= 0.05 + 1e-9;
      if (ok1) { pts++; sh.add(); Sound.play('ok'); } else Sound.play('bad');
      U.addLog(log, ok1, `密度：${a.raw} g/cm³ ${ok1 ? '✓' : `✗　正確：${U.fmt(M)} ÷ ${V} = ${m.d} g/cm³`}`);

      // 步驟 2：辨認物質
      step.innerHTML = '步驟 2/3：對照密度表，它最可能是哪一種物質？';
      const opts = U.shuffle([m].concat(U.shuffle(MATS.filter(x => x !== m)).slice(0, 3)));
      const c = await U.askChoice(host, opts.map(o => o.n));
      if (!sh.alive) return;
      const ok2 = opts[c.index] === m;
      c.buttons[opts.indexOf(m)].classList.add('right');
      if (!ok2) c.button.classList.add('wrong');
      if (ok2) { pts++; sh.add(); Sound.play('ok'); } else Sound.play('bad');
      U.addLog(log, ok2, `物質：${opts[c.index].n} ${ok2 ? '✓' : `✗　正確：${m.n}（${m.d}）`}`);
      await U.sleep(700);

      // 步驟 3：沉浮
      step.innerHTML = `步驟 3/3：把它放進<b>${liq.n}</b>（密度 ${liq.d.toFixed(1)}）中，會怎樣？`;
      const f = await U.askChoice(host, ['⬆️ 浮起來', '⬇️ 沉下去']);
      if (!sh.alive) return;
      const floats = m.d < liq.d;
      const ok3 = (f.index === 0) === floats;
      f.buttons[floats ? 0 : 1].classList.add('right');
      if (!ok3) f.button.classList.add('wrong');
      if (ok3) { pts++; sh.add(); }

      // 動畫
      const objEl = $('.dobj');
      objEl.querySelector('rect').setAttribute('fill', m.c);
      const txt = objEl.querySelector('text');
      txt.textContent = m.n;
      txt.setAttribute('font-size', '12');
      txt.setAttribute('y', '22');
      txt.setAttribute('fill', ['冰', '鋁', '金', '玻璃'].includes(m.n) ? '#263238' : '#fff');
      const top = floats ? 70 - 36 * (1 - m.d / liq.d) : 123;
      Sound.play('splash');
      objEl.classList.add(floats ? 'float' : 'sink');
      objEl.style.transform = `translate(132px,${top}px)`;
      await U.sleep(1300);
      if (!sh.alive) return;

      await sh.feedback({
        ok: pts === 3,
        title: pts === 3 ? '🎉 破案了！' : `這題答對 ${pts} / 3`,
        html: `<p>V = ${V2} − ${V1} = ${V} cm³</p>
          <p>D = ${U.fmt(M)} ÷ ${V} = <b>${m.d} g/cm³</b> → 是<b>${m.n}</b></p>
          <p>${m.n} ${m.d} ${floats ? '&lt;' : '&gt;'} ${liq.n} ${liq.d.toFixed(1)}，所以會<b>${floats ? '浮' : '沉'}</b>。</p>
          ${liq === MERCURY && floats ? '<p class="muted">😮 鐵、銅、鉛在水中會沉，但在水銀中卻會浮起來！</p>' : ''}`,
        btn: r === plan.length - 1 ? '看結果 ›' : '下一個物體 ›',
      });
    }
    sh.finish(sh.score, plan.length * 3);
  },
};
