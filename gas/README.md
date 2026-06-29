# gas/ — 組織限定ウェブアプリ配信（Apps Script・ライブデータ版）

ダッシュボードを **Google 組織内限定の URL** で配信する Apps Script 一式です。

- `Code.gs` … `doGet` が **2つの Google シートをサーバー側で読み込み**、`Index.html` に注入して配信します。
  - `LIVE_SHEET_ID` … 10期計画＆実績シート（売上・計画）
  - `SNAP_SHEET_ID` … 部門別PL（連携用）シート（利益段・配賦人月）
- `Index.html` … Vite の自己完結ビルド（CSS/JS/フォールバックデータをインライン化したSPA）。注入データがあればそれを使い、無ければ埋め込みデータで表示。
- `appsscript.json` … `access: "DOMAIN"`（組織限定）。

## 月次更新（端末作業なし）

**「部門別PL（連携用）」シートを書き換えるだけ**です。再ビルドも再デプロイも不要で、ページを開けば最新になります。

- 新しい月: シートに6行（`合計 / SaaS注文 / 不動産仲介 / CX / auka / コンサル`）を追加。`月` 列は `YYYY-MM`。
- 既存月の修正: 該当セルを直すだけ。
- 列: `月, 部門, 売上高, 売上総利益, 直接コスト①, 直接コスト②, 直接コスト計, 貢献利益, 間接コスト, 部門利益, 配賦人月`。

売上・計画は 10期シート側を編集すれば同様に反映されます。

## 部門別PLシートのIDを差し替える場合

別のシートに切り替えたいときは `Code.gs` の `SNAP_SHEET_ID`（／`LIVE_SHEET_ID`）を新しいファイルIDに変更し、`clasp push --force` → 「デプロイを管理」で新バージョンをデプロイ（URLは不変）。

## 初回デプロイ / コード更新（clasp）

`Index.html` や `Code.gs` を変えたときだけ実行します（データ更新では不要）。

```bash
npm i -g @google/clasp
clasp login
clasp create --title "GTA-Dashboard" --rootDir gas   # 初回のみ。既存なら clasp clone <scriptId> --rootDir gas
clasp push --force
clasp deploy --deploymentId <DEPLOYMENT_ID>           # 既存と同じURLで更新（初回は素の clasp deploy）
```

`Index.html` を作り直す場合はリポジトリのルートで `npm run build:gas`（SINGLE ビルド → `gas/Index.html` 更新）。

> 初回デプロイ後、Apps Script エディタの「デプロイ ▸ デプロイを管理」で **実行＝自分／アクセス＝組織内** を確認すると、`https://script.google.com/.../exec` の組織限定URLが得られます。Google Sites への埋め込みも可。

## 手動デプロイ（clasp を使わない場合）

`Code.gs` をエディタに貼り付け、HTMLファイル名 **`Index`** に `Index.html` を貼り付け、`appsscript.json`（`access:"DOMAIN"`）を設定 → デプロイ ▸ ウェブアプリ ▸ 実行＝自分／アクセス＝組織内。
