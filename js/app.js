'use strict';
/* ===== 理化群島：地圖、島嶼、關卡介紹與路由 ===== */

const ISLANDS = [
  { id: 'measure', name: '測量島', icon: '📏', unit: '第 1 站', desc: '基本測量：長度、質量、體積、密度', open: true,
    levels: ['length', 'mass', 'volume', 'density', 'units', 'boss'] },
  { id: 'matter', name: '物質島', icon: '🧪', unit: '第 2 站', desc: '物質的世界：純物質與混合物、溶液' },
  { id: 'wave', name: '聲波島', icon: '🔊', unit: '第 3 站', desc: '波動與聲音' },
  { id: 'light', name: '光影島', icon: '🔦', unit: '第 4 站', desc: '光的反射、折射與透鏡' },
  { id: 'heat', name: '熱力島', icon: '🔥', unit: '第 5 站', desc: '溫度與熱、熱的傳播' },
  { id: 'element', name: '元素島', icon: '⚛️', unit: '第 6 站', desc: '原子結構、元素與化合物' },
  { id: 'reaction', name: '反應島', icon: '⚗️', unit: '第 7 站', desc: '化學反應、質量守恆' },
  { id: 'acid', name: '酸鹼島', icon: '🍋', unit: '第 8 站', desc: '電解質、酸鹼鹽' },
  { id: 'force', name: '力學島', icon: '🚀', unit: '第 9 站', desc: '力與運動、功與能' },
  { id: 'electric', name: '電電島', icon: '⚡', unit: '第 10 站', desc: '電路、電流與磁' },
];

const App = {
  current: null,

  init() {
    window.addEventListener('hashchange', () => this.route());
    document.addEventListener('click', e => {
      const lock = e.target.closest('[data-locked]');
      if (lock) { Sound.play('tap'); Toast.show(`🚧 ${lock.dataset.locked}還在建造中，敬請期待！`); }
      const snd = e.target.closest('[data-act=sound]');
      if (snd) {
        const m = Sound.toggle();
        snd.textContent = m ? '🔇' : '🔊';
        Toast.show(m ? '已關閉音效' : '已開啟音效');
      }
    });
    this.route();
  },

  leave() {
    if (this.current) { this.current.destroy(); this.current = null; }
  },

  route() {
    this.leave();
    const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);
    if (parts[0] === 'island' && ISLANDS.find(i => i.id === parts[1] && i.open)) this.renderIsland(parts[1]);
    else if (parts[0] === 'play' && GAMES[parts[1]]) this.renderIntro(parts[1]);
    else this.renderMap();
    window.scrollTo(0, 0);
  },

  islandStars(is) {
    return (is.levels || []).reduce((a, id) => a + Progress.stars(id), 0);
  },

  renderMap() {
    const total = ISLANDS.reduce((a, is) => a + this.islandStars(is), 0);
    document.getElementById('app').innerHTML = `
      <div class="screen map-screen">
        <header class="map-header">
          <button class="icon-btn sound-btn" data-act="sound" aria-label="音效開關">${Sound.muted ? '🔇' : '🔊'}</button>
          <div class="map-badge">國中理化 · 闖關學習</div>
          <h1>理化群島大冒險</h1>
          <p>航向每一座島嶼，完成挑戰收集星星！</p>
          <div class="total-stars">⭐ ${total} 顆星</div>
        </header>
        <div class="sea">
          ${ISLANDS.map((is, i) => {
            const side = i % 2 ? 'right' : 'left';
            if (!is.open) {
              return `<button type="button" class="island locked ${side}" data-locked="${is.name}">
                <div class="island-blob"><span class="island-icon">${is.icon}</span><span class="lock">🔒</span></div>
                <div class="island-label"><small>${is.unit}</small><b>${is.name}</b><span>${is.desc}</span><em>即將開放</em></div>
              </button>`;
            }
            const max = is.levels.length * 3;
            return `<a class="island open ${side}" href="#/island/${is.id}">
              <div class="island-blob"><span class="island-icon">${is.icon}</span><span class="flag">🚩</span></div>
              <div class="island-label"><small>${is.unit}</small><b>${is.name}</b><span>${is.desc}</span>
                <em class="go">⭐ ${this.islandStars(is)} / ${max}　登島 ›</em></div>
            </a>`;
          }).join('')}
        </div>
        <footer class="foot">進度會自動儲存在這支手機的瀏覽器中</footer>
      </div>`;
  },

  renderIsland(id) {
    const is = ISLANDS.find(i => i.id === id);
    const max = is.levels.length * 3;
    const got = this.islandStars(is);
    document.getElementById('app').innerHTML = `
      <div class="screen island-screen">
        <header class="topbar">
          <a class="icon-btn" href="#/" aria-label="回到群島地圖">‹</a>
          <div class="topbar-title">${is.icon} ${is.name}</div>
          <div class="hud"><span>⭐ ${got}/${max}</span></div>
        </header>
        <section class="card hero">
          <div class="hero-icon">${is.icon}</div>
          <div>
            <small>${is.unit}</small>
            <h2>${is.name}</h2>
            <p>${is.desc}</p>
          </div>
          <div class="progress"><div style="width:${(got / max) * 100}%"></div></div>
        </section>
        <div class="path">
          ${is.levels.map((gid, i) => {
            const g = GAMES[gid];
            return `<a class="node ${g.boss ? 'boss' : ''}" href="#/play/${gid}">
              <div class="node-circle">${g.icon}</div>
              <div class="node-info">
                <small>${g.boss ? '最終挑戰' : `關卡 ${i + 1}`}</small>
                <b>${g.title}</b>
                <span>${g.subtitle}</span>
              </div>
              ${U.starsHTML(Progress.stars(gid))}
            </a>`;
          }).join('')}
        </div>
      </div>`;
  },

  renderIntro(id) {
    const g = GAMES[id];
    const p = Progress.get(id);
    document.getElementById('app').innerHTML = `
      <div class="screen intro-screen">
        <header class="topbar">
          <a class="icon-btn" href="#/island/${g.island}" aria-label="返回">‹</a>
          <div class="topbar-title">${g.icon} ${g.title}</div>
          <div class="hud">${U.starsHTML(p.stars)}</div>
        </header>
        <section class="card intro">
          <div class="intro-icon">${g.icon}</div>
          <h2>${g.title}</h2>
          <p class="muted center">${g.subtitle}</p>
          <div class="learn">
            <h3>📘 重點整理</h3>
            ${g.intro}
          </div>
          ${g.how ? `<div class="how"><h3>🎮 玩法</h3>${g.how}</div>` : ''}
          ${p.plays ? `<p class="muted center">已挑戰 ${p.plays} 次・最佳得分 ${p.best}</p>` : ''}
          <button class="btn primary big" data-act="start" type="button">開始挑戰 ›</button>
        </section>
      </div>`;
    document.querySelector('[data-act=start]').addEventListener('click', () => this.startGame(id));
  },

  startGame(id) {
    this.leave();
    const g = GAMES[id];
    const shell = new Shell(g, this);
    this.current = shell;
    window.scrollTo(0, 0);
    Promise.resolve(g.run(shell)).catch(err => console.error(err));
  },
};

App.init();
