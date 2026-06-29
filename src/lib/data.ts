// データ読み込みの境界（seam）。
//
// 現状は埋め込みスナップショット（src/data/*.json）を返す。
//  - live.json … 10期計画＆実績シートの plan/act グリッド（gridFor_ と同形）
//  - snap.json … 部門別PL（管理会計）の利益段スナップショット
//
// 「進化」フェーズではこの loadData() を差し替えるだけで、
// 10期シートのライブ取得（Apps Script Web App / Sheets API 等）や
// 部門別PLの自動取込に移行できる。
import type { Ctx, Live, Snap } from "./types";
import liveJson from "../data/live.json";
import snapJson from "../data/snap.json";

export const live = liveJson as Live;
export const snap = snapJson as unknown as Snap;

export async function loadData(): Promise<{ live: Live; snap: Snap }> {
  return { live, snap };
}

/** 既定の描画コンテキスト。LATEST は最新実績月（スナップショット末尾）に追従。 */
export function makeCtx(data: { live: Live; snap: Snap }): Ctx {
  return {
    live: data.live,
    snap: data.snap,
    LATEST: data.snap.zen.uri.length - 1,
    MODE: "month",
  };
}
