import { describe, it, expect } from "vitest";
import { live, snap, makeCtx } from "../lib/data";
import { renderPanel } from "./render";
import { UNITS } from "../config/units";

const ctx = makeCtx({ live, snap });

describe("renderPanel smoke test", () => {
  it("renders every unit panel without throwing and includes the unit name + 利益段", () => {
    UNITS.forEach((u, i) => {
      const html = renderPanel(ctx, i);
      expect(html).toContain(u.name);
      expect(html).toContain("部門別PLの利益段");
      expect(html).toContain("今月のアドバイス");
    });
  });

  it("SaaS注文 panel shows the cumulative 部門利益 15,388,744", () => {
    const idx = UNITS.findIndex((u) => u.key === "chumon");
    expect(renderPanel(ctx, idx)).toContain("15,388,744");
  });

  it("renders the static panels", () => {
    expect(renderPanel(ctx, "progress")).toContain("進捗（計画 対 実績）");
    expect(renderPanel(ctx, "vision")).toContain("経営と現場の一体化");
    expect(renderPanel(ctx, "rules")).toContain("分配ルール・方針");
  });

  it("経営サマリーが描画され、KPIと全ユニットを含む", () => {
    const html = renderPanel(ctx, "summary");
    expect(html).toContain("経営サマリー（全社一覧）");
    expect(html).toContain("99%"); // 全社売上累計達成率
    expect(html).toContain("前年同月比"); // YoY
    UNITS.forEach((u) => expect(html).toContain(u.name));
  });
});
