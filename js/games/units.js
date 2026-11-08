'use strict';
/* 關卡 5：單位換算快打 — 60 秒限時 */

GAMES.units = {
  id: 'units',
  island: 'measure',
  icon: '⏱️',
  title: '單位換算快打',
  subtitle: '60 秒限時挑戰',
  intro: `<ul>
    <li>長度：1 km = 1000 m；1 m = 100 cm；1 cm = 10 mm</li>
    <li>質量：1 kg = 1000 g；1 g = 1000 mg</li>
    <li>體積：1 L = 1000 mL；<b>1 mL = 1 cm³</b></li>
    <li>大單位換小單位 → 數字變大；小單位換大單位 → 數字變小</li>
  </ul>`,
  how: '<p>60 秒內答對越多越好！答錯會<b>扣 3 秒</b>。答對 15 題可拿 3 顆星。</p>',

  gen() {
    const CATS = [
      [['km', 100000], ['m', 100], ['cm', 1], ['mm', 0.1]],
      [['kg', 1000000], ['g', 1000], ['mg', 1]],
      [['L', 1000], ['mL', 1], ['cm³', 1]],
    ];
    const VALS = [0.2, 0.5, 1.5, 2, 2.5, 3, 4, 6.5, 8, 12, 25, 30, 45, 120, 250, 500, 750, 1200, 3000];
    for (let tries = 0; tries < 200; tries++) {
      const cat = U.pick(CATS);
      const a = U.pick(cat), b = U.pick(cat);
      if (a === b) continue;
      const v = U.pick(VALS);
      const ans = U.round((v * a[1]) / b[1], 6);
      if (ans < 0.001 || ans > 1000000) continue;
      const fmt = n => U.fmt(n, 6);
      const set = new Set([fmt(ans)]);
      const opts = [ans];
      for (const k of U.shuffle([10, 100, 1000, 0.1, 0.01, 0.001])) {
        const d = U.round(ans * k, 6);
        if (d < 0.0001 || d > 10000000 || set.has(fmt(d))) continue;
        set.add(fmt(d));
        opts.push(d);
        if (opts.length === 4) break;
      }
      if (opts.length < 4) continue;
      const shuffled = U.shuffle(opts);
      return {
        text: `${fmt(v)} <small>${a[0]}</small> = ？ <small>${b[0]}</small>`,
        opts: shuffled.map(n => `${fmt(n)} ${b[0]}`),
        ans: shuffled.indexOf(ans),
      };
    }
    return { text: '1 <small>m</small> = ？ <small>cm</small>', opts: ['100 cm', '10 cm', '1000 cm', '0.1 cm'], ans: 0 };
  },

  async run(sh) {
    const LIMIT = 60, GOAL = 15;
    let time = LIMIT, ended = false, combo = 0;
    sh.stage.innerHTML = `
      <div class="card">
        <div class="timebar"><div></div></div>
        <p class="big-q"></p>
        <div class="ask-host"></div>
        <p class="combo center"></p>
      </div>`;
    const bar = sh.stage.querySelector('.timebar div');
    const qEl = sh.stage.querySelector('.big-q');
    const host = sh.stage.querySelector('.ask-host');
    const comboEl = sh.stage.querySelector('.combo');

    const end = () => {
      if (ended) return;
      ended = true;
      sh.finish(sh.score, GOAL, { scoreText: `60 秒內答對 <b>${sh.score}</b> 題（目標 ${GOAL} 題）` });
    };
    const draw = () => {
      bar.style.width = Math.max(0, (time / LIMIT) * 100) + '%';
      bar.classList.toggle('low', time <= 10);
      sh.setHud(`⏱ ${Math.max(0, Math.ceil(time))} 秒`);
    };
    draw();
    sh.every(() => {
      if (ended) return;
      time -= 0.1;
      draw();
      if (time <= 0) end();
    }, 100);

    while (!ended && sh.alive) {
      const q = this.gen();
      qEl.innerHTML = q.text;
      const c = await U.askChoice(host, q.opts);
      if (ended || !sh.alive) return;
      if (c.index === q.ans) {
        combo++;
        sh.add();
        Sound.play('ok');
        c.button.classList.add('right');
        comboEl.textContent = combo >= 3 ? `🔥 連續答對 ${combo} 題！` : '';
        await U.sleep(250);
      } else {
        combo = 0;
        time -= 3;
        draw();
        Sound.play('bad');
        c.button.classList.add('wrong');
        c.buttons[q.ans].classList.add('right');
        comboEl.textContent = '⏬ 扣 3 秒';
        if (time <= 0) { end(); return; }
        await U.sleep(900);
      }
    }
  },
};
