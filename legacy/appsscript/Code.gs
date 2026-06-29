/**
 * ユニットMTGダッシュボード（組織限定ウェブアプリ）
 * 10期計画＆実績シートをサーバー側で読み、Page.html に渡して表示する。
 * データは社外に出ず、Googleログインで社内限定アクセスにできる。
 */
function doGet() {
  var SHEET_ID = '15ybH2lLFLpV0DqgeVWawsrArhKcL8jHdC_Yp7eQ5dhI';
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var live = { plan: gridFor_(ss, '10期計画'), act: gridFor_(ss, '10期実績') };
  var t = HtmlService.createTemplateFromFile('Page');
  t.liveJson = JSON.stringify(live);
  return t.evaluate()
    .setTitle('ユニットMTGダッシュボード')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** タブ名が prefix で始まるシートの、3行目以降 × H〜T列（2月〜通期）を取り出す */
function gridFor_(ss, prefix) {
  var sheets = ss.getSheets();
  var sh = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().indexOf(prefix) === 0) { sh = sheets[i]; break; }
  }
  if (!sh) throw new Error('シートが見つかりません: ' + prefix);
  var v = sh.getDataRange().getValues();
  var out = [];
  for (var r = 2; r < v.length; r++) {          // r=2 → シート3行目 → index 0
    var row = v[r], cells = [];
    for (var c = 7; c <= 19; c++) {              // H〜T列（2月〜通期）
      cells.push(row[c] === undefined || row[c] === null ? '' : row[c]);
    }
    out.push(cells);
  }
  return out;
}