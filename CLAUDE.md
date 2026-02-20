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
