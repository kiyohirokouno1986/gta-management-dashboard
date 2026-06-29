// 目標シリーズの共通化。Page.html の targetSeries / agg を移植（評価ロジックの核）。

import type { Ctx } from "./types";
import { lastAct } from "./types";
import type { Target, Unit } from "../config/units";
import { rowVals12, salesPlan12 } from "./sheet";
import { snapUnit } from "./snap";
import { yen } from "./format";

export interface TargetSeries {
  /** 12ヶ月の目標ライン。 */
  tgt12: number[];
  /** 実績（4ヶ月）。 */
  act: number[];
  /** true なら達成率（%）評価、false なら金額の閾値評価。 */
  isRate: boolean;
  label: string;
  sub: string;
}

export function targetSeries(ctx: Ctx, u: Unit, t: Target): TargetSeries {
  const { live, snap } = ctx;
  if (t.kind === "plan_sales")
    return {
      tgt12: salesPlan12(live, u),
      act: snapUnit(snap, u.key, "uri"),
      isRate: true,
      label: "売上 達成率",
      sub: "計画対比%",
    };
  if (t.kind === "monthly")
    return {
      tgt12: t.arr.map(Number),
      act: snapUnit(snap, u.key, t.m),
      isRate: false,
      label: t.m === "kou" ? "貢献利益" : "部門利益",
      sub: "月次目標",
    };
  if (t.kind === "plan_margin")
    return {
      tgt12: salesPlan12(live, u).map((v) => Math.round(v * t.rate)),
      act: snapUnit(snap, u.key, t.m),
      isRate: false,
      label: t.m === "bu" ? "部門利益" : "貢献利益",
      sub: "計画ペース",
    };
  if (t.kind === "op_line")
    return {
      tgt12: rowVals12(live.plan, 4),
      act: snapUnit(snap, u.key, "bu"),
      isRate: false,
      label: "営業利益",
      sub: "事業計画",
    };
  // flat
  return {
    tgt12: new Array(12).fill(t.th),
    act: snapUnit(snap, u.key, t.m),
    isRate: false,
    label: t.m === "bu" ? "部門利益" : "貢献利益",
    sub: "目標" + yen(t.th),
  };
}

/** MODE に応じた集計値：cum=累計（2月〜最新月）、month=当月（LATEST）。 */
export function agg(ctx: Ctx, arr: number[]): number {
  if (ctx.MODE === "cum") {
    const n = lastAct(ctx);
    let x = 0;
    for (let k = 0; k <= n; k++) x += arr[k] || 0;
    return x;
  }
  return arr[ctx.LATEST];
}
