// 部門別PLスナップショット（SNAP）からの取り出し。Page.html の snapUnit/sumUnits を移植。

import type { MetricKey, UnitKey } from "../config/units";
import type { Snap } from "./types";

/** 複数の基底部門を月ごとに合算（4ヶ月）。 */
export function sumUnits(
  snap: Snap,
  keys: (keyof Snap)[],
  m: MetricKey,
): number[] {
  const n = keys.length ? snap[keys[0]][m].length : 0;
  return Array.from({ length: n }, (_, i) =>
    keys.reduce((s, k) => s + snap[k][m][i], 0),
  );
}

/**
 * ユニットの月次配列（4ヶ月）。
 * zen=合計, saas=chumon+fudosan+cx の合算, それ以外はそのまま。
 */
export function snapUnit(snap: Snap, key: UnitKey, m: MetricKey): number[] {
  if (key === "zen") return snap.zen[m];
  if (key === "saas") return sumUnits(snap, ["chumon", "fudosan", "cx"], m);
  return snap[key as keyof Snap][m];
}
