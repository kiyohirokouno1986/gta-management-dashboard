# legacy/ — 正本（Apps Script 版）

このフォルダは、Cowork で運用していた **部門別PL運用ダッシュボードの正本実装**（Google Apps Script ウェブアプリ）をそのまま保存したものです。`src/` の Vite + TypeScript 版は、ここからロジックと表示を忠実に移植しています。差分検証の基準（リファレンス）として残しています。

- `appsscript/Code.gs` … `doGet()` と `gridFor_()`。10期計画＆実績シートをサーバー側で読み、`Page.html` に `LIVE`（plan/act）を注入。
- `appsscript/Page.html` … 単一HTMLのダッシュボード本体（`SNAP` 埋め込み＋描画ロジック）。
- `appsscript/appsscript.json` … マニフェスト（タイムゾーン、Web アプリ設定：実行＝自分／アクセス＝DOMAIN）。

> 注意: `Code.gs` の元ファイル名は Apps Script 上で `コード.gs` でした。Git では `Code.gs` として保存しています。

移植にあたって、Apps Script 版で定義されていたものの描画経路から呼ばれていなかった関数（`compCards` / `brkBox` / `trend` / `banner` / `targetLine` / MQ会計タブ系 `mqModel`〜`renderMQ` など）は、現行の表示を忠実再現する観点から `src/` には移植していません。必要になった時点で本フォルダを参照して追加できます。
