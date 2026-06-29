// ユニットパネル全体の組み立て。Page.html の unitPanel を移植。

import type { Ctx } from "../lib/types";
import { UNITS } from "../config/units";
import { snapUnit, sumUnits } from "../lib/snap";
import { tagColor } from "./helpers";
import { unitRuleCard } from "./unitRuleCard";
import { goalRow } from "./goalRow";
import { adviceCard } from "./advice";
import { buildMatrix } from "./matrix";
import { plBox } from "./plbox";

export function unitPanel(ctx: Ctx, idx: number): string {
  const u = UNITS[idx],
    i = ctx.LATEST;
  const tc = tagColor(u.tag);
  const jin =
    u.key === "saas"
      ? sumUnits(ctx.snap, ["chumon", "fudosan", "cx"], "jin")[i]
      : snapUnit(ctx.snap, u.key, "jin")[i];
  const head = `<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding-bottom:14px;border-bottom:2px solid #F0EEE7">
   <span style="font-size:24px;font-weight:700">${u.name}</span>
   <span style="font-size:14px;background:${tc[0]};color:${tc[1]};border-radius:8px;padding:5px 14px;font-weight:700">${u.tag}</span>
   <span style="font-size:14px;background:#EEEDFE;color:#3C3489;border-radius:8px;padding:5px 14px;font-weight:600">配賦人月 <b style="font-size:18px">${jin}</b> 人</span></div>`;
  const detail = `<div style="margin-top:16px"><div style="font-size:13px;font-weight:600;color:#3C3489;margin-bottom:6px">部門別PLの利益段 ＋ 今月の利益構造（MQ）</div>${plBox(
    ctx,
    u,
  )}</div>`;
  return (
    head +
    unitRuleCard(ctx, u) +
    `<div style="padding-top:4px">${goalRow(ctx, u)}</div>` +
    adviceCard(ctx, u) +
    `<div style="margin-top:16px"><div style="font-size:13px;font-weight:600;color:#3C3489;margin-bottom:4px">目標 × 月マトリクス（過去・この先の目標を一望）</div>${buildMatrix(
      ctx,
      u,
    )}</div>` +
    detail
  );
}
