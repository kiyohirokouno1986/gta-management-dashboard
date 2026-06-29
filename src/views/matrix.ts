// 目標×月マトリクス（過去＝達成色／未来＝計画ペース）。Page.html の matCell/matRow/buildMatrix を移植。

import type { Ctx } from "../lib/types";
import type { Unit } from "../config/units";
import { ML12, TARGETS } from "../config/units";
import { targetSeries, type TargetSeries } from "../lib/targets";
import { rowExpr, rowExpr12 } from "../lib/sheet";
import { yen } from "../lib/format";

type CellKind = "pass" | "near" | "fail" | "future";

function matCell(text: string, kind: CellKind, hl: boolean, cum: boolean): string {
  const map: Record<CellKind, [string, string]> = {
    pass: ["#E1F5EE", "#0F6E56"],
    near: ["#FBF3EF", "#9A7B12"],
    fail: ["#FAECE7", "#993C1D"],
    future: ["#EEEDFE", "#3C3489"],
  };
  const c = map[kind];
  let bd = cum
    ? "border-left:2px solid #534AB7;font-weight:700;"
    : hl
      ? "box-shadow:inset 0 0 0 2px #534AB7;"
      : "border-left:1px solid #EFEDE6;";
  if (cum && hl) bd += "box-shadow:inset 0 0 0 2px #534AB7;";
  return `<td style="${bd}background:${c[0]};color:${c[1]};padding:5px 6px;text-align:center;white-space:nowrap">${text}</td>`;
}

function matRow(ctx: Ctx, num: string, s: TargetSeries): string {
  const i = ctx.LATEST;
  let cells = "";
  for (let k = 0; k <= i; k++) {
    if (s.isRate) {
      const r = s.tgt12[k] > 0 ? Math.round((s.act[k] / s.tgt12[k]) * 100) : null;
      const pass = r !== null && r >= 100,
        near = r !== null && r >= 90;
      cells += matCell(
        r !== null ? r + "%" : "—",
        pass ? "pass" : near ? "near" : "fail",
        k === i,
        false,
      );
    } else {
      const pass = s.act[k] >= s.tgt12[k];
      const near =
        s.act[k] >= s.tgt12[k] - Math.max(Math.abs(s.tgt12[k]) * 0.1, 200000);
      cells += matCell(
        yen(s.act[k]),
        pass ? "pass" : near ? "near" : "fail",
        k === i,
        false,
      );
    }
  }
  for (let k = i + 1; k < 12; k++) cells += matCell(yen(s.tgt12[k]), "future", false, false);
  const total = s.tgt12.reduce((a, b) => a + b, 0);
  return `<tr><td style="text-align:left;padding:5px 8px;white-space:nowrap;position:sticky;left:0;background:#fff;font-weight:600">${num} ${s.label}<br><span style="font-size:10px;color:#888780;font-weight:400">${s.sub}</span></td>${cells}<td style="padding:5px 8px;text-align:right;font-weight:600;background:#F6F5FE">${yen(
    total,
  )}</td></tr>`;
}

export function buildMatrix(ctx: Ctx, u: Unit): string {
  const list = TARGETS[u.key];
  let rows = "";
  list.forEach((t, n) => {
    const num = list.length > 1 ? ["①", "②", "③"][n] : "";
    rows += matRow(ctx, num, targetSeries(ctx, u, t));
  });
  if (u.brk)
    u.brk.forEach((p) => {
      rows += matRow(ctx, "└", {
        tgt12: rowExpr12(ctx.live.plan, p[1]),
        act: rowExpr(ctx.live.act, p[1]),
        isRate: true,
        label: p[0],
        sub: "達成率%",
      });
    });
  const i = ctx.LATEST;
  let hd = "";
  for (let k = 0; k < 12; k++) {
    hd += `<th style="padding:5px 6px;text-align:center;${
      k === i ? "background:#EEEDFE;" : k > i ? "background:#F6F5FE;" : ""
    }color:#888780;font-weight:600;border-left:1px solid #EFEDE6">${ML12[k]}</th>`;
  }
  return `<div style="overflow-x:auto;margin-top:6px"><table style="border-collapse:collapse;font-size:11.5px;min-width:980px;width:100%">
  <thead><tr><th style="text-align:left;padding:5px 8px;position:sticky;left:0;background:#fff;color:#888780">目標／月</th>${hd}<th style="padding:5px 8px;color:#888780">通期</th></tr></thead>
  <tbody>${rows}</tbody></table></div>
  <div style="font-size:10px;color:#888780;margin-top:5px">緑=達成／黄=あと少し／赤=未達。紫=この先の目標。枠=今月。単位 円・%。売上=10期計画ライブ、利益=計画売上×目標率で逆算（全社は10期営業利益ライン）。</div>`;
}
