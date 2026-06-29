// データ読み込みの境界（seam）。
//
// 優先順位:
//   1. Apps Script が注入する window.__LIVE__ / __SNAP__ / __MONTHS__（ライブ＝シート最新）
//   2. 無ければ埋め込みスナップショット（src/data/*.json）にフォールバック
//      （手元の単一HTML・静的ビルド・ローカル開発はこちらで動く）
//
// これにより、月次更新は「部門別PLシートを書き換える」だけで反映され、
// 再ビルド・再デプロイは不要になる。
import type { Ctx, Live, Snap } from "./types";
import { ML12 } from "../config/units";
import liveJson from "../data/live.json";
import snapJson from "../data/snap.json";

declare global {
  interface Window {
    __LIVE__?: Live;
    __SNAP__?: Snap;
    __MONTHS__?: string[];
  }
}

const bundledLive = liveJson as Live;
const bundledSnap = snapJson as unknown as Snap;

export interface LoadedData {
  live: Live;
  snap: Snap;
  months: string[];
}

/** スナップショット月数から既定の月ラベルを作る（2月始まり、最大12ヶ月）。 */
function defaultMonths(snap: Snap): string[] {
  const n = snap.zen.uri.length;
  return ML12.slice(0, n);
}

export async function loadData(): Promise<LoadedData> {
  const injectedLive =
    typeof window !== "undefined" ? window.__LIVE__ : undefined;
  const injectedSnap =
    typeof window !== "undefined" ? window.__SNAP__ : undefined;
  const injectedMonths =
    typeof window !== "undefined" ? window.__MONTHS__ : undefined;

  const live = injectedLive ?? bundledLive;
  const snap = injectedSnap ?? bundledSnap;
  const months =
    injectedMonths && injectedMonths.length ? injectedMonths : defaultMonths(snap);
  return { live, snap, months };
}

// テスト・既定描画用に埋め込みデータも公開
export const live = bundledLive;
export const snap = bundledSnap;

/** 描画コンテキストを組み立てる。LATEST は最新実績月（スナップショット末尾）に追従。 */
export function makeCtx(data: {
  live: Live;
  snap: Snap;
  months?: string[];
}): Ctx {
  const months =
    data.months && data.months.length ? data.months : defaultMonths(data.snap);
  return {
    live: data.live,
    snap: data.snap,
    LATEST: data.snap.zen.uri.length - 1,
    MODE: "month",
    months,
  };
}
