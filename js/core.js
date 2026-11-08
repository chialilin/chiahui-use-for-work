'use strict';
/* ===== 理化群島：共用工具、音效、進度、遊戲外殼 ===== */

window.GAMES = {};

const U = {
  rand: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  round(n, d = 0) {
    const f = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * f) / f;
  },
  fmt(n, maxFrac = 6) {
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: maxFrac });
  },
  /** 解析使用者輸入的數字（支援全形數字、全形小數點），回傳數值與小數位數 */
  parseNum(str) {
    if (str == null) return null;
    const s = String(str).trim()
      .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/[．。]/g, '.')
      .replace(/[\s,，]/g, '')
      .replace(/[－—]/g, '-');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    const dot = s.indexOf('.');
    return { value: parseFloat(s), decimals: dot < 0 ? 0 : s.length - dot - 1, raw: s };
  },
  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  },
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  starsHTML(n, max = 3) {
    let s = '';
    for (let i = 0; i < max; i++) s += i < n ? '<i class="on">★</i>' : '<i>★</i>';
    return `<span class="stars">${s}</span>`;
  },

  /** 在 host 內顯示數字輸入框，按「確定」後 resolve。validate 回傳錯誤字串則不送出 */
  askNumber(host, { label = '', unit = '', placeholder = '輸入數字', validate = null } = {}) {
    return new Promise(resolve => {
      host.innerHTML = `
        <form class="ask" autocomplete="off">
          ${label ? `<label class="ask-label">${label}</label>` : ''}
          <input class="ask-input" type="text" inputmode="decimal" enterkeyhint="done" placeholder="${placeholder}">
          ${unit ? `<span class="ask-unit">${unit}</span>` : ''}
          <button class="btn primary" type="submit">確定</button>
        </form>`;
      const form = host.querySelector('form');
      const inp = form.querySelector('input');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const p = U.parseNum(inp.value);
        if (!p) { Toast.show('請輸入一個數字喔！'); return; }
        if (validate) {
          const err = validate(p);
          if (err) { Toast.show(err); Sound.play('bad'); return; }
        }
        inp.blur();
        form.querySelectorAll('input,button').forEach(x => { x.disabled = true; });
        resolve(p);
      });
    });
  },

  /** 在 host 內顯示選項按鈕，點選後 resolve {index, button, buttons} */
  askChoice(host, options, { cols = 2 } = {}) {
    return new Promise(resolve => {
      host.innerHTML = `<div class="choices cols-${cols}">${options
        .map((o, i) => `<button class="btn choice" type="button" data-i="${i}">${o}</button>`).join('')}</div>`;
      const buttons = [...host.querySelectorAll('.choice')];
      buttons.forEach(b => b.addEventListener('click', () => {
        buttons.forEach(x => { x.disabled = true; });
        resolve({ index: +b.dataset.i, button: b, buttons });
      }));
    });
  },

  /** 等待按鈕被點一下 */
  waitButton(host, html) {
    return new Promise(resolve => {
      host.innerHTML = `<button class="btn primary big" type="button">${html}</button>`;
      host.querySelector('button').addEventListener('click', () => { host.innerHTML = ''; resolve(); }, { once: true });
    });
  },

  addLog(logEl, ok, html) {
    logEl.insertAdjacentHTML('beforeend', `<div class="log-item ${ok ? 'ok' : 'bad'}">${html}</div>`);
  },
};

/* ===== 小提示 ===== */
const Toast = {
  timer: null,
  show(msg, ms = 1800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => t.classList.remove('show'), ms);
  },
};

/* ===== 音效（Web Audio，不需要音檔） ===== */
const Sound = {
  muted: (() => { try { return localStorage.getItem('pi-muted') === '1'; } catch (e) { return false; } })(),
  ctx: null,
  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem('pi-muted', this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
    return this.muted;
  },
  tone(freq, t, dur, type = 'sine', vol = 0.14) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },
  play(kind) {
    if (kind === 'bad' && navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* ignore */ } }
    if (this.muted) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;
      const seq = {
        ok: [[660, 0, 0.12], [880, 0.1, 0.2]],
        bad: [[240, 0, 0.18, 'square', 0.06], [180, 0.15, 0.25, 'square', 0.06]],
        win: [[523, 0, 0.15], [659, 0.15, 0.15], [784, 0.3, 0.15], [1047, 0.45, 0.4]],
        tap: [[520, 0, 0.05, 'triangle', 0.08]],
        splash: [[300, 0, 0.12, 'triangle', 0.1], [200, 0.08, 0.2, 'triangle', 0.08]],
      }[kind] || [];
      seq.forEach(([f, s, d, ty, v]) => this.tone(f, t + s, d, ty, v));
    } catch (e) { /* 部分瀏覽器不支援，忽略 */ }
  },
};

/* ===== 進度（存在手機瀏覽器 localStorage） ===== */
const Progress = {
  key: 'physics-islands-v1',
  data: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },
  get(id) { return this.data[id] || { stars: 0, best: 0, plays: 0 }; },
  stars(id) { return this.get(id).stars; },
  record(id, stars, score) {
    const cur = this.get(id);
    const isNew = stars > cur.stars;
    this.data[id] = {
      stars: Math.max(cur.stars, stars),
      best: Math.max(cur.best, score),
      plays: cur.plays + 1,
    };
    this.save();
    return isNew;
  },
};
Progress.load();

function starsFor(score, max) {
  const r = max ? score / max : 0;
  if (r >= 0.9) return 3;
  if (r >= 0.7) return 2;
  if (r >= 0.4) return 1;
  return 0;
}

/* ===== 遊戲外殼：頂部列、計分、回饋視窗、結算畫面 ===== */
class Shell {
  constructor(game, app) {
    this.game = game;
    this.app = app;
    this.score = 0;
    this.alive = true;
    this.timers = [];
    const root = document.getElementById('app');
    root.innerHTML = `
      <div class="screen game-screen">
        <header class="topbar">
          <button class="icon-btn" data-act="back" aria-label="返回島嶼">‹</button>
          <div class="topbar-title">${game.icon} ${game.title}</div>
          <div class="hud"><span class="hud-round"></span><span class="hud-score">⭐ 0</span></div>
        </header>
        <main class="stage"></main>
      </div>`;
    this.root = root.firstElementChild;
    this.stage = this.root.querySelector('.stage');
    this.root.querySelector('[data-act=back]').addEventListener('click', () => {
      location.hash = '#island-' + game.island;
    });
  }
  setRound(i, n) { this.setHud(`${i}/${n}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  setHud(text) { this.root.querySelector('.hud-round').textContent = text; }
  add(n = 1) {
    this.score += n;
    const s = this.root.querySelector('.hud-score');
    s.textContent = `⭐ ${this.score}`;
    s.classList.remove('pop');
    void s.offsetWidth;
    s.classList.add('pop');
  }
  later(fn, ms) { const id = setTimeout(fn, ms); this.timers.push(['t', id]); return id; }
  every(fn, ms) { const id = setInterval(fn, ms); this.timers.push(['i', id]); return id; }
  destroy() {
    this.alive = false;
    this.timers.forEach(([k, id]) => (k === 't' ? clearTimeout(id) : clearInterval(id)));
    this.root.querySelectorAll('.sheet-backdrop').forEach(x => x.remove());
  }
  /** 底部回饋視窗 */
  feedback({ ok, title, html = '', btn = '下一題 ›' }) {
    Sound.play(ok ? 'ok' : 'bad');
    return new Promise(res => {
      const sheet = U.el(`
        <div class="sheet-backdrop">
          <div class="sheet ${ok ? 'ok' : 'bad'}" role="dialog" aria-live="assertive">
            <div class="sheet-title">${title || (ok ? '🎉 答對了！' : '🤔 差一點！')}</div>
            <div class="sheet-body">${html}</div>
            <button class="btn primary big" type="button">${btn}</button>
          </div>
        </div>`);
      this.root.appendChild(sheet);
      requestAnimationFrame(() => sheet.classList.add('show'));
      sheet.querySelector('button').addEventListener('click', () => { sheet.remove(); res(); }, { once: true });
    });
  }
  /** 結算 */
  finish(score, max, { scoreText } = {}) {
    if (!this.alive) return;
    const stars = starsFor(score, max);
    const isNew = Progress.record(this.game.id, stars, score);
    const msgs = ['別灰心，再挑戰一次！', '不錯喔，再接再厲！', '表現很棒！', '太厲害了！測量大師！'];
    Sound.play(stars >= 2 ? 'win' : 'ok');
    this.setHud('完成');
    this.stage.innerHTML = `
      <div class="card result">
        <div class="result-stars">${[0, 1, 2].map(i =>
          `<span class="big-star ${i < stars ? 'on' : ''}" style="animation-delay:${0.2 + i * 0.25}s">★</span>`).join('')}</div>
        <h2>${msgs[stars]}</h2>
        <p class="result-score">${scoreText || `得分 <b>${score}</b> / ${max}`}</p>
        ${isNew ? '<p class="new-record">🏅 刷新最佳紀錄！</p>' : ''}
        <div class="result-actions">
          <button class="btn primary big" data-act="again" type="button">🔁 再玩一次</button>
          <button class="btn big" data-act="island" type="button">🏝️ 回到島嶼</button>
        </div>
      </div>`;
    this.stage.querySelector('[data-act=again]').addEventListener('click', () => this.app.startGame(this.game.id));
    this.stage.querySelector('[data-act=island]').addEventListener('click', () => {
      location.hash = '#island-' + this.game.island;
    });
  }
}
