// 今月のアドバイス（自動分析）。Page.html の advicePieces / adviceCard を移植。

import type { Ctx } from "../lib/types";
import type { Unit } from "../config/units";
import { TARGETS } from "../config/units";
import { targetSeries, agg } from "../lib/targets";
import { snapUnit } from "../lib/snap";
import { rowExpr, rowExpr12, salesPlan } from "../lib/sheet";
import { yen } from "../lib/format";

export function advicePieces(ctx: Ctx, u: Unit): string[] {
  const i = ctx.LATEST,
    list = TARGETS[u.key],
    s = targetSeries(ctx, u, list[0]);
  const ai = agg(ctx, s.act),
    ti = agg(ctx, s.tgt12);
  const prev = ctx.MODE !== "cum" && i > 0 ? s.act[i - 1] : null;
  const trend =
    prev !== null
      ? ai > prev * 1.02
        ? "前月から改善"
        : ai < prev * 0.98
          ? "前月から悪化"
          : "前月並み"
      : "";
  const sumA = s.act.slice(0, i + 1).reduce((a, b) => a + b, 0),
    sumT = s.tgt12.slice(0, i + 1).reduce((a, b) => a + b, 0);
  const cRate = sumT > 0 ? Math.round((sumA / sumT) * 100) : null;
  const out: string[] = [];
  if (u.key === "fudosan") {
    const pl = agg(ctx, salesPlan(ctx.live, u));
    const sr = pl > 0 ? Math.round((agg(ctx, snapUnit(ctx.snap, "fudosan", "uri")) / pl) * 100) : 0;
    out.push(
      `投資部門。${
        ctx.MODE === "cum" ? "累計の" : "当月の"
      }売上は計画比 ${sr}%。利益でなく売上・KPI（登録率や契約数）で進捗を見る局面。`,
    );
    const kou = agg(ctx, snapUnit(ctx.snap, "fudosan", "kou"));
    out.push(
      kou < -2000000
        ? `貢献利益 ${yen(kou)} は赤字上限（▲200万）を超過。先行投資の範囲を点検したい。`
        : `貢献利益 ${yen(kou)} は赤字上限の範囲内。`,
    );
  } else if (u.key === "cx") {
    const kou = agg(ctx, snapUnit(ctx.snap, "cx", "kou")),
      jin = agg(ctx, snapUnit(ctx.snap, "cx", "jin"));
    const perj = jin ? Math.round(kou / jin) : 0,
      be = Math.round(agg(ctx, ctx.snap.zen.ind) / agg(ctx, ctx.snap.zen.jin));
    out.push(
      kou >= 0
        ? `直接の貢献利益は ${yen(kou)} で黒字キープ（◯）。`
        : `直接の貢献利益が ${yen(kou)} と赤字。まず直接黒字の回復が最優先。`,
    );
    out.push(
      `人月あたり貢献利益は ${yen(perj)}。損益分岐 ${yen(be)} を ${
        perj >= be ? "上回り生産性は良好" : "下回り、配賦後は厳しい"
      }。`,
    );
    const cxc = agg(ctx, rowExpr(ctx.live.act, "35"));
    out.push(
      `粗利率の高いコンサル・動画（当月 ${yen(
        cxc,
      )}）の受注を増やし、貢献利益の月次目標まで引き上げるのが鍵。`,
    );
  } else {
    const pass = ai >= ti,
      gap = ti - ai,
      lab = s.label.replace(" 達成率", "");
    out.push(
      pass
        ? `${ctx.MODE === "cum" ? "累計の" : "当月の"}${lab}は計画ペースを達成（${yen(
            ai,
          )}）。${trend ? trend + "。" : ""}`
        : `${ctx.MODE === "cum" ? "累計の" : "当月の"}${lab}は ${yen(
            ai,
          )} で、計画ペース ${yen(ti)} に ${yen(gap)} 不足。${trend ? trend + "。" : ""}`,
    );
    if (ctx.MODE !== "cum") {
      if (sumA < 0)
        out.push(`累計の${lab}はまだマイナス（${yen(sumA)}）。後半での挽回が必要。`);
      else if (cRate !== null)
        out.push(
          `累計の達成率は ${cRate}%。${
            cRate >= 100 ? "通期計画に乗っている。" : "計画線を下回り、後半での挽回が必要。"
          }`,
        );
    }
    if (u.brk && u.brk.length > 1) {
      let worst: string | null = null,
        wr = 9999;
      u.brk.forEach((pr) => {
        const pl = agg(ctx, rowExpr12(ctx.live.plan, pr[1])),
          ac = agg(ctx, rowExpr(ctx.live.act, pr[1]));
        const r = pl > 0 ? Math.round((ac / pl) * 100) : null;
        if (r !== null && r < wr) {
          wr = r;
          worst = pr[0];
        }
      });
      if (worst && wr < 100)
        out.push(`内訳では「${worst}」が ${wr}% と相対的に弱く、ここの積み増しが効く。`);
    }
    if (u.key === "zen") out.push("全社黒字化に向け、各部門の計画ペース維持が前提。");
  }
  return out;
}

export function adviceCard(ctx: Ctx, u: Unit): string {
  const ps = advicePieces(ctx, u);
  return `<div style="margin-top:14px;background:#F6F5FE;border:1px solid #D9D2F2;border-radius:10px;padding:13px 15px">
  <div style="font-size:12px;font-weight:600;color:#3C3489;margin-bottom:6px">今月のアドバイス（自動分析）</div>
  <div style="font-size:13px;color:#23262F;line-height:1.65">${ps.join(" ")}</div></div>`;
}
