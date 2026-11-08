'use strict';
/* 關卡 2：質量測量 — 上皿天平，左物右碼，加砝碼使天平平衡 */

GAMES.mass = {
  id: 'mass',
  island: 'measure',
  icon: '⚖️',
  title: '天平平衡大師',
  subtitle: '質量測量・上皿天平',
  intro: `<ul>
    <li>質量：物體所含物質的多少，常用單位 kg、g、mg（1 kg = 1000 g，1 g = 1000 mg）</li>
    <li>上皿天平：<b>左物右碼</b>（物體放左盤、砝碼放右盤）</li>
    <li>加砝碼要「<b>由大到小</b>」，指針停在中央就是平衡</li>
    <li>物體質量 = 砝碼總質量 + 騎碼讀數</li>
    <li>砝碼要用鑷子夾取，不能用手直接拿</li>
  </ul>`,
  how: '<p>共 5 題。點砝碼放上右盤（再點一次拿下來），讓天平平衡後輸入物體質量。後兩題要用到<b>騎碼</b>！</p>',

  async run(sh) {
    const W = [100, 50, 20, 20, 10, 5, 2, 2, 1];
    const items = U.shuffle([
      { e: '🍎', n: '蘋果' }, { e: '🔑', n: '鑰匙' }, { e: '🥚', n: '雞蛋' }, { e: '🧸', n: '小熊' },
      { e: '📱', n: '手機' }, { e: '🍐', n: '梨子' }, { e: '🧲', n: '磁鐵' }, { e: '🍙', n: '飯糰' },
    ]);
    const plan = [false, false, false, true, true];

    for (let r = 0; r < plan.length; r++) {
      if (!sh.alive) return;
      sh.setRound(r + 1, plan.length);
      const dec = plan[r];
      const M = dec ? U.round(U.rand(10, 199) + U.rand(1, 9) / 10, 1) : U.rand(15, 205);
      const it = items[r];
      const on = W.map(() => false);
      let rider = 0;

      let riderSvg = '';
      if (dec) {
        for (let i = 0; i <= 10; i++) {
          const x = 215 + i * 12.5;
          riderSvg += `<line x1="${x}" y1="84" x2="${x}" y2="${i % 5 === 0 ? 77 : 80}" stroke="#263238" stroke-width="1.5"/>`;
        }
        riderSvg += `<text x="215" y="74" font-size="9" text-anchor="middle" fill="#263238">0</text>
          <text x="340" y="74" font-size="9" text-anchor="middle" fill="#263238">1 g</text>
          <path class="rider" d="M-5 -1 L5 -1 L0 -11 Z" fill="#d32f2f" transform="translate(215,84)"/>`;
      }
      let scale = '';
      for (let k = -3; k <= 3; k++) {
        scale += `<line x1="${200 + k * 9}" y1="199" x2="${200 + k * 9}" y2="${k === 0 ? 214 : 207}" stroke="#455a64" stroke-width="${k === 0 ? 2.5 : 1.5}"/>`;
      }

      sh.stage.innerHTML = `
        <div class="card">
          <p class="q">把<b>${it.n}</b>放在左盤，在右盤加砝碼${dec ? '並移動<b>騎碼</b>' : ''}，讓天平平衡後寫出它的質量。</p>
          <svg class="balance-svg" viewBox="0 0 400 300" role="img" aria-label="上皿天平">
            <rect x="120" y="272" width="160" height="18" rx="8" fill="#8d6e63"/>
            <rect x="193" y="96" width="14" height="178" fill="#a1887f"/>
            <rect x="166" y="196" width="68" height="22" rx="6" fill="#fff" stroke="#90a4ae" stroke-width="2"/>
            ${scale}
            <g class="pan" data-pan="L">
              <line x1="50" y1="92" x2="16" y2="168" stroke="#78909c" stroke-width="2"/>
              <line x1="50" y1="92" x2="84" y2="168" stroke="#78909c" stroke-width="2"/>
              <path d="M8 168 Q50 198 92 168 Z" fill="#b0bec5" stroke="#78909c" stroke-width="2"/>
              <text x="50" y="164" text-anchor="middle" font-size="44">${it.e}</text>
            </g>
            <g class="pan" data-pan="R">
              <line x1="350" y1="92" x2="316" y2="168" stroke="#78909c" stroke-width="2"/>
              <line x1="350" y1="92" x2="384" y2="168" stroke="#78909c" stroke-width="2"/>
              <path d="M308 168 Q350 198 392 168 Z" fill="#b0bec5" stroke="#78909c" stroke-width="2"/>
              <g class="panw"></g>
            </g>
            <g class="beam">
              <rect x="44" y="84" width="312" height="12" rx="6" fill="#546e7a"/>
              ${riderSvg}
              <line x1="200" y1="90" x2="200" y2="212" stroke="#e53935" stroke-width="3" stroke-linecap="round"/>
              <circle cx="200" cy="90" r="9" fill="#37474f"/>
            </g>
            <text x="50" y="230" text-anchor="middle" font-size="13" fill="#455a64">左盤：物體</text>
            <text x="350" y="230" text-anchor="middle" font-size="13" fill="#455a64">右盤：砝碼</text>
          </svg>
          <div class="status-line"></div>
          <div class="weights">${W.map((w, i) =>
            `<button class="weight" type="button" data-i="${i}"><span>${w}</span>g</button>`).join('')}</div>
          ${dec ? `<div class="rider-row">
            <label>騎碼 <b class="rv">0.0</b> g</label>
            <input type="range" min="0" max="1" step="0.1" value="0" aria-label="騎碼位置">
          </div>` : ''}
          <div class="ask-host"></div>
        </div>`;

      const $ = s => sh.stage.querySelector(s);
      const beam = $('.beam'), panL = $('[data-pan=L]'), panR = $('[data-pan=R]'), panW = $('.panw');
      const status = $('.status-line');
      const btns = [...sh.stage.querySelectorAll('.weight')];
      const diffNow = () => U.round(M - W.reduce((a, w, i) => a + (on[i] ? w : 0), 0) - rider, 1);

      const update = () => {
        const diff = diffNow();
        const th = diff === 0 ? 0 : -Math.sign(diff) * Math.min(12, 2 + Math.abs(diff) * 0.6);
        const rad = (th * Math.PI) / 180;
        const dy = 150 * Math.sin(rad), dx = 150 * (1 - Math.cos(rad));
        beam.style.transform = `rotate(${th}deg)`;
        panL.style.transform = `translate(${dx}px, ${-dy}px)`;
        panR.style.transform = `translate(${-dx}px, ${dy}px)`;
        // 右盤的砝碼
        const list = W.map((w, i) => (on[i] ? w : null)).filter(x => x !== null).sort((a, b) => b - a);
        panW.innerHTML = list.map((w, k) => {
          const col = k % 3, row = Math.floor(k / 3);
          const x = 316 + col * 23, y = 150 - row * 18;
          return `<rect x="${x}" y="${y}" width="21" height="16" rx="3" fill="#e0b336" stroke="#8d6e00" stroke-width="1"/>
            <text x="${x + 10.5}" y="${y + 12}" text-anchor="middle" font-size="9" font-weight="700" fill="#4e342e">${w}</text>`;
        }).join('');
        btns.forEach((b, i) => b.classList.toggle('on', on[i]));
        if (dec) {
          $('.rider').setAttribute('transform', `translate(${215 + rider * 125},84)`);
          $('.rv').textContent = rider.toFixed(1);
        }
        status.className = 'status-line ' + (diff === 0 ? 'good' : '');
        status.textContent = diff === 0 ? '✅ 天平平衡了！算算看物體質量是多少？'
          : diff > 0 ? '⬅️ 左盤比較重：砝碼不夠' : '➡️ 右盤比較重：砝碼太多了';
      };

      let locked = false;
      btns.forEach((b, i) => b.addEventListener('click', () => {
        if (locked) return;
        on[i] = !on[i];
        Sound.play('tap');
        update();
      }));
      if (dec) {
        $('input[type=range]').addEventListener('input', e => {
          if (locked) return;
          rider = U.round(parseFloat(e.target.value), 1);
          update();
        });
      }
      update();

      const p = await U.askNumber($('.ask-host'), {
        label: `${it.n}質量 =`, unit: 'g',
        validate: () => (diffNow() === 0 ? null : '天平還沒平衡喔！先讓指針停在中央。'),
      });
      if (!sh.alive) return;
      locked = true;
      btns.forEach(b => { b.disabled = true; });
      if (dec) $('input[type=range]').disabled = true;

      const used = W.filter((w, i) => on[i]).sort((a, b) => b - a);
      const Mtxt = dec ? M.toFixed(1) : String(M);
      const calc = `<p>砝碼：${used.join(' + ')} = ${used.reduce((a, b) => a + b, 0)} g${dec ? `<br>再加騎碼 ${rider.toFixed(1)} g` : ''}</p>
        <p>${it.n}質量 = <b>${Mtxt} g</b></p>`;
      if (Math.abs(p.value - M) < 0.05) {
        sh.add();
        await sh.feedback({ ok: true, html: calc });
      } else {
        await sh.feedback({ ok: false, html: `<p>你的答案：${p.raw} g</p>${calc}` });
      }
    }
    sh.finish(sh.score, plan.length);
  },
};
