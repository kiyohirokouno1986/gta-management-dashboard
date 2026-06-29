// タブ → パネル本体HTMLの分岐。Page.html の render() のディスパッチ部分を移植。

import type { Ctx } from "../lib/types";
import type { TabKey } from "../components/Tabs";
import { unitPanel } from "./unitPanel";
import { progressPanel } from "./progress";
import { visionPanel } from "./vision";
import { rulesPanel } from "./rules";
import { summaryPanel } from "./summary";

export function renderPanel(ctx: Ctx, cur: TabKey): string {
  if (cur === "summary") return summaryPanel(ctx);
  if (cur === "issues") return ""; // 課題ボードは App 側で React コンポーネントとして描画
  if (cur === "rules") return rulesPanel();
  if (cur === "vision") return visionPanel();
  if (cur === "progress") return progressPanel(ctx);
  return unitPanel(ctx, cur);
}

export const FOOTER_NOTE =
  "売上＝10期計画＆実績シート（クラウド・自動更新）。利益段（売上総利益・直接コスト①②・直接コスト計・貢献利益・間接コスト・部門利益）と配賦人月＝部門別PL（管理会計）2〜5月スナップショット。新しい部門別PLを入れた時点で更新。計画列は売上高のみ。間接費プールは各部門へ配賦している間接費の総額（固定費モニタ）。";
