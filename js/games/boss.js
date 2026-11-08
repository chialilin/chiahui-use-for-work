'use strict';
/* 最終挑戰：測量島島主 — 觀念選擇題 */

GAMES.boss = {
  id: 'boss',
  island: 'measure',
  icon: '🐙',
  boss: true,
  title: '島主大章魚',
  subtitle: '測量觀念總複習',
  intro: `<p>測量島的島主大章魚出現了！牠會問你 10 個測量觀念題，答對 9 題以上就能拿到 3 顆星，征服測量島！</p>
    <ul><li>估計值與準確值</li><li>量筒讀數與排水法</li><li>天平的使用</li><li>密度與沉浮</li></ul>`,

  // 每題第一個選項為正確答案（出題時會自動打亂）
  BANK: [
    { q: '用最小刻度 0.1 cm 的尺測量鉛筆長度，下列哪一個記錄最正確？', o: ['15.23 cm', '15.2 cm', '15 cm', '15.234 cm'],
      e: '最小刻度 0.1 cm，要再多估計一位，記錄到 0.01 cm。' },
    { q: '某生測得課本長度為 25.36 cm，其中「估計值」是多少？', o: ['0.06 cm', '25.3 cm', '0.36 cm', '6 cm'],
      e: '最後一位是估計值：0.06 cm；準確值是 25.3 cm。' },
    { q: '測量結果記錄為 12.34 cm，所用的尺最小刻度應為？', o: ['0.1 cm', '1 cm', '0.01 cm', '1 mm 與 1 cm 都可以'],
      e: '最後一位（0.04）是估計的，所以尺能準確量到 0.1 cm。' },
    { q: '用量筒量取液體體積時，視線應該？', o: ['與凹液面最低處平齊', '與凹液面最高處平齊', '從上方俯視', '從下方仰視'],
      e: '視線要與凹液面最低處保持水平。' },
    { q: '讀量筒刻度時若「俯視」，讀到的數值會？', o: ['偏大', '偏小', '不受影響', '一定是 0'],
      e: '俯視時視線落在較高的刻度，讀數偏大；仰視則偏小。' },
    { q: '1 mL 等於多少？', o: ['1 cm³', '10 cm³', '1000 cm³', '0.001 cm³'], e: '1 mL = 1 cm³，1 L = 1000 mL。' },
    { q: '使用上皿天平時，物體與砝碼應如何放置？', o: ['物體放左盤、砝碼放右盤', '物體放右盤、砝碼放左盤', '都放左盤', '隨便放'],
      e: '口訣：左物右碼。' },
    { q: '使用天平加砝碼的順序應該是？', o: ['由大到小', '由小到大', '先放中間的', '隨意'],
      e: '由大到小可以最快找到平衡。' },
    { q: '密度的定義是？', o: ['質量 ÷ 體積', '體積 ÷ 質量', '質量 × 體積', '質量 − 體積'], e: 'D = M / V。' },
    { q: '一金屬塊質量 27 g、體積 10 cm³，其密度為？', o: ['2.7 g/cm³', '0.37 g/cm³', '270 g/cm³', '37 g/cm³'],
      e: 'D = 27 ÷ 10 = 2.7 g/cm³（是鋁）。' },
    { q: '把一塊木頭切成兩半，每一半的密度會？', o: ['不變', '變成一半', '變成兩倍', '無法判斷'],
      e: '密度是物質的特性，與大小無關。' },
    { q: '密度 0.8 g/cm³ 的物體放入水中會？', o: ['浮在水面', '沉到水底', '停在水中央', '溶解'],
      e: '0.8 < 1（水的密度），所以會浮。' },
    { q: '太空人把 60 kg 的背包帶到月球，背包的「質量」會？', o: ['不變，仍是 60 kg', '變成 10 kg', '變成 0 kg', '變成 360 kg'],
      e: '質量是物質的多少，不因地點改變（改變的是重量）。' },
    { q: '量筒原有水 30 mL，放入石頭後水位為 42 mL，石頭體積為？', o: ['12 cm³', '42 cm³', '72 cm³', '30 cm³'],
      e: '排水法：42 − 30 = 12 mL = 12 cm³。' },
    { q: '2.5 kg 等於多少 g？', o: ['2500 g', '250 g', '25 g', '0.0025 g'], e: '1 kg = 1000 g，2.5 × 1000 = 2500 g。' },
    { q: '同一種物質，「質量－體積」關係圖會是？', o: ['通過原點的斜直線', '水平線', '鉛直線', '彎曲的曲線'],
      e: '質量與體積成正比，斜率就是密度。' },
    { q: '冰塊（0.9 g/cm³）放進水中會？', o: ['浮起來', '沉下去', '先浮後沉', '停在底部'], e: '0.9 < 1，所以冰會浮在水面。' },
  ],

  async run(sh) {
    const qs = U.shuffle(this.BANK).slice(0, 10);
    for (let i = 0; i < qs.length; i++) {
      if (!sh.alive) return;
      sh.setRound(i + 1, qs.length);
      const item = qs[i];
      const order = U.shuffle([0, 1, 2, 3]);
      sh.stage.innerHTML = `
        <div class="card boss-card">
          <div class="boss-face ${i === qs.length - 1 ? 'angry' : ''}">🐙</div>
          <p class="q">${item.q}</p>
          <div class="ask-host"></div>
        </div>`;
      const host = sh.stage.querySelector('.ask-host');
      const c = await U.askChoice(host, order.map(k => item.o[k]), { cols: 1 });
      if (!sh.alive) return;
      const correctPos = order.indexOf(0);
      const ok = c.index === correctPos;
      c.buttons[correctPos].classList.add('right');
      if (!ok) c.button.classList.add('wrong');
      if (ok) sh.add();
      await sh.feedback({
        ok,
        html: `<p>答案：<b>${item.o[0]}</b></p><p class="muted">${item.e}</p>`,
        btn: i === qs.length - 1 ? '看結果 ›' : '下一題 ›',
      });
    }
    sh.finish(sh.score, qs.length);
  },
};
