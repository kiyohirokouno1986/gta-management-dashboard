// このユニットの扱い（分配ルール・方針）カード。Page.html の unitRuleCard を移植。

import type { Ctx } from "../lib/types";
import type { Unit } from "../config/units";
import { UNIT_RULES } from "../config/units";
import { snapUnit, sumUnits } from "../lib/snap";
import { tagColor } from "./helpers";

export function unitRuleCard(ctx: Ctx, u: Unit): string {
  const i = ctx.LATEST;
  const jin =
    u.key === "saas"
      ? sumUnits(ctx.snap, ["chumon", "fudosan", "cx"], "jin")[i]
      : snapUnit(ctx.snap, u.key, "jin")[i];
  const r = UNIT_RULES[u.key] || ({} as (typeof UNIT_RULES)[keyof typeof UNIT_RULES]);
  const tc = tagColor(u.tag);
  return `<div style="margin-top:14px;background:#FAFAF8;border:1px solid #ECEAE2;border-radius:10px;padding:12px 14px">
  <div style="font-size:12px;font-weight:600;color:#5F5E5A;margin-bottom:8px">このユニットの扱い（分配ルール・方針）</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:${r.note ? "8px" : "0"}">
   <span style="font-size:11px;background:${tc[0]};color:${tc[1]};border-radius:6px;padding:3px 9px;font-weight:600">区分：${u.tag}</span>
   <span style="font-size:11px;background:#EEEDFE;color:#3C3489;border-radius:6px;padding:3px 9px;font-weight:600">配賦人月：${jin}</span>
   ${
     r.rate
       ? `<span style="font-size:11px;background:#EEEDFE;color:#3C3489;border-radius:6px;padding:3px 9px;font-weight:600">目標利益率：${r.rate}</span>`
       : ""
   }
   <span style="font-size:11px;background:#EAF6F0;color:#0F6E56;border-radius:6px;padding:3px 9px;font-weight:600">評価：${r.ev || "—"}</span>
  </div>
  ${r.note ? `<div style="font-size:12px;color:#5F5E5A;line-height:1.5">${r.note}</div>` : ""}
 </div>`;
}
