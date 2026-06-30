// 課題ボードの象限・カテゴリ定義。
import type { Quadrant } from "../lib/types";

export interface QuadDef {
  /** データ保存値（シート/JSONの「象限」）。 */
  key: Quadrant;
  /** 画面表示ラベル（保存値とは別。誤解を避ける表現に）。 */
  label: string;
  sub: string;
  color: string;
}

/**
 * 4象限（Doneは別レーン）。
 * 「なくす」は誤解を招くため表示は「保留・現状維持」に（保存値=key は互換のため "なくす" のまま）。
 */
export const QUADS: QuadDef[] = [
  { key: "すぐやる", label: "すぐやる", sub: "重要 × 緊急", color: "#C0492B" },
  { key: "計画する", label: "計画する", sub: "重要 × 緊急でない（主戦場）", color: "#534AB7" },
  { key: "任せる", label: "任せる", sub: "重要でない × 緊急", color: "#185FA5" },
  { key: "なくす", label: "保留・現状維持", sub: "重要でない × 緊急でない", color: "#9A7B2E" },
];

/** 象限キー → 表示ラベル。 */
export const QUAD_LABEL: Record<string, string> = Object.fromEntries(
  QUADS.map((q) => [q.key, q.label]),
);

/** カテゴリ → [背景色, 文字色]。 */
export const CATS: Record<string, [string, string]> = {
  "財務・経営管理": ["#FBEAE3", "#993C1D"],
  "戦略・事業PF": ["#EEEDFE", "#3C3489"],
  "営業・商談": ["#E1F5EE", "#0F6E56"],
  "AI・プロダクト": ["#E6F1FB", "#185FA5"],
};

export const CAT_LIST = Object.keys(CATS);
