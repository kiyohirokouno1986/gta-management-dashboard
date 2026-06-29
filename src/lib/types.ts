import type { MetricKey, UnitKey } from "../config/units";

/** A sheet cell is a number or (occasionally) a raw string like "ー". */
export type Cell = number | string;

/** One grid row = [2月..1月, 通期] (13 entries), matching gridFor_ in Code.gs. */
export type GridRow = Cell[];

/** plan/act = sheet rows from row 3, columns H..T. Index i === sheet row (i+3). */
export interface Live {
  plan: GridRow[];
  act: GridRow[];
}

/** Per-unit profit-tier snapshot: each metric is an array over MONTHS (4 entries). */
export type SnapUnit = Record<MetricKey, number[]>;

/** Department PL snapshot keyed by the 6 base units stored in the Excel export. */
export type Snap = Record<
  "consul" | "auka" | "chumon" | "fudosan" | "cx" | "zen",
  SnapUnit
>;

export type Mode = "month" | "cum";

/**
 * Render context — replaces the canonical global state
 * (LIVE / SNAP / LATEST / MODE) with an explicit, testable object.
 */
export interface Ctx {
  live: Live;
  snap: Snap;
  /** 表示する最新実績月のインデックス（0=2月 … 3=5月）。 */
  LATEST: number;
  MODE: Mode;
}

/** 最新の実績がある月のインデックス（= snapshot 月数 - 1）。 */
export function lastAct(ctx: Ctx): number {
  return ctx.snap.zen.uri.length - 1;
}

export type { UnitKey };
