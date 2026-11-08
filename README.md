# 🏝️ 理化群島大冒險

國中理化闖關遊戲網站，**用手機瀏覽器就能玩**，不需要安裝 App。純 HTML / CSS / JavaScript，沒有任何外部套件，可以直接放上 GitHub Pages。

## 第 1 站：測量島 📏

| 關卡 | 名稱 | 學習內容 | 玩法 |
|---|---|---|---|
| 1 | 📏 尺規神射手 | 長度測量、準確值＋估計值 | 讀直尺（1 cm／1 mm 刻度），輸入長度；可放大、左右滑動 |
| 2 | ⚖️ 天平平衡大師 | 質量、上皿天平、左物右碼、騎碼 | 點砝碼放上右盤讓天平平衡，再算出質量 |
| 3 | 🧪 量筒排水法 | 體積、凹液面讀數、排水法、1 mL = 1 cm³ | 讀 V₁ → 放入物體讀 V₂ → 算出體積 |
| 4 | 🧊 密度偵探社 | D = M / V、用密度辨認物質、沉浮 | 算密度 → 查密度表 → 預測沉浮（最後一題在水銀裡！） |
| 5 | ⏱️ 單位換算快打 | 長度／質量／體積單位換算 | 60 秒限時選擇題，答錯扣 3 秒 |
| 👑 | 🐙 島主大章魚 | 測量觀念總複習 | 10 題觀念選擇題 |

每關依得分給 0～3 顆星，進度自動存在手機瀏覽器中（localStorage）。其他島嶼（物質島、聲波島、光影島…）已預留在地圖上，標示「即將開放」。

## 在電腦上試玩

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```

也可以直接用瀏覽器打開 `index.html`。

## 發布到網路（讓學生用手機玩）

1. 把這個分支合併到 `main`
2. GitHub 專案 → **Settings → Pages** → Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾 `/ (root)`
3. 幾分鐘後就會得到網址：`https://<帳號>.github.io/<專案名稱>/`
4. 把網址做成 QR Code 給學生掃描；在手機上可以「加入主畫面」，像 App 一樣開啟

## 檔案結構

```
index.html          入口頁
css/style.css       樣式（手機優先）
js/core.js          共用工具、音效、進度、遊戲外殼
js/app.js           群島地圖、島嶼頁、路由
js/games/*.js       各關卡（length / mass / volume / density / units / boss）
```

## 新增島嶼

1. 在 `js/games/` 新增關卡檔，格式參考現有的 `GAMES.xxx = { id, island, icon, title, subtitle, intro, run(sh) }`
2. 在 `index.html` 引入該檔
3. 在 `js/app.js` 的 `ISLANDS` 中把該島設為 `open: true` 並填入 `levels`
