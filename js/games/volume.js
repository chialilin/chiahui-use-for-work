'use strict';
/* 關卡 3：體積測量 — 量筒讀數（凹液面）與排水法 */

GAMES.volume = {
  id: 'volume',
  island: 'measure',
  icon: '🧪',
  title: '量筒排水法',
  subtitle: '體積測量・凹液面',
  intro: `<ul>
    <li>液體體積用<b>量筒</b>測量，常用單位 mL、L（1 L = 1000 mL）</li>
    <li><b>1 mL = 1 cm³</b></li>
    <li>讀數時，視線要與<b>凹液面最低處</b>保持水平</li>
    <li>俯視（從上往下看）讀數會<b>偏大</b>；仰視讀數會<b>偏小</b></li>
    <li>不規則固體用<b>排水法</b>：物體體積 = 放入後水位 − 放入前水位</li>
  </ul>`,
  how: '<p>共 4 回合，每回合 3 個步驟：讀 V₁ → 放入物體讀 V₂ → 算出物體體積。量筒每一小格是 1 mL。</p>',

  async run(sh) {
    const objs = U.shuffle([
      { n: '石頭', c: '#8d8d8d' }, { n: '螺絲帽', c: '#90a4ae' }, { n: '彈珠', c: '#4db6ac' },
      { n: '金屬塊', c: '#b0bec5' }, { n: '貝殼', c: '#ffccbc' },
    ]);
    const rounds = 4;
    const Y = v => 400 - v * 7;
    const waterD = v => { const y = Y(v); return `M107 ${y - 5} Q150 ${y + 5} 193 ${y - 5} L193 400 L107 400 Z`; };

    for (let r = 0; r < rounds; r++) {
      if (!sh.alive) return;
      sh.setRound(r + 1, rounds);
      const V1 = U.rand(12, 30), Vo = U.rand(4, 15), V2 = V1 + Vo;
      const obj = objs[r % objs.length];
      const rad = 9 + Vo * 1.15;

      let ticks = '';
      for (let v = 0; v <= 50; v++) {
        const y = Y(v);
        const len = v % 10 === 0 ? 30 : v % 5 === 0 ? 21 : 12;
        ticks += `<line x1="107" y1="${y}" x2="${107 + len}" y2="${y}" stroke="#263238" stroke-width="${v % 5 === 0 ? 1.8 : 1.1}"/>`;
        if (v % 5 === 0) ticks += `<text x="99" y="${y + 4}" text-anchor="end" font-size="${v % 10 === 0 ? 13 : 10}" font-weight="${v % 10 === 0 ? 700 : 400}" fill="#263238">${v}</text>`;
      }

      sh.stage.innerHTML = `
        <div class="card">
          <p class="q step"></p>
          <div class="vol-wrap">
            <svg class="cyl-svg" viewBox="40 0 220 425" role="img" aria-label="量筒">
              <text x="150" y="16" text-anchor="middle" font-size="13" fill="#455a64">mL</text>
              <rect x="104" y="24" width="92" height="380" rx="6" fill="rgba(225,245,254,.7)"/>
              <g class="obj" style="transform:translate(232px,70px)">
                <ellipse cx="0" cy="0" rx="${rad}" ry="${rad * 0.8}" fill="${obj.c}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
                <ellipse cx="${-rad * 0.35}" cy="${-rad * 0.3}" rx="${rad * 0.25}" ry="${rad * 0.15}" fill="rgba(255,255,255,.55)"/>
              </g>
              <path class="water" d="${waterD(V1)}" fill="rgba(41,182,246,.5)" stroke="#0288d1" stroke-width="1.5"/>
              ${ticks}
              <rect x="104" y="24" width="92" height="380" rx="6" fill="none" stroke="#78909c" stroke-width="3"/>
              <rect x="80" y="403" width="140" height="14" rx="5" fill="#78909c"/>
            </svg>
            <div class="vol-log"><div class="log-title">📝 實驗紀錄</div></div>
          </div>
          <div class="ask-host"></div>
        </div>`;

      const $ = s => sh.stage.querySelector(s);
      const step = $('.step'), host = $('.ask-host'), log = $('.vol-log');
      const water = $('.water'), objEl = $('.obj');

      // 步驟 1
      step.innerHTML = `步驟 1/3：讀出量筒的水位 <b>V₁</b><br><small>視線與凹液面最低處平齊</small>`;
      let a = await U.askNumber(host, { label: 'V₁ =', unit: 'mL' });
      if (!sh.alive) return;
      let pts = 0;
      const ok1 = Math.abs(a.value - V1) < 0.5;
      if (ok1) { pts++; sh.add(); Sound.play('ok'); } else Sound.play('bad');
      U.addLog(log, ok1, `V₁ = ${a.raw} mL ${ok1 ? '✓' : `✗<br><small>正確：${V1} mL</small>`}`);

      // 步驟 2
      step.innerHTML = `步驟 2/3：把<b>${obj.n}</b>放進量筒，讀出新的水位 <b>V₂</b>`;
      await U.waitButton(host, `放入${obj.n} ⬇️`);
      if (!sh.alive) return;
      objEl.style.transform = 'translate(150px,40px)';
      await U.sleep(450);
      objEl.style.transition = 'transform .6s cubic-bezier(.5,0,.9,.5)';
      objEl.style.transform = `translate(150px,${400 - rad * 0.8 - 1}px)`;
      await U.sleep(420);
      Sound.play('splash');
      await new Promise(res => {
        const t0 = performance.now();
        const f = t => {
          const k = Math.min(1, (t - t0) / 900);
          const e = 1 - Math.pow(1 - k, 3);
          water.setAttribute('d', waterD(V1 + Vo * e));
          if (k < 1 && sh.alive) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
      if (!sh.alive) return;
      a = await U.askNumber(host, { label: 'V₂ =', unit: 'mL' });
      if (!sh.alive) return;
      const ok2 = Math.abs(a.value - V2) < 0.5;
      if (ok2) { pts++; sh.add(); Sound.play('ok'); } else Sound.play('bad');
      U.addLog(log, ok2, `V₂ = ${a.raw} mL ${ok2 ? '✓' : `✗<br><small>正確：${V2} mL</small>`}`);

      // 步驟 3
      step.innerHTML = `步驟 3/3：算出<b>${obj.n}</b>的體積`;
      a = await U.askNumber(host, { label: `${obj.n}體積 =`, unit: 'cm³' });
      if (!sh.alive) return;
      const ok3 = Math.abs(a.value - Vo) < 0.5;
      if (ok3) { pts++; sh.add(); }
      U.addLog(log, ok3, `V = ${a.raw} cm³ ${ok3 ? '✓' : '✗'}`);

      await sh.feedback({
        ok: pts === 3,
        title: pts === 3 ? '🎉 三個步驟全對！' : `這回合答對 ${pts} / 3`,
        html: `<p>${obj.n}體積 = V₂ − V₁ = ${V2} − ${V1} = <b>${Vo} mL = ${Vo} cm³</b></p>
          <p class="muted">記住：1 mL = 1 cm³</p>`,
        btn: r === rounds - 1 ? '看結果 ›' : '下一回合 ›',
      });
    }
    sh.finish(sh.score, rounds * 3);
  },
};
