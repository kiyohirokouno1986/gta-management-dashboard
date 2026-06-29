import { describe, it, expect } from "vitest";
import { live, snap } from "./data";
import { num, rowVals, rowVals12, salesPlan, salesPlan12 } from "./sheet";
import { snapUnit, sumUnits } from "./snap";
import { targetSeries } from "./targets";
import { yen, mm } from "./format";
import type { Ctx } from "./types";
import { UNITS, TARGETS } from "../config/units";

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
