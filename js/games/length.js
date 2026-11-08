'use strict';
/* 關卡 1：長度測量 — 讀尺並記錄「準確值 + 一位估計值」 */

GAMES.length = {
  id: 'length',
  island: 'measure',
  icon: '📏',
  title: '尺規神射手',
  subtitle: '長度測量・估計值',
  intro: `<ul>
    <li>測量結果 = <b>準確值 + 一位估計值</b> + 單位</li>
    <li>最小刻度 <b>1 cm</b> 的尺 → 記錄到 <b>0.1 cm</b>（例：6.3 cm）</li>
    <li>最小刻度 <b>0.1 cm（1 mm）</b>的尺 → 記錄到 <b>0.01 cm</b>（例：4.56 cm）</li>
    <li>剛好對齊刻度也要補 0，例如 6.0 cm、3.20 cm</li>
    <li>物體沒有從 0 開始量：長度 = 末端讀數 − 前端讀數</li>
  </ul>`,
  how: '<p>共 5 題。看清楚尺的刻度，輸入物體長度。可以按「🔍 放大」並左右滑動看清楚！</p>',

  async run(sh) {
    const plan = [
      { s: 1, start: 0 },
      { s: 1, start: 2 },
      { s: 0.1, start: 0 },
      { s: 0.1, start: 1 },
      { s: 0.1, start: U.pick([0.5, 1.5]) },
    ];
    const objs = U.shuffle([
      { n: '積木', c: '#ef5350' }, { n: '橡皮擦', c: '#42a5f5' }, { n: '口香糖', c: '#ab47bc' },
      { n: '巧克力', c: '#8d6e63' }, { n: '便利貼', c: '#f9a825' }, { n: '電池', c: '#26a69a' },
    ]);

    for (let r = 0; r < plan.length; r++) {
      if (!sh.alive) return;
      sh.setRound(r + 1, plan.length);
      const { s, start } = plan[r];
      const R = s === 1 ? 10 : 4;          // 尺的全長（cm）
      const dec = s === 1 ? 1 : 2;         // 應記錄的小數位數
      const tol = s === 1 ? 0.2 : 0.03;    // 估計值容許誤差
      const minL = s === 1 ? 2 : 1;
      const maxL = R - start - 0.3;
      const L = U.round(minL + Math.random() * (maxL - minL), dec);
      const obj = objs[r % objs.length];

      const X = v => 30 + (v * 940) / R;
      const x0 = X(start), x1 = X(start + L);
      let g = '';
      g += `<rect x="${x0}" y="40" width="${x1 - x0}" height="62" rx="8" fill="${obj.c}" stroke="rgba(0,0,0,.35)" stroke-width="2"/>`;
      g += `<text x="${(x0 + x1) / 2}" y="81" text-anchor="middle" font-size="26" font-weight="700" fill="#fff">${obj.n}</text>`;
      [x0, x1].forEach(x => {
        g += `<line x1="${x}" y1="102" x2="${x}" y2="130" stroke="#37474f" stroke-width="2" stroke-dasharray="5 4"/>`;
      });
      g += `<rect x="8" y="130" width="984" height="92" rx="8" fill="#ffe08a" stroke="#c9a227" stroke-width="3"/>`;
      const n = Math.round(R / s);
      for (let i = 0; i <= n; i++) {
        const x = X(i * s);
        let len, w;
        if (s === 1) { len = 40; w = 3; } else {
          len = i % 10 === 0 ? 40 : i % 5 === 0 ? 27 : 16;
          w = i % 10 === 0 ? 3 : 2;
        }
        g += `<line x1="${x}" y1="130" x2="${x}" y2="${130 + len}" stroke="#3e2723" stroke-width="${w}"/>`;
        if (s === 1 || i % 10 === 0) {
          g += `<text x="${x}" y="198" text-anchor="middle" font-size="26" font-weight="600" fill="#3e2723">${Math.round(i * s)}</text>`;
        }
      }
      g += `<text x="48" y="216" font-size="17" fill="#6d4c41">cm</text>`;

      sh.stage.innerHTML = `
        <div class="card">
          <p class="q">用最小刻度 <b class="hl">${s === 1 ? '1 cm' : '0.1 cm（1 mm）'}</b> 的尺，量出<b>${obj.n}</b>的長度。</p>
          ${start ? `<p class="tip">⚠️ 注意：這次${obj.n}沒有對齊 0 刻度！</p>` : ''}
          <div class="figure-tools">
            <button class="btn small" type="button" data-zoom>🔍 放大</button>
            <span class="muted">放大後可左右滑動</span>
          </div>
          <div class="scroll-x"><svg class="ruler-svg" viewBox="0 0 1000 230" role="img" aria-label="直尺">${g}</svg></div>
          <div class="ask-host"></div>
        </div>`;

      const svgEl = sh.stage.querySelector('svg');
      const box = sh.stage.querySelector('.scroll-x');
      const zb = sh.stage.querySelector('[data-zoom]');
      const zooms = s === 1 ? [1, 2] : [1, 2, 3];
      let zi = 0;
      zb.addEventListener('click', () => {
        zi = (zi + 1) % zooms.length;
        const z = zooms[zi];
        svgEl.style.width = z * 100 + '%';
        zb.textContent = z === 1 ? '🔍 放大' : `🔍 ${z} 倍（再按切換）`;
        requestAnimationFrame(() => {
          box.scrollLeft = (x1 / 1000) * svgEl.clientWidth - box.clientWidth / 2;
        });
      });

      const p = await U.askNumber(sh.stage.querySelector('.ask-host'), { label: `${obj.n}長度 =`, unit: 'cm' });
      if (!sh.alive) return;

      const ans = L.toFixed(dec);
      const okVal = Math.abs(p.value - L) <= tol + 1e-9;
      const okDec = p.decimals === dec;
      const rule = s === 1
        ? '最小刻度 1 cm → 要記錄到小數點後 <b>1</b> 位（0.1 cm）'
        : '最小刻度 0.1 cm → 要記錄到小數點後 <b>2</b> 位（0.01 cm）';
      const sub = start
        ? `<p>末端讀數 ${(start + L).toFixed(dec)} cm − 前端讀數 ${start.toFixed(dec)} cm = <b>${ans} cm</b></p>`
        : '';

      if (okVal && okDec) {
        sh.add();
        await sh.feedback({ ok: true, html: `<p>參考答案：<b>${ans} cm</b></p>${sub}<p class="muted">最後一位是估計值，差一點點沒關係！</p>` });
      } else if (okVal) {
        await sh.feedback({ ok: false, title: '🤏 數值很接近，但位數不對！', html: `<p>${rule}</p><p>參考答案：<b>${ans} cm</b></p>` });
      } else if (start && Math.abs(p.value - (start + L)) <= tol + 1e-9) {
        await sh.feedback({ ok: false, title: '🤔 忘了減掉起點！', html: `<p>你讀到的是末端位置喔。</p>${sub}` });
      } else {
        await sh.feedback({ ok: false, html: `<p>你的答案：${p.raw} cm</p><p>參考答案約為 <b>${ans} cm</b></p>${sub}<p class="muted">${rule}</p>` });
      }
    }
    sh.finish(sh.score, plan.length);
  },
};
