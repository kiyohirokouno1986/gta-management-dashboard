// 「目指す姿」タブ（静的）。Page.html の visionPanel を移植。

export function visionPanel(): string {
  return `<div style="font-size:18px;font-weight:700;margin-bottom:4px">目指す姿 ── 経営と現場の一体化</div>
 <div style="font-size:12px;color:#888780;margin-bottom:14px">なぜ目標・実績を連動させるのか（このダッシュボードで実現したいこと）</div>
 <div style="display:flex;gap:16px;align-items:stretch;flex-wrap:wrap">
  <div style="flex:1;min-width:280px;background:#FAECE7;border:1px solid #F5C4B3;border-radius:14px;padding:16px;box-sizing:border-box">
   <div style="font-size:12px;font-weight:600;color:#993C1D;margin-bottom:8px">現状</div>
   <div style="font-size:16px;font-weight:600;color:#993C1D;margin-bottom:12px">部門別PL（実績のみ）</div>
   <div style="background:#fff;border:1px solid #F5C4B3;border-radius:10px;padding:11px;margin-bottom:10px">
    <div style="font-size:12px;color:#5F5E5A">目標の概念がない</div>
    <div style="font-size:13px;color:#2C2C2A;margin-top:3px">実績の結果だけが並ぶ</div></div>
   <div style="text-align:center;color:#D85A30;font-size:16px;margin:2px 0 8px">↓</div>
   <div style="background:#fff;border:1px dashed #F0997B;border-radius:10px;padding:11px">
    <div style="font-size:13px;font-weight:600;color:#993C1D">争点が「経費の分配」だけになる</div>
    <div style="font-size:12px;color:#5F5E5A;margin-top:5px;line-height:1.55">投資部門も収益部門も同じ物差しで評価され、役割の違いが見えない</div></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:56px">
   <div style="color:#534AB7;font-size:22px">→</div><div style="font-size:11px;color:#534AB7;margin-top:3px;text-align:center">連動<br>させる</div></div>
  <div style="flex:1.15;min-width:300px;background:#EEEDFE;border:1px solid #CECBF6;border-radius:14px;padding:16px;box-sizing:border-box">
   <div style="font-size:12px;font-weight:600;color:#3C3489;margin-bottom:8px">あるべき姿</div>
   <div style="font-size:16px;font-weight:600;color:#3C3489;margin-bottom:12px">経営と現場の一体化</div>
   <div style="background:#fff;border:1px solid #CECBF6;border-radius:10px;padding:11px">
    <div style="font-size:11px;color:#7F77DD;font-weight:600">経営レイヤー</div>
    <div style="font-size:14px;font-weight:600;color:#3C3489;margin-top:3px">ボード会議：目標・実績管理シート</div>
    <div style="font-size:12px;color:#534AB7;margin-top:3px">＝ めざす目標</div></div>
   <div style="text-align:center;color:#534AB7;font-size:13px;margin:6px 0">↕ 連動</div>
   <div style="background:#E1F5EE;border:1px solid #9FE1CB;border-radius:10px;padding:11px">
    <div style="font-size:11px;color:#1D9E75;font-weight:600">現場レイヤー</div>
    <div style="font-size:14px;font-weight:600;color:#0F6E56;margin-top:3px">部門別PL</div>
    <div style="font-size:12px;color:#0F6E56;margin-top:3px">＝ 日々の実績</div></div>
   <div style="margin-top:12px;background:#534AB7;border-radius:10px;padding:10px 12px;text-align:center">
    <span style="font-size:14px;font-weight:600;color:#fff">目標 × 実績でベクトルがそろう</span></div>
  </div>
 </div>
 <div style="margin-top:16px;background:#F1EFE8;border:1px solid #D3D1C7;border-radius:14px;padding:16px">
  <div style="font-size:14px;font-weight:600;color:#2C2C2A;margin-bottom:4px">目標を持つと、部門ごとに求める役割が変わる</div>
  <div style="font-size:12px;color:#5F5E5A;margin-bottom:14px;line-height:1.55">実績だけでは全部門が「黒字かどうか」で一律に裁かれる。目標があれば、投資と収益で違う期待値を置ける。</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap">
   <div style="flex:1;min-width:240px;background:#fff;border:1px solid #D3D1C7;border-radius:10px;padding:13px">
    <div style="font-size:13px;font-weight:600;color:#185FA5;margin-bottom:4px">投資部門</div>
    <div style="font-size:12.5px;color:#2C2C2A;line-height:1.55">目標＝先行投資と将来の収益づくり。短期の赤字を許容して攻める。</div></div>
   <div style="flex:1;min-width:240px;background:#fff;border:1px solid #D3D1C7;border-radius:10px;padding:13px">
    <div style="font-size:13px;font-weight:600;color:#0F6E56;margin-bottom:4px">収益部門</div>
    <div style="font-size:12.5px;color:#2C2C2A;line-height:1.55">目標＝当期の利益貢献。黒字化と収益性の達成で評価する。</div></div>
  </div>
 </div>`;
}
