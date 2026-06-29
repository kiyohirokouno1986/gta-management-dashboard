/**
 * ユニットMTGダッシュボード — 組織限定ウェブアプリ配信
 *
 * Vite で自己完結ビルドした単一HTML（Index.html）をそのまま配信する。
 * データは Index.html に埋め込み済みのため外部通信は無く、
 * アクセスは appsscript.json の access:"DOMAIN" でGoogle組織内に限定される。
 *
 * 月次更新: リポジトリで `npm run build:gas` → gas/Index.html を push → 再デプロイ。
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ユニットMTGダッシュボード')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // Google Sites などへの iframe 埋め込みを許可（閲覧は引き続き組織ログイン必須）
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
