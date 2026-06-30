// 通期着地見込み（ランレート＝累計実績÷経過月×12）。B1。
import type { Ctx } from "./types";
import type { TargetSeries } from "./targets";

export interface Forecast {
  /** 現ペースの通期見込み。 */
  run: number;
  /** 通期計画（目標）。0以下は「黒字キープ」型でrateを出さない。 */
  annual: number;
  /** 見込み − 計画。 */
  gap: number;
  /** 見込み達成率%（annual>0のときのみ）。 */
  rate: number | null;
  /** 計画達成見込みか（rateありなら100%以上、黒字キープ型なら見込み≥0）。 */
  ok: boolean;
}

/** 累計実績配列・経過月数・通期計画から見込みを作る。 */
export function makeForecast(
  annual: number,
  act: number[],
  elapsed: number,
): Forecast {
  const cum = act.slice(0, elapsed).reduce((a, b) => a + b, 0);
  const run = elapsed > 0 ? (cum / elapsed) * 12 : 0;
  const gap = run - annual;
  const rate = annual > 0 ? Math.round((run / annual) * 100) : null;
  const ok = annual > 0 ? run >= annual : run >= 0;
  return { run, annual, gap, rate, ok };
}

/** 目標シリーズから見込みを作る（主目標の通期着地）。 */
export function forecastFromSeries(ctx: Ctx, s: TargetSeries): Forecast {
  const annual = s.tgt12.reduce((a, b) => a + b, 0);
  return makeForecast(annual, s.act, ctx.LATEST + 1);
}
