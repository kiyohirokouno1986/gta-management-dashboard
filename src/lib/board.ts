// 「AIで課題を提案」のロジック。数値から課題候補をルールベースで自動抽出する（決定的・実行時LLM不要）。
import type { Ctx, Issue } from "./types";
import { lastAct } from "./types";
import { buildSummaryRows, buildSummaryKpi } from "./summary";

/** メモ用に円→万円表記。 */
const man = (v: number): string =>
  (v < 0 ? "▲" : "") + Math.abs(Math.round(v / 10000)).toLocaleString("en-US");

/**
 * 現状の数値から課題候補を生成。
 * - 全社の営業利益(管理)累計が赤字 → 通期黒字化（すぐやる）
 * - 投資部門で売上が計画割れ → 投資回収の筋道（計画する）
 * - 収益部門で主目標が未達 → 未達対策（すぐやる/計画する）
 * - 固定費(間接費プール)が当月、平均比+20%超 → 固定費精査（任せる）
 */
export function deriveCandidates(ctx: Ctx): Issue[] {
  const i = ctx.LATEST;
  const out: Issue[] = [];
  const kpi = buildSummaryKpi(ctx);
  if (kpi.opCumMgmt < 0) {
    out.push({
      title: "通期黒字化の確度向上",
      cat: "財務・経営管理",
      quad: "すぐやる",
      memo: `営業利益(管理)累計 ▲${man(Math.abs(kpi.opCumMgmt))}万。下期の挽回策を確定し月次でGAP追跡。`,
      owner: "河野",
      due: "継続",
    });
  }
  for (const r of buildSummaryRows(ctx)) {
    if (r.key === "zen" || r.key === "saas") continue;
    if (r.tagShort === "投資" && (r.srMonth ?? 100) < 100) {
      out.push({
        title: `${r.name} 投資回収の筋道(KPI)`,
        cat: "戦略・事業PF",
        quad: "計画する",
        memo: `当月売上 計画比 ${r.srMonth ?? 0}%。KPI(査定・契約数)で進捗管理し回収/撤退ラインを定義。`,
        owner: "-",
        due: "Q2",
      });
    } else if (r.tagShort !== "投資" && r.judge === "fail") {
      out.push({
        title: `${r.name} ${r.label.replace(" 達成率", "")}の未達対策`,
        cat: "営業・商談",
        quad: "計画する",
        memo: `当月 ${man(r.act)}万（目標 ${man(r.tgt)}万）。計画ペースへの引き上げ策を検討。`,
        owner: "-",
        due: "Q2",
      });
    }
  }
  // 固定費（間接費プール）の急増検知
  const ind = ctx.snap.zen.ind.slice(0, lastAct(ctx) + 1);
  if (ind.length) {
    const avg = ind.reduce((a, b) => a + b, 0) / ind.length;
    if (avg > 0 && ind[i] > avg * 1.2) {
      out.push({
        title: "固定費(間接費)の増加要因精査",
        cat: "財務・経営管理",
        quad: "任せる",
        memo: `当月の間接費プール ${man(ind[i])}万が平均比+20%超。費目別に増減要因を分解。`,
        owner: "桑原",
        due: "月内",
      });
    }
  }
  return out;
}

/** 既存課題（タイトル一致）を除いた新規候補のみ返す。 */
export function newCandidates(ctx: Ctx, existing: Issue[]): Issue[] {
  const seen = new Set(existing.map((e) => e.title));
  return deriveCandidates(ctx).filter((c) => !seen.has(c.title));
}
