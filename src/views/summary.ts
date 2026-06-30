// 経営サマリー（全社一覧ヒートマップ＋KPIカード）。Page から独立した経営者向けトップ画面。

import type { Ctx } from "../lib/types";
import { lastAct } from "../lib/types";
import { buildSummaryRows, buildSummaryKpi, type Judge } from "../lib/summary";

const man = (v: number): string =>
  (v < 0 ? "▲" : "") + Math.abs(Math.round(v / 10000)).toLocaleString("en-US");

const judgeMark: Record<Judge, string> = { pass: "◯", near: "△", fail: "✗" };
const judgeCell: Record<Judge, [string, string]> = {
  pass: ["#E1F5EE", "#0F6E56"],
  near: ["#FBF3EF", "#9A7B12"],
  fail: ["#FAECE7", "#993C1D"],
};
const tagColor: Record<string, [string, string]> = {
  全社: ["#F1EFE8", "#5F5E5A"],
  投資: ["#E6F1FB", "#185FA5"],
  収益: ["#E1F5EE", "#0F6E56"],
  "収益・投資": ["#EEEDFE", "#3C3489"],
};

function rateBg(r: number | null): string {
  if (r === null) return "";
  return r >= 100 ? "background:#EAF7F1" : r >= 90 ? "background:#FCF6EE" : "background:#FBEEE9";
}

function momHtml(v: number | null): string {
  if (v === null) return "—";
  if (v > 0) return `<span style="color:#0F6E56">▲ +${man(v)}</span>`;
  if (v < 0) return `<span style="color:#993C1D">▼ ${man(Math.abs(v))}</span>`;
  return "±0";
}

function kpiCard(lab: string, big: string, bigColor: string, sub: string): string {
  return `<div style="flex:1;min-width:190px;background:#fff;border:1px solid #E5E3DB;border-radius:12px;padding:14px">
   <div style="font-size:12px;color:#888780">${lab}</div>
   <div style="font-size:26px;font-weight:700;margin-top:4px;color:${bigColor}">${big}</div>
   <div style="font-size:12px;margin-top:2px;color:#888780">${sub}</div></div>`;
}

export function summaryPanel(ctx: Ctx): string {
  const rows = buildSummaryRows(ctx);
  const kpi = buildSummaryKpi(ctx);
  const i = ctx.LATEST;
  const monthLabel = ctx.months[i] || "";
  const cumLabel = `2〜${ctx.months[lastAct(ctx)] || ""}`;

  const yoyM =
    kpi.salesYoYCum === null
      ? ""
      : `前年同月比 累計 ${kpi.salesYoYCum >= 0 ? "+" : ""}${kpi.salesYoYCum}%`;
  const kpis = `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
   ${kpiCard(
     "全社 売上 累計達成率",
     kpi.salesRateCum !== null ? kpi.salesRateCum + "%" : "—",
     kpi.salesRateCum !== null && kpi.salesRateCum >= 100 ? "#0F6E56" : "#2C2C2A",
     `<span style="color:${(kpi.salesYoYCum ?? 0) >= 0 ? "#0F6E56" : "#993C1D"}">${yoyM}</span>`,
   )}
   ${kpiCard(
     "全社 営業利益(管理) 累計",
     kpi.opCumMgmt < 0 ? "▲" + man(Math.abs(kpi.opCumMgmt)) + "万" : man(kpi.opCumMgmt) + "万",
     kpi.opCumMgmt < 0 ? "#993C1D" : "#0F6E56",
     `${cumLabel} YTD`,
   )}
   ${kpiCard(
     "黒字部門（部門利益＞0）",
     `${kpi.profitUnits} / ${kpi.profitUnitsTotal}`,
     "#2C2C2A",
     "部門利益が当月プラスの数",
   )}
   ${kpiCard("配賦人月 合計", kpi.jinTotal.toLocaleString("en-US"), "#2C2C2A", `人月（${monthLabel}）`)}
  </div>`;

  const body = rows
    .map((r) => {
      const tc = tagColor[r.tagShort] || ["#F1EFE8", "#5F5E5A"];
      const jc = judgeCell[r.judge];
      return `<tr>
     <td style="text-align:left;padding:9px 10px;font-weight:600;border-bottom:1px solid #F0EEE7">${r.name}</td>
     <td style="text-align:left;padding:9px 10px;border-bottom:1px solid #F0EEE7"><span style="font-size:11px;border-radius:20px;padding:2px 9px;font-weight:600;background:${tc[0]};color:${tc[1]}">${r.tagShort}</span></td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7">${r.jin}</td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7;${rateBg(r.srMonth)}">${r.srMonth !== null ? r.srMonth + "%" : "—"}</td>
     <td style="text-align:left;padding:9px 10px;border-bottom:1px solid #F0EEE7">${r.label.replace(" 達成率", "")}</td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7">${man(r.tgt)}</td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7;font-weight:700">${man(r.act)}</td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7;text-align:center;background:${jc[0]};color:${jc[1]};font-weight:700">${judgeMark[r.judge]}</td>
     <td style="padding:9px 10px;border-bottom:1px solid #F0EEE7">${momHtml(r.mom)}</td>
    </tr>`;
    })
    .join("");

  const th = (label: string, sub?: string, align = "right") =>
    `<th style="background:#F6F5FE;color:#5F5E5A;font-weight:600;text-align:${align};padding:9px 10px;border-bottom:1px solid #E5E3DB;white-space:nowrap">${label}${sub ? `<br><span style="font-weight:400;font-size:10px">${sub}</span>` : ""}</th>`;

  return `<div style="font-size:18px;font-weight:700;margin-bottom:2px">経営サマリー（全社一覧）</div>
  <div style="font-size:12px;color:#888780;margin-bottom:14px">${monthLabel}時点・全ユニットの達成状況を俯瞰。色＝緑:達成／黄:あと少し／赤:未達。金額は万円。</div>
  ${kpis}
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;border:1px solid #E5E3DB;border-radius:12px;overflow:hidden">
   <thead><tr>${th("ユニット", "", "left")}${th("区分", "", "left")}${th("配賦人月")}${th("売上達成率", "当月")}${th("主目標", "", "left")}${th("目標(万)")}${th("実績(万)")}${th("判定", "", "center")}${th("前月比(万)")}</tr></thead>
   <tbody>${body}</tbody></table></div>
  <div style="font-size:11px;color:#888780;margin-top:8px">※ 主目標＝各ユニットの第一目標（全社=営業利益／不動産仲介=売上達成率／CX=貢献利益／他=部門利益）。投資部門(不動産仲介)は売上・KPIで評価＝赤字許容。</div>`;
}
