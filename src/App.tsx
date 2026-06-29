import { useEffect, useMemo, useState } from "react";
import type { Ctx } from "./lib/types";
import { loadData, makeCtx } from "./lib/data";
import { Tabs, type TabKey } from "./components/Tabs";
import { renderPanel, FOOTER_NOTE } from "./views/render";

export default function App() {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cur, setCur] = useState<TabKey>("summary");

  useEffect(() => {
    loadData()
      .then((data) => setCtx(makeCtx(data)))
      .catch((e) => setErr(String(e)));
  }, []);

  const body = useMemo(() => (ctx ? renderPanel(ctx, cur) : ""), [ctx, cur]);

  return (
    <div className="wrap">
      <div className="title">ユニットMTG ダッシュボード</div>
      <div className="subtitle">
        売上＝10期シート（クラウド・自動更新）／利益段・配賦人月＝部門別PL（Googleシート・自動更新）。単位：円
      </div>
      {err && <div className="err">読み込みエラー：{err}</div>}
      {!ctx && !err && <div id="status">データを読み込み中…</div>}
      {ctx && (
        <div>
          <Tabs current={cur} onSelect={setCur} />
          <div className="card" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="note">{FOOTER_NOTE}</div>
        </div>
      )}
    </div>
  );
}
