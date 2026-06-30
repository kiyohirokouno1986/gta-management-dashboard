// 目標カード（当月＋累計の達成）。Page.html の goalRow を移植。

import type { Ctx } from "../lib/types";
import type { Unit } from "../config/units";
import { TARGETS } from "../config/units";
import { targetSeries } from "../lib/targets";
import { yen } from "../lib/format";

export function goalRow(ctx: Ctx, u: Unit): string {
  const list = TARGETS[u.key],
    i = ctx.LATEST;
  let html = "";
  list.forEach((t, n) => {
    const s = targetSeries(ctx, u, t);
    const ai = s.act[i],
      ti = s.tgt12[i];
    const mRate = s.isRate ? (ti > 0 ? Math.round((ai / ti) * 100) : null) : null;
    const mPass = s.isRate ? mRate !== null && mRate >= 100 : ai >= ti;
    const mNear =
      (s.isRate
        ? mRate !== null && mRate >= 90
        : ai >= ti - Math.max(Math.abs(ti) * 0.1, 200000)) && !mPass;
    const mCol = mPass ? "#0F6E56" : mNear ? "#9A7B12" : "#993C1D";
    const mMk = mPass ? "◯ 達成" : mNear ? "△ あと少し" : "✗ 未達";
    const sumAct = s.act.slice(0, i + 1).reduce((a, b) => a + b, 0),
      sumTgt = s.tgt12.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const cRate = sumTgt > 0 ? Math.round((sumAct / sumTgt) * 100) : null;
    const cPass = cRate !== null ? cRate >= 100 : sumAct >= sumTgt;
    const cNear = cRate !== null && cRate >= 90 && !cPass;
    const cCol = cPass ? "#0F6E56" : cNear ? "#9A7B12" : "#993C1D";
    const cTxt = cRate !== null ? cRate + "%" : cPass ? "◯" : "✗";
    const num = list.length > 1 ? ["①", "②", "③"][n] : "";
    html += `<div style="padding:12px 0;border-bottom:1px solid #F0EEE7">
   <div style="font-size:18px;font-weight:700"><span style="font-size:11px;background:#534AB7;color:#fff;border-radius:5px;padding:2px 8px;margin-right:6px">目標${num}</span>${t.label}！</div>
   <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px">
    <div style="flex:1;min-width:220px;background:#FAFAF7;border:1px solid #EFEDE6;border-radius:10px;padding:11px">
     <div style="font-size:11px;color:#888780;margin-bottom:2px">当月（${ctx.months[i]}）</div>
     <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap"><span style="font-size:23px;font-weight:700;color:${mCol}">${yen(
       ai,
     )}</span>${
       s.isRate && mRate !== null
         ? `<span style="font-size:15px;font-weight:700;color:${mCol}">${mRate}%</span>`
         : ""
     }<span style="font-size:14px;font-weight:700;color:${mCol}">${mMk}</span></div>
     <div style="font-size:12px;color:#888780;margin-top:2px">目標 ${yen(
       ti,
     )}</div></div>
    <div style="flex:1;min-width:220px;background:#EEEDFE;border:1.5px solid #CECBF6;border-radius:10px;padding:11px">
     <div style="font-size:11px;color:#3C3489;font-weight:600;margin-bottom:2px">累計（2〜${ctx.months[i]} YTD）</div>
     <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap"><span style="font-size:23px;font-weight:700">${yen(
       sumAct,
     )}</span><span style="font-size:17px;font-weight:700;color:${cCol}">${cTxt}</span></div>
     <div style="font-size:12px;color:#888780;margin-top:2px">累計目標 ${yen(
       sumTgt,
     )}</div></div>
   </div></div>`;
  });
  return html;
}
