# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data analysis project. Primary data source is `data/rr.xlsx` (Excel spreadsheet).

## Environment

Managed with `uv` (Python 3.12). Dependencies are declared in `pyproject.toml`.

```bash
uv add <package>       # Add a new package
uv run python          # Run a script in the project environment
uv run jupyter lab     # Launch JupyterLab
```

Temporary/exploratory scripts go in `tmp/`.

---

## Data Understanding

### Source

**平成26年度（2014年度）「市民の社会貢献に関する実態調査」集計結果**（内閣府）

- 対象：日本全国の一般市民
- 有効回答数：約 1,647 人
- ファイル：`data/rr.xlsx`

### Sheet Structure

| Sheet | Contents |
|-------|----------|
| 目次（市民） | 全162図表のタイトル一覧 |
| 2-29 〜 2-83 | クロス集計データ（55シート） |

目次には 2-1〜2-162 が記載されているが、このExcelに収録されているのは **2-29〜2-83 のみ**。2-1〜2-28（基本単純集計）と 2-84〜2-162 は別ファイルと思われる。

### Survey Themes

1. **ボランティア活動** — 関心・経験・参加分野・参加理由・妨げ・自治体への要望
2. **寄附活動** — 経験・金額・回数・方法・寄附先・分野・理由・妨げ
3. **NPO法人** — 関心・認定NPO法人の税制優遇認知・寄附意向・情報公開

### Cross-tabulation Axes

各テーマを以下の属性でクロス集計：

| 軸 | 区分例 |
|----|--------|
| 年齢 | 20代・30代・40代・50代・60歳以上 |
| 性別 | 男性・女性 |
| 婚姻状況 | 独身・既婚 |
| 地域 | 北海道・東北・北関東・南関東・東京・北陸甲信・東海・近畿・中国・四国・九州 |
| 職業 | 会社員・自営業・医師等資格職・主婦・学生・無職 等 |
| 年収 | 300万未満・300〜500万・500〜600万・600〜800万・800万以上 等 |

### Data Format Notes

- 各シートはヘッダーが複数行にまたがる非整形のExcel表 → `pd.read_excel(..., header=None)` で読む
- 数値はすべて **パーセンテージ（%）**
- サンプルサイズ（n=）は各行ラベルに埋め込まれている（例：`全体\n(n=1,646)`）
- 分野・理由・妨げ等の設問は**複数回答可**

---

## Analysis Report

### analysis_report.ipynb

メイン分析レポート。全55シートを網羅的に分析している。

```bash
uv run jupyter lab   # 起動後 analysis_report.ipynb を開く
```

再生成が必要な場合：

```bash
uv run python tmp/generate_notebook.py   # notebook を再生成
```

### Notebook Structure

| Section | 内容 | 使用シート |
|---------|------|-----------|
| 0. セットアップ | ライブラリ・定数 | — |
| 1. ユーティリティ | データローダー・描画関数 | — |
| 2. ボランティア活動への関心 | 年齢/性別/婚姻/地域/職業/年収別 | 2-29〜2-34 |
| 3. ボランティア活動経験 | 年齢/性別/婚姻/地域/職業/年収/関心別 | 2-35〜2-41 |
| 4. 参加分野 | 全体ランキング・性別・年齢・地域・職業別 | 2-42〜2-47 |
| 5. 参加理由 | 全体ランキング・性別・年齢・関心別 | 2-48〜2-55 |
| 6. 参加の妨げ | 全体ランキング・年齢/性別/関心/地域別 | 2-56〜2-63 |
| 7. 国・地方自治体への要望 | 全体ランキング・年齢/性別/関心別 | 2-64〜2-70 |
| 8. ボランティア経験×寄附クロス | 寄附経験/方法/相手/理由・要望の経験別比較 | 2-71〜2-83 |
| 9. 総合考察 | 主要知見・政策的示唆・データ限界 | — |

### Key Data Loading Pattern

```python
def load_sheet(sheet_name):
    # header=None で読み込み、行1以降で文字列値≥2の行をヘッダー行として検出
    # col 1 = グループラベル（n=付き）、col 2以降 = %値
    ...
```

- 単一回答（関心・経験）→ `plot_stacked()` で積み上げ横棒グラフ
- 複数回答・少グループ（≤5）→ `plot_multi_grouped()` でグループ別比較
- 複数回答・多グループ（>5）→ `plot_heatmap()` でヒートマップ
- 全体ランキング表示 → `plot_total_rank()` で降順棒グラフ

### Key Findings (Summary)

| テーマ | 主な知見 |
|--------|---------|
| 関心 | 約62%が関心あり、経験率は約27%。関心-行動ギャップ約35pt |
| 経験属性 | 60代・高収入・主婦/退職者層で参加率高 |
| 参加分野 | まちづくり(29%)・子ども育成(23%)・自然環境保全(21%) |
| 参加の妨げ | 「時間なし」「きっかけなし」「情報なし」が三大障壁 |
| 国への要望 | 情報提供充実・マッチング支援・休暇制度普及が上位 |
| ボランティア×寄附 | 経験者の寄附率73.7% vs 非経験者47.1%（+26pt） |

---

## data01 データ理解

### 概要

出典：**令和６年度（2024年度）福祉行政報告例**（厚生労働省）
テーマ：市町村における障害者・障害児への**相談支援**の利用状況
エンコード：Shift-JIS（`shift_jis`で読み込み）
探索スクリプト：`tmp01/explore_data.py`、`tmp01/explore_full.py`

---

### etusy0001_2024.csv — 第１表

**タイトル：** 市町村における相談支援を利用している障害者・児の実人員及び相談支援障害者数，
都道府県−指定都市−中核市 × 障害者−障害児、障害の種類（重複計上）別

| 項目 | 内容 |
|------|------|
| 行数 | 138行（ヘッダー8行 + データ130行） |
| 列数 | 28列 |
| 地域区分 | 都道府県（47）・指定都市別掲（20）・中核市別掲（62） |

**列構造（3グループ × 9列）：**

| グループ | 列 |
|----------|-----|
| 総数 | 相談支援実人員、相談支援障害者数（総数・身体・重症心身・知的・精神・発達・高次脳・その他） |
| 障害者 | 同上 |
| 障害児 | 同上 |

**全国合計（総数）：**

| 指標 | 人数 |
|------|------|
| 相談支援実人員 | 1,495,941人 |
| 相談支援障害者数（総数） | 1,898,500人 |
| うち 精神障害 | 579,052人（30.5%・最多） |
| うち 知的障害 | 500,562人（26.4%） |
| うち 身体障害 | 466,470人（24.6%） |
| うち 発達障害 | 189,784人（10.0%） |
| うち その他 | 119,067人（6.3%） |
| うち 重症心身障害 | 28,163人（1.5%） |
| うち 高次脳機能障害 | 15,402人（0.8%） |

障害者（成人）：1,219,410人 / 障害児：276,531人（約18.5%）

**特記事項：**
- 重複計上あり（複数の障害種別をもつ場合に複数カウント）
- 地域ごとに指定都市・中核市は都道府県集計から**別掲**（二重計上ではなく参考掲載）
- 一部データに `-`（ゼロまたは未集計）あり

---

### housy0018_2024.csv — 第１８表

**タイトル：** 市町村における相談支援を利用している障害者・児の実人員及び相談支援障害者数，
障害者−障害児 × 障害の種類（重複計上）別

| 項目 | 内容 |
|------|------|
| 行数 | 10行（ヘッダー7行 + データ3行） |
| 列数 | 10列 |
| 区分 | 総数・障害者・障害児の3行のみ |

etusy第１表の**全国集計値を障害者／障害児で分解した要約表**。
数値は第１表の全国行と一致する。

---

### 2ファイルの関係

```
housy0018（第18表）：全国合計のみ・3行
    ↕ 同一の数値を共有
etusy0001（第1表）：地域別（都道府県・政令市・中核市）に展開・130行
```

---

## HTMLレポート編集履歴

### analysis_report/index.html

- フッター（`<footer>`）の末尾に以下を追記：
  ```html
  <div class="footer-credit" style="text-align:center;">Edited by Sur Communication Inc.</div>
  ```

---

## data02 レポート作成手順

### 成果物

| ファイル | 内容 |
|---------|------|
| `report_data02/images/` | matplotlib で生成した分析チャート画像（fig01〜fig21） |
| `report_data02/report.md` | Markdown 分析レポート（📊データ引用 / 🌐Web引用を区別） |
| `report_data02/html_report/index.html` | HTML/CSS/JS インタラクティブレポート |
| `report_data02/html_report/style.css` | スタイルシート |
| `report_data02/html_report/script.js` | Chart.js グラフ定義・アニメーション |

### 画像生成スクリプト

```
tmp02/generate_images.py   # 全21枚を生成（Anaconda Python で実行）
tmp02/regen_figs.py        # fig04/05/06 のみ再生成（修正時）
```

実行方法（`uv` が使えない場合は Anaconda Python を直接指定）：

```bash
"C:\Users\zunov\anaconda3\python.exe" tmp02/generate_images.py > output.txt 2>&1
cat output.txt
```

### load_pct() の重要な注意点

`data02/` の Excel は各シートが多段ヘッダー構造。以下のパターンで解析：

- `header=None` で読み込み → `回答者数` を含むセルでヘッダー行を自動検出
- n行（回答者数）と pct行（100%合計）がペアで並ぶ → 2行セットで1レコードとして取得
- **列名**: 全角チルダ `～` を使用（例: `'10～12点（常にある）'`）。半角 `~` では列が見つからない
- **インデックス名**: 集計区分ラベルが長い複合文字列（例: `'性×現在の仕事別 性別(計) 正社員'`）

### シート別インデックス構造（data02/01 孤独感...xlsx）

| シート | 集計行の位置 | 主な区分 |
|-------|------------|---------|
| 1-1 | iloc[0] = 全体 | UCLA尺度・直接質問 |
| 1-5 | iloc[1:7] | 世帯構成6区分（ひとり世帯〜その他） |
| 1-7 | iloc[1:10] | 職業9区分（正社員〜その他） |
| 1-8 | iloc[9:18] | 世帯年収8区分（100万円未満〜1500万円以上） |

**重要**: iloc[1:7] のような位置指定を使うこと。キーワード検索（`kw in idx`）は同名インデックスが複数行あるため重複データが発生する。

### Chart.js グラフのダークテーマ化

全インラインチャートに濃い背景 `#0d1b2a` を適用する共通プラグイン：

```js
const darkBg = {
  id: 'darkBg',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};
// 各 new Chart(...) に plugins: [darkBg] を渡す
```

データポイント上に値ラベルを描画するインラインプラグインも定義済み（script.js の `trendLabelPlugin` 参照）。

### フッタークレジットの配置方法

フッターが `display: flex; justify-content: space-between` の場合、
全幅の最終行に中央配置するには `flex-wrap: wrap` + `width: 100%` を使う：

```css
.report-footer {
  flex-wrap: wrap;
}
.report-footer .footer-credit {
  width: 100%; text-align: center;
  border-top: 1px solid rgba(255,255,255,.1);
  padding-top: 12px;
}
```

```html
<div class="footer-credit">Edited by Sur Communication Inc.</div>
```

### Python 実行環境（Windows）

- `uv` が使えない場合: `C:\Users\zunov\anaconda3\python.exe` を直接使用
- ターミナル出力に日本語が含まれる場合: `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')` を先頭に追加してファイルにリダイレクト（`> output.txt`）し、`cat` で読む

### HTMLレポートのグラフ表示レビュー（必須）

ミス（2026年3月）: data05 レポートで静的画像の `src` パスが `../../images/` と2階層上になっており、実際のファイル構造（`html_report/` と `images/` は同階層）と一致せず、全グラフが表示されなかった。

**対策：HTMLレポートを作成・修正した後は、必ず以下を確認すること：**

1. **画像パスの確認** — `<img src="...">` の相対パスが実際のディレクトリ構造と一致しているか検証する
   - `html_report/index.html` から `images/` へのパスは `../images/` （1階層上）
   - `../../images/` のように余分な `../` が付いていないか確認
2. **Chart.js キャンバスの確認** — `<canvas id="...">` に対応する `new Chart(...)` が script.js 内に存在するか確認
3. **CDN リンクの確認** — Chart.js 等の CDN URL が正しく記載されているか確認
4. **ローカルで開いて目視確認** — ブラウザでファイルを直接開き、全セクションのグラフが表示されることを確認してからコミットする

---

### ルート index.html のリダイレクト管理（重要）

ミス（2026年3月）: 新しい data04 レポートを作成・プッシュした後も、ルートの `index.html` が旧レポート（data03 孤独・孤立）にリダイレクトしたままだったため、GitHub Pages でアクセスすると前回のレポートが表示されていた。

**対策：新しいレポートを追加したら必ず以下を確認・更新すること：**

1. ルート `index.html` のリダイレクト先を新しいレポートフォルダに変更する
   ```html
   <meta http-equiv="refresh" content="0; url=data04/%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88/html_report/">
   ```
2. 変更後に `git push` して GitHub Pages に反映する
3. ブラウザでルートURLにアクセスし、正しいレポートが表示されることを確認する

**リダイレクト先の履歴：**

| 対象レポート | リダイレクト先 |
|---|---|
| data01（障害者相談支援） | `analysis_report_data01/` |
| data02（孤独感・孤立） | `report_data02/html_report/` |
| data03（孤独・孤立 R6） | `レポート/html_report/` |
| data04（景気ウォッチャー）| `data04/レポート/html_report/` |
| data05（労働力調査）| `data05/%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88/html_report/` ← 現在 |

---

## data05 データ理解

### 概要

出典：**労働力調査 長期時系列データ**（総務省統計局）
テーマ：労働力人口・就業者・完全失業者・完全失業率等の長期推移
データ格納先：`data05/労働力推移/`
エンコード：`.xlsx` は `openpyxl`（data_only=True）、`.xls` は `xlrd`

---

### ファイル構成（54ファイル）

| グループ | ファイル | 内容 |
|----------|----------|------|
| **lt01-a** (a10〜a90) | 9本 | 主要指標月次：労働力人口・就業者・雇用者・完全失業者・非労働力人口・失業率 |
| **lt01-b** (b10〜b60) | 6本 | 年齢階級別（10歳刻み・5歳刻み） |
| **lt01-c / d** | 各3本 | 産業別就業者（農業・建設・製造・サービス等） |
| **lt01-e** (e10〜e30) | 3本 | 地域別（南関東・近畿等） |
| **lt02** | 2本 | 完全失業率詳細（求職理由・求職期間別） |
| **lt03** (01〜11) | 11本 | 就業者の産業・職業・雇用形態別（男女別） |
| **lt04** (01〜02) | 2本 | 従業上の地位別・非正規雇用種類別（年次） |
| **lt05** (01〜06) | 6本 | 産業別就業者（年次）・転職者等 |
| **lt06** | 2本 | 追加就労・副業希望者等 |
| **lt07** | 1本 | 就業時間帯・週労働時間分布 |
| **lt08** (01〜04) | 4本 | 地域別詳細（月次・年次・季節調整値） |

### 共通データ形式

- **単位**：万人（または %）
- **時系列**：1953年〜2026年（月次）/ 一部は年次
- **シート**：`季節調整値` / `原数値` / `季節指数` / `※注_Notes`
- **ヘッダー**：複数行多段構造 → `header=None` / openpyxl で読み込み
- **データ開始行**（1-indexed）：
  - lt01-a10〜a20〜a30 原数値：min_row=11（実データは1972年〜）
  - lt01-a40 原数値：min_row=13（2013年〜）
  - lt04-01 長期04：min_row=10（年次・1953年〜）
  - lt05-05 長期05：min_row=10（年次・2002年〜）
  - lt08-02 季節調整値：min_row=8（四半期・1983年〜）
- **年パース**：col0が和暦文字列（例「昭和28年」→昭和+1925）、それ以外は整数年。parse_year()で統一処理

### 重要な注意点

- `原数値` シートは1972年（沖縄県算入後）からのデータ。1953〜1973年は `原数値 (沖縄県除く1953-1973)` シートに別掲
- 2011年3〜8月（東日本大震災）は補完推計値（< >内数値）
- 5年毎にベンチマーク人口切替あり（2022年1月に2020年国調へ切替）
- lt04-01 は旧分類（常雇・臨時雇・日雇）で2017年まで。正規・非正規の時系列は lt01-a40（2013年〜）

### data05 最新値（2026年1月）

| 指標 | 値 |
|------|-----|
| 就業者数 | 6,776万人 |
| 完全失業率（季調） | 2.7%（男2.9%・女2.5%） |
| 非正規比率 | 36.9%（正規3,687万・非正規2,155万） |
| 産業別最大（2025年） | 卸売・小売1,029万、製造業1,033万、医療福祉947万 |

### data05 成果物

| ファイル | 内容 |
|---------|------|
| `analysis_report_data05.ipynb` | 9セクション・25セルの分析ノートブック |
| `data05/レポート/images/` | matplotlib生成チャート（fig01〜fig12） |
| `data05/レポート/report.md` | Markdown分析レポート |
| `data05/レポート/html_report/index.html` | HTML/CSS/JSインタラクティブレポート（明るいUI） |

### 画像生成スクリプト（data05）

```
tmp/explore_data05.py               # 全54ファイルの概要探索
tmp/explore_data05_detail.py        # 主要ファイルの列構造詳細
tmp/generate_images_data05.py       # fig01〜fig12生成（Anaconda Python）
tmp/generate_notebook_data05.py     # analysis_report_data05.ipynb 再生成
```

実行方法：

```bash
/c/Users/zunov/anaconda3/python.exe tmp/generate_images_data05.py > output.txt 2>&1
cat output.txt
```

---

## data03 データ理解

### 概要

出典：**孤独・孤立対策に関する実態調査**（内閣官房 孤独孤立対策担当室）
テーマ：孤独感・孤立の実態（社会的交流・社会参加・行政支援）
調査対象：全国の一般市民（16歳以上）
データ格納先：`data03/01.孤独感に関する集計表/`

---

### ファイル構成（4バリエーション × 4テーマ = 16ファイル）

| ファイルパターン | 調査年度 | 全体 n= | シート数 |
|---|---|---|---|
| `*2023.xlsx` | 令和4年度（2022年調査） | 約11,141 | 40〜91 |
| `*_.xlsx` | 令和5年度（2023年調査） | 約11,218 | 38〜73 |
| `*(r6)20250423.xlsx` | **令和6年度（2024年調査・最新）** | 約10,871 | 43〜99 |
| `*_8.xlsx` | 別集計形式（性×年齢×指標の深堀り） | 約11,867 | 20〜24 |

### 4テーマの内容

| ファイル | テーマ | 主な測定内容 |
|---|---|---|
| `01 孤独感` | 孤独感 | UCLA孤独感尺度（3〜12点）・直接質問（しばしばある〜決してない） |
| `02 孤立（社会的交流）` | 社会的交流 | 同居していない家族・友人との①直接会う・②電話・③SNSメールの頻度 |
| `03 孤立（社会参加）` | 社会参加 | PTA・ボランティア・スポーツ趣味・その他活動への参加状況（複数回答） |
| `04 孤立（各種支援）` | 各種支援 | 行政機関・社会福祉協議会・NPO等からの支援受給状況 |

### データ形式（data02 と同じパターン）

- `header=None` で読み込み（多段ヘッダー）
- **pct行の判定**: n列の値が `100.0`（偶数行=件数、奇数行=%）
- ヘッダー行は「回答者数」を含む行で検出
- **n_label_cols**: 1（都市規模別）/ 2（性×年齢）/ 3（就業・世帯等）/ 4（孤独感×参加等）
- **重要**: インデックスは重複あり → `reindex()` は使用不可。必ず `iloc` で位置指定する

### シート別 iloc 位置（R6版・先頭セクション）

| シート | 取得方法 | 内容 |
|-------|---------|------|
| 1-1 | `iloc[0:6]` | 全体+都市規模5区分 |
| 1-2 | `iloc[1:8]` | 性別計×年齢7区分（16-19〜70代） |
| 1-5 | `iloc[0:7]` | 全体+世帯構成6区分 |
| 1-7 | `iloc[0:10]` | 全体+就業状況9区分 |
| 1-17 | `iloc[1:3]` | 年齢計×参加あり/なし |
| 1-26 | `iloc[0:6]` | 全体+生活満足度5区分 |
| 2-2 | `iloc[1:8]` | 性別計×年齢7区分 |
| 3-17 | `iloc[1:10]` | UCLA4区分+直接質問5区分 |
| 4-1 | `iloc[0:6]` | 全体+都市規模5区分 |

### data03 主要知見（令和6年度）

| テーマ | 主要知見 |
|--------|---------|
| 孤独感（UCLA） | UCLA高スコア（10-12点）6.5%、合計（7点以上）45.7% |
| リスク層 | 求職中18.6%、ひとり世帯9.9%、20-30代9-10% |
| 社会的交流 | 直接会っての交流「全くない」9.3%。高齢層・孤独感高い層で顕著 |
| 社会参加 | 参加率46.6%。UCLA高スコア層は24.3%と約半減 |
| 行政支援 | 受給率7.4%と低水準。町村10.7%が最高 |
| 生活満足度 | 「不満」層のUCLA高スコア31.5%（全体比+25pt） |

### data03 成果物

| ファイル | 内容 |
|---------|------|
| `analysis_report_data03.ipynb` | 7セクション・44セルの分析ノートブック |
| `レポート/images/` | matplotlib 生成チャート（fig01〜fig12） |
| `レポート/report.md` | Markdown 分析レポート |
| `レポート/html_report/index.html` | HTML/CSS/JS インタラクティブレポート（明るいUI） |
| `レポート/html_report/style.css` | スタイルシート（ライトテーマ） |
| `レポート/html_report/script.js` | Chart.js グラフ定義・スクロールアニメーション |

### 画像生成スクリプト（data03）

```
tmp/generate_images_data03.py     # 全12枚生成
tmp/generate_notebook_data03.py   # analysis_report_data03.ipynb 再生成
```

---

## data04 データ理解

### 概要

出典：**景気ウォッチャー調査**（内閣府・月次）
テーマ：地域の景気動向（景気ウォッチャーによる現状・先行き判断）
データ格納先：`data04/watcher5/`
エンコード：`.xls` 形式（xlrd で読み込み）

---

### ファイル構成（50ファイル）

| ファイル | 内容 | 行数/シート |
|---------|------|------------|
| `watcher1.xls` | 地域別DI推移（合計・家計動向） | 2シート・944行 |
| `watcher2-1.xls` | 全国・現状判断（方向性）回答者数・DI | 2464行 |
| `watcher2-2.xls` | 地域別・現状判断方向性 | 4310行・32列 |
| `watcher2-3.xls` | 現状判断の理由（選択肢別） | 2シート |
| `watcher2-4.xls` | 全国・先行き判断（方向性）DI | 2463行 |
| `watcher2-5.xls` | 地域別・先行き判断方向性 | 4309行 |
| `watcher2-6.xls` | 全国・現状判断（水準）DI | 2459行 |
| `watcher2-7.xls` | 地域別・現状判断水準 | 4310行 |
| `watcher3.xls` | 全国 分野・業種別DI推移（3指標） | 3シート・323行 |
| `watcher4.xls` | 景気ウォッチャー構成（地域・分野別人数・%） | 98行 |
| `watcher5.xls` | **季節調整値**（分野別・地域別DI） | 6シート・296行 |

`(1)〜(4)` サフィックス付きは過去版スナップショット（3行ずつ減少）。最新版はサフィックスなし。

### データ期間

| データ | 期間 |
|--------|------|
| 原系列（watcher3） | 2000年1月〜2026年2月 |
| 季節調整値（watcher5） | 2002年1月〜2026年2月 |

### データ形式

- `.xls` 形式 → `xlrd.open_workbook()` で読み込み（openpyxl 不可）
- 年：col 2 に `'2000年'` 形式の文字列（1月のみ記入、他は空）
- 月：col 3 に全角日本語 `'１月'`〜`'１２月'` 形式
- watcher5 は col 1=year, col 2=month（float: 1.0〜12.0）
- watcher2-1 は col 0 が Excel シリアル日付 → `xlrd.xldate_as_datetime(v, 0)` で変換

### watcher3 列マッピング

| 列 | 内容 |
|----|------|
| 4 | 合計DI |
| 5 | 家計動向関連 |
| 6 | 小売関連 |
| 15 | 飲食関連 |
| 16 | サービス関連 |
| 21 | 住宅関連 |
| 22 | 企業動向関連 |
| 23 | 製造業 |
| 24 | 非製造業 |
| 25 | 雇用関連 |

### watcher5 地域列マッピング（シート3・4）

| 列 | 地域 |
|----|------|
| 3 | 全国 |
| 4 | 北海道 |
| 5 | 東北 |
| 6 | 関東（計） |
| 7 | 北関東 |
| 8 | 南関東 |
| 9 | 東京都 |
| 10 | 甲信越 |
| 11 | 東海 |
| 12 | 北陸 |
| 13 | 近畿 |
| 14 | 中国 |
| 15 | 四国 |
| 16 | 九州 |
| 17 | 沖縄 |

### data04 主要知見（2026年2月時点）

| 指標 | 値 |
|------|-----|
| 現状判断DI（季節調整値） | 48.9（前月比+1.3pt） |
| 先行き判断DI（季節調整値） | 50.0（前月比-0.1pt） |
| 基調判断 | 「持ち直している」 |
| 改善要因 | 天候回復、サービス・飲食回復 |
| リスク要因 | 4月以降の値上げ、米国関税 |

### data04 成果物

| ファイル | 内容 |
|---------|------|
| `analysis_report_data04.ipynb` | 10セクション・33セルの分析ノートブック |
| `data04/レポート/images/` | matplotlib生成チャート（fig01〜fig12） |
| `data04/レポート/report.md` | Markdown分析レポート |
| `data04/レポート/html_report/index.html` | HTML/CSS/JSインタラクティブレポート（明るいUI） |

### 画像生成スクリプト（data04）

```
tmp/generate_images_data04.py     # 全12枚生成
tmp/generate_notebook_data04.py   # analysis_report_data04.ipynb 再生成
tmp/export_chartdata.py           # script.js の DATA 定数を実データで更新
```

実行方法：

```bash
/c/Users/zunov/anaconda3/python.exe tmp/generate_images_data04.py > output.txt 2>&1
cat output.txt
```

### watcher2-1.xls の複数セクション問題

watcher2-1.xls は「全国合計」「地域別（北海道・東北・…）」が縦に連続して格納されている。
全セクションに同一の Excel シリアル日付が繰り返されるため、インデックス重複が生じる。

**対策**: 全国合計行は回答者数（col 1）が 800 人以上。これで地域別サブセクション（200 人以下）を除外できる。

```python
# watcher2-1 の全国合計フィルタ
total = ws.cell_value(r, 1)
if not isinstance(total, float) or total < 800:
    continue
```

### HTMLレポートのChart.js データ管理

**ミス（2026年3月）**: script.js の `DATA` 定数にハードコードされた推定値を使用してしまい、
data04 の実データと乖離した数値が表示されていた。

**対策**: `tmp/export_chartdata.py` で毎回 data04/watcher5/ から実データを読み出し、
script.js の `DATA` ブロックを正規表現で置換する方式に変更。
データ再生成時は必ずこのスクリプトも再実行すること。

```bash
# script.js 実データ更新手順
/c/Users/zunov/anaconda3/python.exe tmp/export_chartdata.py > output.txt 2>&1
cat output.txt
```

### HTMLレポートのグラフ拡大モーダル（標準仕様）

全HTMLレポートに「グラフをクリックで拡大表示」するモーダル機能を標準搭載すること。

**実装ファイル：**

`index.html` — body末尾（`<script src="script.js">` の直前）にモーダルHTMLを追加：
```html
<div id="chartModal" class="chart-modal" role="dialog" aria-modal="true" aria-label="グラフ拡大表示">
  <div class="chart-modal-backdrop"></div>
  <div class="chart-modal-content">
    <button class="chart-modal-close" aria-label="閉じる">&times;</button>
    <img id="chartModalImg" src="" alt="拡大グラフ">
  </div>
</div>
```

`style.css` — モーダルスタイルと、クリック可能を示すホバーエフェクトを追加：
- `.chart-img-wrap img` に `cursor: zoom-in; transition: transform 0.2s`
- `.chartjs-canvas-wrap` に `cursor: zoom-in`
- `.chart-modal` / `.chart-modal-backdrop` / `.chart-modal-content` / `.chart-modal-close` のモーダルスタイル一式
- `@keyframes modalIn` でスケールアニメーション

`script.js` — `initChartModal()` 関数を定義し、`DOMContentLoaded` で呼び出す：
```js
function initChartModal() {
  // 静的画像: img.src をそのままモーダルに渡す
  document.querySelectorAll('.chart-img-wrap img').forEach(img => {
    img.addEventListener('click', () => openModal(img.src));
  });
  // Chart.js canvas: toDataURL('image/png') で画像化（500ms遅延で描画完了後に登録）
  setTimeout(() => {
    document.querySelectorAll('.chartjs-canvas-wrap canvas').forEach(canvas => {
      canvas.addEventListener('click', () => openModal(canvas.toDataURL('image/png')));
    });
  }, 500);
  // 閉じる: backdrop クリック・× ボタン・Escape キー
}
```

**操作仕様：**

| 操作 | 動作 |
|------|------|
| グラフ（画像・Chart.js）クリック | モーダルで拡大表示 |
| 暗い背景クリック | 閉じる |
| `×` ボタンクリック | 閉じる |
| `Esc` キー | 閉じる |

---

## Git 設定

### リポジトリ

- リモート: `https://github.com/zunovia/data-analysis-h26-npo-01.git`
- ブランチ: `master`
- 接続方式: HTTPS（SSHは未設定）

### ユーザー情報（このリポジトリローカル設定）

```bash
git config user.name "Jinou Zunovia"
git config user.email "kaneda.ryota@gmail.com"
```

### 初回コミット時の注意

- SSH接続は未設定のため、リモートURLは必ずHTTPSを使用する
- `.claude/` ディレクトリと `tmp/` ディレクトリはコミット対象外とする
