/**
 * ユニットMTGダッシュボード — 組織限定ウェブアプリ配信（ライブデータ版）
 *
 * doGet が以下2つの Google スプレッドシートをサーバー側で読み込み、
 * ビルド済みSPA（Index.html）に注入して配信する：
 *   ① 10期計画＆実績シート → LIVE（売上・計画。plan/act グリッド）
 *   ② 部門別PL（連携用）シート → SNAP（利益段・配賦人月）
 *
 * 月次更新は ② のシートに新しい月の行を足す／数値を直すだけ。
 * コード変更も再デプロイも不要で、ページを開けば常に最新になる。
 *
 * アクセスは appsscript.json の access:"DOMAIN" で組織内に限定。
 * シート読み込みに失敗した場合は Index.html に焼き込み済みの
 * スナップショット（フォールバック）で表示する。
 */

var LIVE_SHEET_ID = '15ybH2lLFLpV0DqgeVWawsrArhKcL8jHdC_Yp7eQ5dhI';
var SNAP_SHEET_ID = '1q9ZHh46foHIipRrDc--3abtD1IRSs75uEuI6gYnRcS8';
var ISSUES_SHEET_ID = '1_w4OI2gSy-e0CC1ddZL5dboLVgHZQBj1LA6IXwTYdVE';

// 部門別PLシートの「部門」名 → SNAPキー
var UNIT_MAP = {
  '合計': 'zen',
  'SaaS注文': 'chumon',
  '不動産仲介': 'fudosan',
  'CX': 'cx',
  'auka': 'auka',
  'コンサル': 'consul'
};
// 部門別PLシートの利益段ヘッダ → SNAPメトリクスキー
var METRIC_MAP = {
  '売上高': 'uri',
  '売上総利益': 'gp',
  '直接コスト①': 'dc1',
  '直接コスト②': 'dc2',
  '直接コスト計': 'dctot',
  '貢献利益': 'kou',
  '間接コスト': 'ind',
  '部門利益': 'bu',
  '配賦人月': 'jin'
};
var METRIC_KEYS = ['uri', 'gp', 'dc1', 'dc2', 'dctot', 'kou', 'ind', 'bu', 'jin'];
var UNIT_KEYS = ['consul', 'auka', 'chumon', 'fudosan', 'cx', 'zen'];

function doGet() {
  var injected = '';
  try {
    var live = readLive_();
    var snap = readSnap_();
    var months = snap.__months;
    delete snap.__months;
    var issues = readIssues_();
    injected =
      '<script>' +
      'window.__LIVE__=' + JSON.stringify(live) + ';' +
      'window.__SNAP__=' + JSON.stringify(snap) + ';' +
      'window.__MONTHS__=' + JSON.stringify(months) + ';' +
      'window.__ISSUES__=' + JSON.stringify(issues) + ';' +
      '</script>';
  } catch (e) {
    // シート読み込み失敗時は注入しない → SPA は埋め込みデータで表示
    injected = '<!-- live data unavailable: ' + (e && e.message ? e.message : e) + ' -->';
  }

  var page = HtmlService.createHtmlOutputFromFile('Index').getContent();
  // 関数置換で $&,$1 等の特殊解釈を回避（注入データに $ が含まれても安全）
  page = page.replace('</head>', function () { return injected + '\n</head>'; });

  return HtmlService.createHtmlOutput(page)
    .setTitle('ユニットMTGダッシュボード')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 10期シートの plan/act グリッド（3行目以降 × H〜T列）を返す。 */
function readLive_() {
  var ss = SpreadsheetApp.openById(LIVE_SHEET_ID);
  return { plan: gridFor_(ss, '10期計画'), act: gridFor_(ss, '10期実績') };
}

function gridFor_(ss, prefix) {
  var sheets = ss.getSheets(), sh = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().indexOf(prefix) === 0) { sh = sheets[i]; break; }
  }
  if (!sh) throw new Error('シートが見つかりません: ' + prefix);
  var v = sh.getDataRange().getValues(), out = [];
  for (var r = 2; r < v.length; r++) {            // r=2 → シート3行目 → index 0
    var row = v[r], cells = [];
    for (var c = 7; c <= 19; c++) {                // H〜T列（2月〜通期）
      cells.push(row[c] === undefined || row[c] === null ? '' : row[c]);
    }
    out.push(cells);
  }
  return out;
}

/**
 * 部門別PLシート（縦持ち：月 × 部門 × 利益段）を SNAP オブジェクトに変換。
 * 返り値: { consul:{uri:[...],...,jin:[...]}, ..., zen:{...}, __months:["2月",...] }
 */
function readSnap_() {
  var ss = SpreadsheetApp.openById(SNAP_SHEET_ID);
  var sh = ss.getSheets()[0];
  var v = sh.getDataRange().getValues();
  if (!v.length) throw new Error('部門別PLシートが空です');

  // ヘッダ行（「月」「部門」を含む行）を探す
  var hr = -1;
  for (var r = 0; r < v.length; r++) {
    var rowText = v[r].join('');
    if (rowText.indexOf('月') >= 0 && rowText.indexOf('部門') >= 0) { hr = r; break; }
  }
  if (hr < 0) throw new Error('ヘッダ行（月/部門）が見つかりません');

  var header = v[hr];
  var colMonth = -1, colUnit = -1, metricCol = {};
  for (var c = 0; c < header.length; c++) {
    var h = ('' + header[c]).trim();
    if (h === '月') colMonth = c;
    else if (h === '部門') colUnit = c;
    else if (METRIC_MAP[h]) metricCol[METRIC_MAP[h]] = c;
  }
  if (colMonth < 0 || colUnit < 0) throw new Error('「月」「部門」列が見つかりません');

  // 月の出現順を保持しつつ重複排除
  var monthOrder = [], monthIndex = {};
  var records = [];
  for (var r2 = hr + 1; r2 < v.length; r2++) {
    var row = v[r2];
    var m = monthKey_(row[colMonth]);             // 日付/文字列どちらでも "YYYY-MM" に正規化
    var uName = ('' + row[colUnit]).trim();
    if (!m || !uName || !UNIT_MAP[uName]) continue;
    if (!(m in monthIndex)) { monthIndex[m] = monthOrder.length; monthOrder.push(m); }
    records.push({ m: m, key: UNIT_MAP[uName], row: row });
  }
  monthOrder.sort();                                // YYYY-MM の昇順
  for (var i = 0; i < monthOrder.length; i++) monthIndex[monthOrder[i]] = i;
  var n = monthOrder.length;
  if (!n) throw new Error('部門別PLの明細行がありません');

  // 初期化
  var snap = {};
  UNIT_KEYS.forEach(function (uk) {
    snap[uk] = {};
    METRIC_KEYS.forEach(function (mk) {
      snap[uk][mk] = new Array(n).fill(0);
    });
  });

  // 値の充填
  records.forEach(function (rec) {
    var mi = monthIndex[rec.m];
    METRIC_KEYS.forEach(function (mk) {
      var c = metricCol[mk];
      if (c === undefined) return;
      var raw = rec.row[c];
      var num = (raw === '' || raw === null || raw === undefined) ? 0 : parseFloat(('' + raw).replace(/,/g, ''));
      snap[rec.key][mk][mi] = isNaN(num) ? 0 : num;
    });
  });

  // 月ラベル "YYYY-MM" → "M月"
  snap.__months = monthOrder.map(function (m) {
    var mm = parseInt(('' + m).split('-')[1], 10);
    return isNaN(mm) ? ('' + m) : (mm + '月');
  });
  return snap;
}

/**
 * 「月」セルを "YYYY-MM" 文字列に正規化する。
 * Googleシートは "2026-02" を日付値に自動変換することがあるため、
 * Date でも文字列でも同じキーになるようにする（並び替え・ラベル生成の前提）。
 */
function monthKey_(raw) {
  if (raw instanceof Date) {
    var y = raw.getFullYear();
    var mo = raw.getMonth() + 1;
    return y + '-' + (mo < 10 ? '0' + mo : '' + mo);
  }
  return ('' + raw).trim().replace(/\//g, '-');
}

function cell_(v) { return v == null ? '' : ('' + v).trim(); }

/** 課題ボードシート（課題/カテゴリ/象限/メモ/担当/期限）を配列に変換。 */
function readIssues_() {
  var ss = SpreadsheetApp.openById(ISSUES_SHEET_ID);
  var sh = ss.getSheets()[0];
  var v = sh.getDataRange().getValues();
  if (!v.length) return [];
  var hr = 0;
  for (var r = 0; r < v.length; r++) {
    if (('' + v[r].join('')).indexOf('課題') >= 0) { hr = r; break; }
  }
  var H = v[hr], col = {};
  for (var c = 0; c < H.length; c++) {
    var h = ('' + H[c]).trim();
    if (h === '課題') col.title = c;
    else if (h === 'カテゴリ') col.cat = c;
    else if (h === '象限') col.quad = c;
    else if (h === 'メモ') col.memo = c;
    else if (h === '担当') col.owner = c;
    else if (h === '期限') col.due = c;
  }
  var out = [];
  for (var r2 = hr + 1; r2 < v.length; r2++) {
    var row = v[r2];
    var t = cell_(row[col.title]);
    if (!t) continue;
    out.push({
      title: t,
      cat: cell_(row[col.cat]),
      quad: cell_(row[col.quad]) || '計画する',
      memo: cell_(row[col.memo]),
      owner: cell_(row[col.owner]) || '-',
      due: cell_(row[col.due])
    });
  }
  return out;
}

/**
 * 課題ボードの保存（クライアントから google.script.run で呼ばれる）。
 * シートを書き換えて正本を更新する。実行＝デプロイ者なので自分のシートに書ける。
 */
function saveIssues(json) {
  var data = JSON.parse(json);
  var ss = SpreadsheetApp.openById(ISSUES_SHEET_ID);
  var sh = ss.getSheets()[0];
  var rows = [['課題', 'カテゴリ', '象限', 'メモ', '担当', '期限']];
  data.forEach(function (d) {
    rows.push([d.title || '', d.cat || '', d.quad || '', d.memo || '', d.owner || '', d.due || '']);
  });
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 6).setValues(rows);
  return true;
}
