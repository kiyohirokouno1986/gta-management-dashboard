// 「ルール・方針」タブ（静的・配賦ルール全文）。Page.html の rulesPanel を移植。

export function rulesPanel(): string {
  const card = (t: string, b: string): string =>
    `<div style="background:#fff;border:1px solid #E5E3DB;border-radius:10px;padding:12px 14px;margin-bottom:10px"><div style="font-size:13px;font-weight:700;color:#3C3489;margin-bottom:5px">${t}</div><div style="font-size:12.5px;color:#23262F;line-height:1.6">${b}</div></div>`;
  return `<div style="font-size:18px;font-weight:700;margin-bottom:4px">分配ルール・方針</div>
  <div style="font-size:12px;color:#888780;margin-bottom:14px">部門別 管理会計の配賦と評価の決めごと（6/30 MTGの叩き台ベース・随時更新）</div>
  ${card(
    "目的",
    "全社で黒字化（部門別で1円以上が最低目標）するために、部門ごとの数字を正しく見えるようにする。管理会計は「計器」。数字をいじって良く見せるためではなく、正しく映すのが目的。",
  )}
  ${card("① 配賦キー", "間接費は配賦人月で按分。配賦前の間接費プール総額と、配賦後の各部門負担の両方を見せる。")}
  ${card(
    "② アルバイトの配賦（最重要）",
    "アルバイトスタッフは何名でも「分配人数1」でカウント（人数連動をやめる）。CXは アルバイト分（何名でも1）＋ アルバイト以外の山内・降旗（2名）＝ 合計3人月（固定）。理由：アルバイト費用は直接経費（人件費）に計上済みで、頭数を数えると間接費まで二重に効くため。",
  )}
  ${card("③ 部門の括り", "注文・不動産仲介・コンサルCXは SaaS全体のグロスで見る。")}
  ${card(
    "④ 投資／収益の区分",
    "投資部門＝赤字許容（達成率・売上で評価）／収益部門＝黒字（部門利益）で評価。区分は四半期で見直す。",
  )}
  ${card("⑤ 評価の単位", "① 直接（貢献利益）で黒字か → ② 配賦後（部門利益）で黒字か の二段で見る。")}
  ${card(
    "目標の決め方",
    "売上＝10期計画（月次・通期）。利益＝計画売上×目標利益率（注文40%／コンサル45%／auka50%／CX25%／SaaS全体5%）。全社の営業利益＝10期計画のラインを使用。率は初期値で随時調整。",
  )}
  ${card("前提", "費用は詳細＋証憑を5日までに経理へ提出。これが全ての前提。")}`;
}
