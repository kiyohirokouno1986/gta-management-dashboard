import { describe, it, expect } from "vitest";
import { live, snap, makeCtx } from "./data";
import { buildSummaryRows, buildSummaryKpi } from "./summary";
import { deriveCandidates, newCandidates } from "./board";
import { loadIssues } from "./persist";
import { num, rowVals, rowVals12, salesPlan, salesPlan12 } from "./sheet";
import { snapUnit, sumUnits } from "./snap";
import { targetSeries } from "./targets";
import { makeForecast, forecastFromSeries } from "./forecast";
import { yen, mm } from "./format";
import type { Ctx } from "./types";
import { UNITS, TARGETS } from "../config/units";
import { QUAD_LABEL } from "../config/board";

const ctx: Ctx = { live, snap, LATEST: 3, MODE: "month" } as unknown as Ctx;
const unit = (k: string) => UNITS.find((u) => u.key === k)!;

describe("num", () => {
  it("strips separators and handles blanks", () => {
    expect(num("1,172")).toBe(1172);
    expect(num("ー")).toBe(0);
    expect(num("")).toBe(0);
    expect(num(null)).toBe(0);
    expect(num(18576)).toBe(18576);
  });
});

describe("sheet row reads (千円 → 円)", () => {
  it("rowVals row6 (合計売上高) starts at 18,576,000", () => {
    expect(rowVals(live.plan, 6)[0]).toBe(18576000);
  });
  it("rowVals12 returns 12 months", () => {
    expect(rowVals12(live.plan, 6)).toHaveLength(12);
  });
  it("salesPlan for SaaS注文 = row 12 + row 25", () => {
    expect(salesPlan(live, unit("chumon"))).toEqual([
      10876000, 11276000, 11676000, 12076000,
    ]);
  });
});

describe("snapUnit / sumUnits", () => {
  it("zen passes through the snapshot", () => {
    expect(snapUnit(snap, "zen", "bu")).toEqual([138006, -4548077, -651831, 2822629]);
  });
  it("saas = chumon + fudosan + cx (部門利益)", () => {
    expect(snapUnit(snap, "saas", "bu")).toEqual([-482412, -3112573, -235712, 406334]);
    expect(sumUnits(snap, ["chumon", "fudosan", "cx"], "bu")).toEqual(
      snapUnit(snap, "saas", "bu"),
    );
  });
});

describe("SaaS注文 targets (plan_margin bu 40%)", () => {
  const s = targetSeries(ctx, unit("chumon"), TARGETS.chumon[0]);
  it("actual 部門利益 2〜5月 matches snapshot", () => {
    expect(s.act).toEqual([4042170, 2869298, 3742732, 4734544]);
  });
  it("累計 部門利益 2〜5月 = 15,388,744", () => {
    expect(s.act.slice(0, 4).reduce((a, b) => a + b, 0)).toBe(15388744);
  });
  it("target line = 計画売上 × 40% (rounded)", () => {
    expect(s.tgt12.slice(0, 4)).toEqual([4350400, 4510400, 4670400, 4830400]);
  });
  it("is an amount target, not a rate target", () => {
    expect(s.isRate).toBe(false);
  });
});

describe("不動産仲介 targets (plan_sales)", () => {
  const s = targetSeries(ctx, unit("fudosan"), TARGETS.fudosan[0]);
  it("is a rate (達成率) target on 売上", () => {
    expect(s.isRate).toBe(true);
    expect(s.act).toEqual([0, 200000, 100000, 0]);
    expect(s.tgt12.slice(0, 4)).toEqual([200000, 260000, 240000, 400000]);
  });
});

describe("全社 営業利益 target (op_line)", () => {
  const s = targetSeries(ctx, unit("zen"), TARGETS.zen[0]);
  it("actual = zen 部門利益, target = 10期計画 営業利益ライン", () => {
    expect(s.act).toEqual([138006, -4548077, -651831, 2822629]);
    expect(s.tgt12).toHaveLength(12);
  });
});

describe("progress (全社 売上 累計)", () => {
  const cum = (a: number[]) => {
    let x = 0;
    return a.map((v) => (x += v));
  };
  it("累計実績/計画 5月 → 達成率 99%", () => {
    const uriPC = cum(rowVals12(live.plan, 6));
    const uriAC = cum(snap.zen.uri);
    expect(uriPC[3]).toBe(76504000);
    expect(uriAC[3]).toBe(75969151);
    expect(Math.round((uriAC[3] / uriPC[3]) * 100)).toBe(99);
  });
});

describe("formatting", () => {
  it("yen rounds and groups", () => {
    expect(yen(-2000000)).toBe("-2,000,000");
    expect(yen(4734544)).toBe("4,734,544");
  });
  it("mm divides by 10000", () => {
    expect(mm(75969151)).toBe("7,597");
  });
});

describe("salesPlan12 length", () => {
  it("returns 12 months for 12+25 unit", () => {
    expect(salesPlan12(live, unit("chumon"))).toHaveLength(12);
  });
});

describe("経営サマリー (summary)", () => {
  const c = makeCtx({ live, snap });
  const kpi = buildSummaryKpi(c);
  it("KPI: 全社売上累計達成率99% / YoY 累計15%・当月23%", () => {
    expect(kpi.salesRateCum).toBe(99);
    expect(kpi.salesYoYCum).toBe(15);
    expect(kpi.salesYoYMonth).toBe(23);
  });
  it("KPI: 黒字部門 3/5 ・ 営業利益(管理)累計 -2,239,273 ・ 配賦人月14", () => {
    expect(kpi.profitUnits).toBe(3);
    expect(kpi.profitUnitsTotal).toBe(5);
    expect(kpi.opCumMgmt).toBe(-2239273);
    expect(kpi.jinTotal).toBe(14);
  });
  const rows = buildSummaryRows(c);
  it("行は全ユニット分・判定が目標カードと整合", () => {
    expect(rows).toHaveLength(7);
    const get = (k: string) => rows.find((r) => r.key === k)!;
    expect(get("zen").judge).toBe("pass"); // 営業利益 2,822,629 ≥ 計画 633,660
    expect(get("consul").judge).toBe("pass"); // 部門利益 計画ペース達成
    expect(get("fudosan").srMonth).toBe(0); // 不動産仲介 当月売上0
    expect(get("fudosan").judge).toBe("fail");
    expect(get("chumon").judge).toBe("near"); // 4,734,544 vs 目標 4,830,400
  });
});

describe("通期着地見込み (forecast B1)", () => {
  it("ランレート＝累計÷経過月×12（計画ピッタリ）", () => {
    const fc = makeForecast(1200, [100, 100, 100, 100], 4);
    expect(fc.run).toBe(1200);
    expect(fc.gap).toBe(0);
    expect(fc.rate).toBe(100);
    expect(fc.ok).toBe(true);
  });
  it("経過月0は0、annual0以下は黒字キープ型（rate=null）", () => {
    expect(makeForecast(1000, [], 0).run).toBe(0);
    const keep = makeForecast(0, [50, 50, 50, 50], 4);
    expect(keep.rate).toBe(null);
    expect(keep.ok).toBe(true); // 見込み>0
    expect(makeForecast(0, [-50, -50, -50, -50], 4).ok).toBe(false);
  });
  it("SaaS注文 主目標の見込み＝累計部門利益15,388,744÷4×12", () => {
    const c = makeCtx({ live, snap });
    const s = targetSeries(c, unit("chumon"), TARGETS.chumon[0]);
    const fc = forecastFromSeries(c, s);
    expect(fc.run).toBe((15388744 / 4) * 12);
  });
  it("経営サマリー各行に通期見込みが入る", () => {
    const rows = buildSummaryRows(makeCtx({ live, snap }));
    expect(rows.every((r) => typeof r.fc.run === "number")).toBe(true);
  });
});

describe("課題ボード (board)", () => {
  const c = makeCtx({ live, snap });
  it("loadIssues は埋め込み課題(9件)を返す（window無し環境）", () => {
    expect(loadIssues()).toHaveLength(9);
  });
  it("AI提案: 数値から課題候補を自動抽出", () => {
    const cands = deriveCandidates(c);
    const titles = cands.map((x) => x.title);
    // 営業利益(管理)累計が赤字 → 通期黒字化
    expect(titles).toContain("通期黒字化の確度向上");
    // 不動産仲介(投資)が売上未達 → 投資回収の筋道
    expect(titles).toContain("不動産仲介 投資回収の筋道(KPI)");
  });
  it("newCandidates は既存タイトルを除外する", () => {
    expect(newCandidates(c, [])).toEqual(deriveCandidates(c));
    expect(newCandidates(c, loadIssues())).toHaveLength(0); // 埋め込みに同名あり
  });
});

describe("フィードバック改善 (#1/#3)", () => {
  it("#3 SaaS注文の売上内訳が 初期/MRR/BPO の3行に分解されている", () => {
    const u = UNITS.find((x) => x.key === "chumon")!;
    expect(u.brk.map((b) => b[0])).toEqual([
      "初期導入（ALL GRIT）",
      "MRR（ALL GRIT）",
      "BPO（らくらく集客）",
    ]);
    expect(u.brk.map((b) => b[1])).toEqual(["13", "14", "25"]);
  });
  it("#1 課題ボード『なくす』の表示ラベルは『保留・現状維持』（保存値はキー互換）", () => {
    expect(QUAD_LABEL["なくす"]).toBe("保留・現状維持");
  });
  it("B4 CXの内訳がチーム呼称（オンリーワンセールス/CX在庫）に分解されている", () => {
    const u = UNITS.find((x) => x.key === "cx")!;
    expect(u.brk.map((b) => b[0])).toEqual([
      "オンリーワンセールス（コンサル・動画）",
      "CX在庫（コール代行）",
    ]);
    expect(u.brk.map((b) => b[1])).toEqual(["35", "31"]);
  });
});

describe("dynamic month count (sheet may add months)", () => {
  // 5ヶ月分のスナップショットを擬似生成（6月を追加）
  const grow = (a: number[]) => [...a, a[a.length - 1]];
  const snap5 = JSON.parse(JSON.stringify(snap));
  for (const u of Object.keys(snap5)) {
    for (const m of Object.keys(snap5[u])) {
      snap5[u][m] = grow(snap5[u][m]);
    }
  }
  it("sumUnits follows the array length, not a hardcoded 4", () => {
    expect(sumUnits(snap5, ["chumon", "fudosan", "cx"], "bu")).toHaveLength(5);
  });
  it("makeCtx derives LATEST and labels for 5 months", () => {
    const ctx5 = makeCtx({ live, snap: snap5 });
    expect(ctx5.LATEST).toBe(4);
    expect(ctx5.months).toEqual(["2月", "3月", "4月", "5月", "6月"]);
  });
  it("makeCtx honors injected month labels when provided", () => {
    const ctx5 = makeCtx({ live, snap: snap5, months: ["2月", "3月", "4月", "5月", "6月"] });
    expect(ctx5.months[4]).toBe("6月");
  });
});
