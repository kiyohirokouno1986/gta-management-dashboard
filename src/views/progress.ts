// 進捗タブ（全社の計画 対 実績：月次＋累計のSVGチャート）。Page.html の progressPanel を移植。

import type { Ctx } from "../lib/types";
import { rowVals12 } from "../lib/sheet";
import { mm } from "../lib/format";
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
  const sec = (title: string, callout: string, m: string, c: string): string =>
    `<div style="background:#fff;border:1px solid #E5E3DB;border-radius:12px;padding:14px;margin-bottom:14px">
   <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;margin-bottom:6px"><span style="font-size:14px;font-weight:700">${title}</span><span style="font-size:12px;color:#888780">${callout}</span></div>
   <div style="font-size:11px;color:#888780;margin-bottom:2px">月次（計画 対 実績・万円）</div>${m}
   <div style="font-size:11px;color:#888780;margin:10px 0 2px">累計の進捗（万円・実績は2〜${ctx.months[i]}、計画線の右端＝通期目標）</div>${c}</div>`;
  const uc = `累計 実績 ${mm(uriAC[i])}万 ／ 計画 ${mm(uriPC[i])}万　達成率 ${uriRate}%`;
  const oc = `累計 実績 ${mm(opAC[i])}万 ／ 計画 ${mm(opPC[i])}万`;
  return `<div style="font-size:18px;font-weight:700;margin-bottom:2px">進捗（計画 対 実績）</div>
  <div style="font-size:12px;color:#888780;margin-bottom:12px">全社・単位 万円　<span style="color:#CECBF6;font-weight:700">━</span> 計画　<span style="color:#534AB7;font-weight:700">━</span> 実績</div>
  ${sec("売上", uc, svgChart(uriP, uriA, false), svgChart(uriPC, uriAC, false))}
  ${sec("営業利益", oc, svgChart(opP, opA, true), svgChart(opPC, opAC, true))}
  <div style="font-size:11px;color:#888780">0ライン超えが黒字。営業利益は計画で5月以降プラスに転じ、通期で +2,579万（黒字化）を目指す。</div>`;
}
