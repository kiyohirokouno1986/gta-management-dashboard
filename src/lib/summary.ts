// 経営サマリー（全社一覧）の数値計算。既存の評価ロジック（targetSeries）を再利用し、
// 各タブの目標カードと一致する数値を出す。純関数＝テスト対象。

import type { Ctx } from "./types";
import { lastAct } from "./types";
import { UNITS, TARGETS, type Unit } from "../config/units";
import { salesPlan } from "./sheet";
import { rowVals } from "./sheet";
import { snapUnit } from "./snap";
import { targetSeries } from "./targets";

export type Judge = "pass" | "near" | "fail";

export interface SummaryRow {
  key: string;
  name: string;
  /** 区分（短縮: 全社 / 投資 / 収益 / 収益・投資）。 */
  tagShort: string;
  jin: number;
  /** 売上達成率（当月・%）。null は計画0。 */
  srMonth: number | null;
  /** 売上達成率（累計・%）。 */
  srCum: number | null;
  /** 主目標の指標ラベル（部門利益 / 貢献利益 / 営業利益 / 売上 達成率）。 */
  label: string;
  /** 主目標の当月 目標値・実績値。 */
  tgt: number;
  act: number;
  /** 達成率評価（売上系は%評価、利益系は閾値評価）。 */
  judge: Judge;
  /** 前月比（主目標の実績）。null は初月。 */
  mom: number | null;
}

export interface SummaryKpi {
  salesRateCum: number | null;
  salesYoYMonth: number | null;
  salesYoYCum: number | null;
  opCumMgmt: number;
  profitUnits: number;
  profitUnitsTotal: number;
  jinTotal: number;
}

function tagShort(u: Unit): string {
  if (u.tag.startsWith("全社")) return "全社";
  if (u.tag.startsWith("投資")) return "投資";
  if (u.tag.indexOf("一部") >= 0) return "収益・投資";
  return "収益";
}

function judgeOf(act: number, tgt: number, isRate: boolean): Judge {
  if (isRate) {
    const r = tgt > 0 ? (act / tgt) * 100 : null;
    if (r === null) return "fail";
    return r >= 100 ? "pass" : r >= 90 ? "near" : "fail";
  }
  if (act >= tgt) return "pass";
  return act >= tgt - Math.max(Math.abs(tgt) * 0.1, 200000) ? "near" : "fail";
}

export function buildSummaryRows(ctx: Ctx): SummaryRow[] {
  const i = ctx.LATEST;
  return UNITS.map((u) => {
    const sp = salesPlan(ctx.live, u);
    const sa = snapUnit(ctx.snap, u.key, "uri");
    const srMonth = sp[i] > 0 ? Math.round((sa[i] / sp[i]) * 100) : null;
    const spc = sp.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const sac = sa.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const srCum = spc > 0 ? Math.round((sac / spc) * 100) : null;
    const jin =
      u.key === "saas"
        ? snapUnit(ctx.snap, "saas", "jin")[i]
        : snapUnit(ctx.snap, u.key, "jin")[i];
    const s = targetSeries(ctx, u, TARGETS[u.key][0]);
    const act = s.act[i];
    const tgt = s.tgt12[i];
    return {
      key: u.key,
      name: u.name,
      tagShort: tagShort(u),
      jin,
      srMonth,
      srCum,
      label: s.label,
      tgt,
      act,
      judge: judgeOf(act, tgt, s.isRate),
      mom: i > 0 ? act - s.act[i - 1] : null,
    };
  });
}

export function buildSummaryKpi(ctx: Ctx): SummaryKpi {
  const i = ctx.LATEST;
  const n = lastAct(ctx);
  // 全社 売上 累計達成率
  const sp = salesPlan(ctx.live, UNITS[0]); // zen plan row6
  const sa = ctx.snap.zen.uri;
  const spc = sp.slice(0, i + 1).reduce((a, b) => a + b, 0);
  const sac = sa.slice(0, i + 1).reduce((a, b) => a + b, 0);
  const salesRateCum = spc > 0 ? Math.round((sac / spc) * 100) : null;
  // 前年同月比（10期実績シート: 当年=row6 / 前年=row5）
  const cur = rowVals(ctx.live.act, 6);
  const prev = rowVals(ctx.live.act, 5);
  const yoy = (c: number, p: number): number | null =>
    p > 0 ? Math.round((c / p - 1) * 100) : null;
  const curC = cur.slice(0, i + 1).reduce((a, b) => a + b, 0);
  const prevC = prev.slice(0, i + 1).reduce((a, b) => a + b, 0);
  // 営業利益(管理) 累計 = zen 部門利益合計
  const opCumMgmt = ctx.snap.zen.bu.slice(0, n + 1).reduce((a, b) => a + b, 0);
  // 黒字部門（部門利益>0、当月）
  const baseUnits = ["chumon", "fudosan", "cx", "auka", "consul"] as const;
  const profitUnits = baseUnits.filter((k) => ctx.snap[k].bu[i] > 0).length;
  return {
    salesRateCum,
    salesYoYMonth: yoy(cur[i], prev[i]),
    salesYoYCum: yoy(curC, prevC),
    opCumMgmt,
    profitUnits,
    profitUnitsTotal: baseUnits.length,
    jinTotal: ctx.snap.zen.jin[i],
  };
}
