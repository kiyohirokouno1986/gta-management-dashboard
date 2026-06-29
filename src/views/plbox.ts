// 部門別PLの利益段（月次テーブル）＋ 利益構造（MQ）。Page.html の plBox を移植。

import type { Ctx } from "../lib/types";
import { lastAct } from "../lib/types";
import type { MetricKey, Unit } from "../config/units";
import { snapUnit } from "../lib/snap";
import { yen } from "../lib/format";
import { mqBar } from "./chart";

type Def = [string, MetricKey, "" | "cost" | "kou" | "ind" | "bu"];

export function plBox(ctx: Ctx, u: Unit): string {
  const N = lastAct(ctx);
  const LATEST = ctx.LATEST;
  let body = "";
  const defs: Def[] = [
    ["売上高", "uri", ""],
    ["売上総利益", "gp", ""],
    ["− 直接コスト①（人件費・稼働）", "dc1", "cost"],
    ["− 直接コスト②（獲得・運用）", "dc2", "cost"],
    ["　直接コスト計", "dctot", "cost"],
    ["貢献利益", "kou", "kou"],
    ["− 間接コスト（配賦）", "ind", "ind"],
    ["部門利益", "bu", "bu"],
  ];
  defs.forEach((d) => {
    const arr = snapUnit(ctx.snap, u.key, d[1]);
    let cells = "",
      sum = 0;
    for (let m = 0; m <= N; m++) {
      const v = arr[m];
      sum += v;
      const hl = m === LATEST ? "background:#F6F5FE;" : "";
      const neg = (d[2] === "kou" || d[2] === "bu") && v < 0 ? "color:#993C1D;" : "";
      cells += `<td style="text-align:right;padding:4px 8px;${hl}${neg}">${yen(v)}</td>`;
    }
    const cumst =
      d[2] === "bu"
        ? "background:#D9EFE3;color:#0F6E56;font-weight:700;"
        : d[2] === "kou"
          ? "background:#E8F0FB;"
          : "background:#F1F8F4;";
    const lblst =
      d[2] === "kou" || d[2] === "bu"
        ? "font-weight:700;"
        : d[2] === "cost"
          ? "color:#5F5E5A;"
          : "";
    const rowbg =
      d[2] === "kou"
        ? "background:#F6F5FE;"
        : d[2] === "bu"
          ? "background:#EFF7F2;"
          : "background:#fff;";
    body += `<tr><td style="text-align:left;padding:4px 8px;${lblst}position:sticky;left:0;${rowbg}">${d[0]}</td>${cells}<td style="text-align:right;padding:4px 8px;${cumst}">${yen(
      sum,
    )}</td></tr>`;
  });
  let hd = "";
  for (let m = 0; m <= N; m++)
    hd += `<th style="text-align:right;padding:5px 8px;${
      m === LATEST ? "background:#EEEDFE;" : ""
    }color:#888780;font-weight:600">${ctx.months[m]}</th>`;
  const i = LATEST;
  const sumK = (k: MetricKey): number => {
    const a = snapUnit(ctx.snap, u.key, k);
    let x = 0;
    for (let m = 0; m <= N; m++) x += a[m];
    return x;
  };
  const mqbox =
    mqBar(
      `今月の利益構造（MQ・${ctx.months[i]}）`,
      snapUnit(ctx.snap, u.key, "uri")[i],
      snapUnit(ctx.snap, u.key, "dctot")[i],
      snapUnit(ctx.snap, u.key, "kou")[i],
      snapUnit(ctx.snap, u.key, "ind")[i],
      snapUnit(ctx.snap, u.key, "bu")[i],
    ) +
    mqBar(
      `累計の利益構造（MQ・2〜${ctx.months[N]}）`,
      sumK("uri"),
      sumK("dctot"),
      sumK("kou"),
      sumK("ind"),
      sumK("bu"),
    );
  return `<div style="overflow-x:auto;margin-top:6px"><table style="border-collapse:collapse;font-size:11.5px;min-width:620px;width:100%"><thead><tr><th style="text-align:left;padding:5px 8px;position:sticky;left:0;background:#fff;color:#888780">利益段</th>${hd}<th style="text-align:right;padding:5px 8px;background:#E1F5EE;color:#0F6E56;font-weight:700">累計</th></tr></thead><tbody>${body}</tbody></table></div>${mqbox}`;
}
