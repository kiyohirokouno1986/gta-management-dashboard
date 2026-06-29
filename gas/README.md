# gas/ — 組織限定ウェブアプリ配信（Apps Script）

ダッシュボードを **Google 組織内限定の URL** で配信するための Apps Script 一式です。
`Index.html` は Vite の自己完結ビルド（CSS/JS/データを全てインライン化した単一HTML）で、`Code.gs` がそれを `HtmlService` で配信します。`appsscript.json` の `access: "DOMAIN"` により、閲覧は組織の Google アカウントでログインしたユーザーに限定されます（データは外部に出ません）。

`Index.html` を再生成するには、リポジトリのルートで:

```bash
npm run build:gas   # SINGLE ビルド → gas/Index.html を更新
```

## デプロイ手順（clasp・推奨）

[clasp](https://github.com/google/clasp)（Apps Script CLI）でローカルから push できます。

```bash
npm i -g @google/clasp
clasp login                       # 配信したい Google 組織アカウントでログイン

# 既存のApps Scriptプロジェクトに載せる場合（元の「部門別PL」プロジェクト等）
clasp clone <scriptId>            # 例: 既存プロジェクトのIDでclone
#   → 既存ファイルを本フォルダの Code.gs / Index.html / appsscript.json で置き換え

# もしくは新規作成
clasp create --type webapp --title "ユニットMTGダッシュボード"

clasp push                        # gas/ の3ファイルをアップロード
clasp deploy                      # ウェブアプリとしてデプロイ
```

`.clasp.json`（clone/create で自動生成）の `rootDir` をこの `gas/` に向けると、`Code.gs` / `Index.html` / `appsscript.json` がそのまま対象になります。サンプルは `.clasp.json.example` を参照。

デプロイ後、Apps Script エディタの「デプロイ ▸ デプロイを管理」で
**実行＝自分 / アクセス＝組織内の全員** を確認すると、`https://script.google.com/.../exec` の
**組織限定URL** が得られます。これを Google Sites に「埋め込み」すれば、元の運用と同じ形になります。

## 手動デプロイ（clasp を使わない場合）

1. <https://script.google.com> で新規プロジェクト。
2. `Code.gs` の中身を貼り付け。
3. ＋（ファイル追加）▸ HTML ▸ 名前を **`Index`** にして `Index.html` の中身を貼り付け（**大文字小文字一致**。`Code.gs` の `createHtmlOutputFromFile('Index')` と合わせる）。
4. プロジェクトの設定で「appsscript.json マニフェストを表示」を有効化し、内容を `appsscript.json` に合わせる（`access: "DOMAIN"`）。
5. デプロイ ▸ 新しいデプロイ ▸ 種類＝ウェブアプリ ▸ 実行＝自分 / アクセス＝組織内 ▸ デプロイ。

> 月次更新時は `npm run build:gas` で `Index.html` を作り直し、`clasp push`（または貼り替え）→ 再デプロイ。
