// 10期シート（LIVE）からの値取り出し。Page.html の rowVals/rowExpr 群を忠実に移植。
// 値は千円の生値 → ×1000 で円に変換する。

import type { Cell, GridRow, Live } from "./types";
import type { RowExpr, Unit } from "../config/units";

/** 文字列/数値を数値化（カンマ・%・全角%・バックスラッシュを除去、'ー'/'-'/'' は 0）。 */
export function num(s: Cell | null | undefined): number {
  if (s == null) return 0;
  let t = ("" + s)
    .replace(/\\/g, "")
    .replace(/,/g, "")
    .replace(/[％%]/g, "")
    .trim();
  if (t === "" || t === "ー" || t === "-") return 0;
  const v = parseFloat(t);
  return isNaN(v) ? 0 : v;
}

export function add(a: number[], b: number[]): number[] {
  return a.map((x, i) => x + b[i]);
}

/** シート R 行目（b[R-3]）の月次4ヶ月（2〜5月）を円で返す。 */
export function rowVals(b: GridRow[], R: number): number[] {
  const r: GridRow = b[R - 3] || [];
  const o: number[] = [];
  for (let c = 0; c < 4; c++) o.push(num(r[c]) * 1000);
  return o;
}

/** 同 12ヶ月（2月〜1月）。 */
export function rowVals12(b: GridRow[], R: number): number[] {
  const r: GridRow = b[R - 3] || [];
  const o: number[] = [];
  for (let c = 0; c < 12; c++) o.push(num(r[c]) * 1000);
  return o;
}

/** 行式（数値 or "a+b"）の4ヶ月値。 */
export function rowExpr(b: GridRow[], e: RowExpr): number[] {
  if (("" + e).indexOf("+") >= 0) {
    const [a, c] = ("" + e).split("+").map(Number);
    return add(rowVals(b, a), rowVals(b, c));
  }
  return rowVals(b, Number(e));
}

/** 行式の12ヶ月値。 */
export function rowExpr12(b: GridRow[], e: RowExpr): number[] {
  if (("" + e).indexOf("+") >= 0) {
    const p = ("" + e).split("+").map(Number);
    return add(rowVals12(b, p[0]), rowVals12(b, p[1]));
  }
  return rowVals12(b, Number(e));
}

/** ユニットの売上計画（4ヶ月）。plan が "12+25" の場合は合算。 */
export function salesPlan(live: Live, u: Unit): number[] {
  if (u.plan === "12+25")
    return add(rowVals(live.plan, 12), rowVals(live.plan, 25));
  return rowVals(live.plan, Number(u.plan));
}

/** ユニットの売上計画（12ヶ月）。 */
export function salesPlan12(live: Live, u: Unit): number[] {
  if (u.plan === "12+25")
    return add(rowVals12(live.plan, 12), rowVals12(live.plan, 25));
  return rowVals12(live.plan, Number(u.plan));
}
