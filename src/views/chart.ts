// SVG折れ線チャートとMQ（限界利益）バー。Page.html の svgChart / mqBar を忠実に移植。

import { ML12 } from "../config/units";
import { yen } from "../lib/format";

/** 計画 vs 実績の折れ線（万円）。zero=true で0ラインを描画。 */
export function svgChart(plan: number[], act: number[], zero: boolean): string {
  const W = 840,
    H = 196,
    x0 = 58,
    x1 = W - 14,
    y0 = 16,
    y1 = H - 26;
  const P = plan.map((v) => v / 10000),
    A = act.map((v) => v / 10000);
  let mx = Math.max(0, ...P, ...A),
    mn = Math.min(0, ...P, ...A);
  const rng = mx - mn || 1;
  mx += rng * 0.08;
  mn -= rng * 0.05;
  if (!zero) {
    mn = 0;
  } else if (mn > 0) {
    mn = 0;
  }
  const n = P.length,
    dx = (x1 - x0) / (n - 1);
  const X = (i: number) => x0 + i * dx,
    Y = (v: number) => y1 - ((v - mn) / (mx - mn)) * (y1 - y0);
  let g = "";
  for (let q = 0; q <= 4; q++) {
    const v = mn + ((mx - mn) * q) / 4,
      y = Y(v);
    g += `<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(
      1,
    )}" stroke="#EEEDE7"/><text x="${x0 - 5}" y="${(y + 3).toFixed(
      1,
    )}" font-size="9" fill="#aaa" text-anchor="end">${Math.round(
      v,
    ).toLocaleString("en-US")}</text>`;
  }
  if (zero) {
    const yz = Y(0);
    g += `<line x1="${x0}" y1="${yz.toFixed(1)}" x2="${x1}" y2="${yz.toFixed(
      1,
    )}" stroke="#C9C7BE" stroke-width="1.2"/>`;
  }
  for (let i = 0; i < n; i++)
    g += `<text x="${X(i).toFixed(1)}" y="${
      H - 9
    }" font-size="8.5" fill="#aaa" text-anchor="middle">${ML12[i]}</text>`;
  g += `<polyline points="${P.map(
    (v, i) => X(i).toFixed(1) + "," + Y(v).toFixed(1),
  ).join(" ")}" fill="none" stroke="#CECBF6" stroke-width="2.5"/>`;
  g += `<polyline points="${A.map(
    (v, i) => X(i).toFixed(1) + "," + Y(v).toFixed(1),
  ).join(" ")}" fill="none" stroke="#534AB7" stroke-width="3"/>`;
  A.forEach(
    (v, i) =>
      (g += `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(
        1,
      )}" r="3.2" fill="#534AB7"/>`),
  );
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:100%" role="img">${g}</svg>`;
}

/** 利益構造のMQバー（変動費／限界利益／固定費／利益）。 */
export function mqBar(
  label: string,
  pq: number,
  vq: number,
  mq: number,
  f: number,
  g: number,
): string {
  if (!(pq > 0)) return "";
  const vqp = (vq / pq) * 100,
    mqp = (mq / pq) * 100,
    fp = (Math.max(0, f) / pq) * 100,
    gp = (Math.max(0, g) / pq) * 100;
  return `<div style="margin-top:12px"><div style="font-size:12px;font-weight:600;color:#5F5E5A;margin-bottom:6px">${label}</div>
  <div style="display:flex;height:24px;border-radius:6px;overflow:hidden;font-size:10px">
   <div style="width:${vqp}%;background:#D3D1C7;display:flex;align-items:center;padding-left:6px">変動費 ${yen(
     vq,
   )}</div>
   <div style="width:${mqp}%;background:#9FE1CB;color:#0F6E56;display:flex;align-items:center;padding-left:6px">限界利益 ${yen(
     mq,
   )}</div></div>
  <div style="display:flex;height:24px;margin-top:3px;font-size:10px"><div style="width:${vqp}%"></div>
   <div style="width:${fp}%;background:#F0997B;color:#712B13;border-radius:6px 0 0 6px;display:flex;align-items:center;padding-left:6px">固定費 ${yen(
     f,
   )}</div>
   <div style="width:${gp}%;min-width:64px;background:#534AB7;color:#fff;border-radius:0 6px 6px 0;display:flex;align-items:center;padding-left:6px">利益 ${yen(
     g,
   )}</div></div></div>`;
}
