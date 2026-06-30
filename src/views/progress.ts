// 進捗タブ（全社の計画 対 実績：月次＋累計のSVGチャート）。Page.html の progressPanel を移植。

import type { Ctx } from "../lib/types";
import { rowVals12 } from "../lib/sheet";
import { mm } from "../lib/format";
import { makeForecast, type Forecast } from "../lib/forecast";
import { svgChart } from "./chart";

export function progressPanel(ctx: Ctx): string {
  const i = ctx.LATEST;
  const uriP = rowVals12(ctx.live.plan, 6),
    uriA = ctx.snap.zen.uri.slice(0, i + 1);
  const opP = rowVals12(ctx.live.plan, 4),
    opA = ctx.snap.zen.bu.slice(0, i + 1);
  const cum = (a: number[]): number[] => {
    const o: number[] = [];
    let x = 0;
    a.forEach((v) => {
      x += v;
      o.push(x);
    });
    return o;
  };
  const uriAC = cum(uriA),
    uriPC = cum(uriP),
    opAC = cum(opA),
    opPC = cum(opP);
  const uriRate = uriPC[i] > 0 ? Math.round((uriAC[i] / uriPC[i]) * 100) : null;

  // 通期着地見込み（現ペース）。月次は累計÷経過月×12。
  const uriFc = makeForecast(uriPC[11], uriA, i + 1);
  const opFc = makeForecast(opPC[11], opA, i + 1);
  const runMonthly = (acCum: number): number => acCum / (i + 1);
  // 月次の投影線：iまで非描画→iは実績→i+1以降は月次ランレートで横ばい。
  const projMonth = (acCumLast: number, actLast: number): number[] => {
    const r = runMonthly(acCumLast);
    return Array.from({ length: 12 }, (_, j) =>
      j < i ? NaN : j === i ? actLast : r,
    );
  };
  // 累計の投影線：iまで非描画→iは実績累計→i+1以降はランレートで加算。
  const projCum = (acCumLast: number): number[] => {
    const r = runMonthly(acCumLast);
    return Array.from({ length: 12 }, (_, j) =>
      j < i ? NaN : acCumLast + r * (j - i),
    );
  };
  const uriM2 = projMonth(uriAC[i], uriA[i]),
    uriC2 = projCum(uriAC[i]);
  const opM2 = projMonth(opAC[i], opA[i]),
    opC2 = projCum(opAC[i]);
  const sec = (title: string, callout: string, m: string, c: string): string =>
    `<div style="background:#fff;border:1px solid #E5E3DB;border-radius:12px;padding:14px;margin-bottom:14px">
   <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;margin-bottom:6px"><span style="font-size:14px;font-weight:700">${title}</span><span style="font-size:12px;color:#888780">${callout}</span></div>
   <div style="font-size:11px;color:#888780;margin-bottom:2px">月次（計画 対 実績・万円）</div>${m}
   <div style="font-size:11px;color:#888780;margin:10px 0 2px">累計の進捗（万円・実績は2〜${ctx.months[i]}、計画線の右端＝通期目標）</div>${c}</div>`;
  const uc = `累計 実績 ${mm(uriAC[i])}万 ／ 計画 ${mm(uriPC[i])}万　達成率 ${uriRate}%`;
  const oc = `累計 実績 ${mm(opAC[i])}万 ／ 計画 ${mm(opPC[i])}万`;
  return `<div style="font-size:18px;font-weight:700;margin-bottom:2px">進捗（計画 対 実績）</div>
  <div style="font-size:12px;color:#888780;margin-bottom:12px">全社・単位 万円　<span style="color:#CECBF6;font-weight:700">━</span> 計画　<span style="color:#534AB7;font-weight:700">━</span> 実績　<span style="color:#D85A30;font-weight:700">┅</span> 通期見込み（現ペース）</div>
  ${fcCards(uriFc, opFc)}
  ${sec("売上", uc, svgChart(uriP, uriA, false, uriM2), svgChart(uriPC, uriAC, false, uriC2))}
  ${sec("営業利益", oc, svgChart(opP, opA, true, opM2), svgChart(opPC, opAC, true, opC2))}
  <div style="font-size:11px;color:#888780">0ライン超えが黒字。営業利益は計画で5月以降プラスに転じ、通期で +2,579万（黒字化）を目指す。<br>※ オレンジ破線＝現ペース（累計÷経過月）で通年を走った場合の着地見込み。</div>`;
}

// 全社の通期見込みカード（売上／営業利益）。
function fcCards(uriFc: Forecast, opFc: Forecast): string {
  const card = (lab: string, fc: Forecast, planLab: string): string => {
    const col = fc.ok ? "#0F6E56" : "#993C1D";
    const gap =
      fc.gap >= 0
        ? `<span style="color:#0F6E56">計画 +${mm(fc.gap)}万</span>`
        : `<span style="color:#993C1D">計画 ▲${mm(Math.abs(fc.gap))}万</span>`;
    const rate = fc.rate !== null ? `　見込み達成率 ${fc.rate}%` : "";
    return `<div style="flex:1;min-width:240px;background:#FBFAFF;border:1.5px solid #E3DEF7;border-radius:12px;padding:14px">
     <div style="font-size:12px;color:#6B5FAE;font-weight:600">${lab}　通期見込み（現ペース）</div>
     <div style="font-size:26px;font-weight:700;margin-top:4px;color:${col}">${mm(fc.run)}万</div>
     <div style="font-size:12px;margin-top:2px;color:#888780">${gap}${rate}<br>通期計画 ${planLab}</div></div>`;
  };
  return `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
   ${card("売上", uriFc, mm(uriFc.annual) + "万")}
   ${card("営業利益", opFc, (opFc.annual < 0 ? "▲" + mm(Math.abs(opFc.annual)) : mm(opFc.annual)) + "万")}
  </div>`;
}
