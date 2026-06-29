import { useMemo, useState } from "react";
import type { Ctx, Issue, Quadrant } from "../lib/types";
import { QUADS, CATS, CAT_LIST } from "../config/board";
import { loadIssues, saveIssues, type SaveTarget } from "../lib/persist";
import { newCandidates } from "../lib/board";

const EMPTY: Issue = {
  title: "",
  cat: CAT_LIST[0],
  quad: "計画する",
  memo: "",
  owner: "-",
  due: "",
};

interface Editing {
  mode: "add" | "edit";
  index: number; // edit時の対象index、add時は-1
  draft: Issue;
}

export function IssuesBoard({ ctx }: { ctx: Ctx }) {
  const [issues, setIssues] = useState<Issue[]>(() => loadIssues());
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState<SaveTarget | null>(null);

  const byQuad = useMemo(() => {
    const m: Record<string, { issue: Issue; index: number }[]> = {};
    issues.forEach((issue, index) => {
      (m[issue.quad] ||= []).push({ issue, index });
    });
    return m;
  }, [issues]);

  function persist(next: Issue[]) {
    setIssues(next);
    setSaved(null);
    saveIssues(next).then(setSaved);
  }

  function move(index: number, quad: Quadrant) {
    if (issues[index].quad === quad) return;
    const next = issues.map((it, k) => (k === index ? { ...it, quad } : it));
    persist(next);
  }

  function remove(index: number) {
    if (!confirm(`「${issues[index].title}」を削除しますか？`)) return;
    persist(issues.filter((_, k) => k !== index));
  }

  function commitEdit() {
    if (!editing) return;
    const d = editing.draft;
    if (!d.title.trim()) {
      setEditing(null);
      return;
    }
    const next =
      editing.mode === "add"
        ? [...issues, d]
        : issues.map((it, k) => (k === editing.index ? d : it));
    persist(next);
    setEditing(null);
  }

  function aiSuggest() {
    const cands = newCandidates(ctx, issues);
    if (!cands.length) {
      alert("数値から追加できる新しい課題は見つかりませんでした（既に登録済み）。");
      return;
    }
    persist([...issues, ...cands]);
    alert(`${cands.length}件の課題を「計画する/すぐやる」に追加しました。`);
  }

  const savedLabel =
    saved === "sheet" ? "保存しました（シート）" : saved === "local" ? "保存しました（端末）" : "";

  const card = (issue: Issue, index: number, color: string) => {
    const cc = CATS[issue.cat] || ["#F1EFE8", "#5F5E5A"];
    return (
      <div
        key={index}
        draggable
        onDragStart={() => setDragIdx(index)}
        onDragEnd={() => setDragIdx(null)}
        style={{
          background: "#fff",
          border: "1px solid #ECEAE2",
          borderLeft: `3px solid ${color}`,
          borderRadius: 10,
          padding: "11px 12px",
          marginBottom: 10,
          cursor: "grab",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{issue.title}</div>
        {issue.memo && (
          <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.55, marginBottom: 8 }}>
            {issue.memo}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              borderRadius: 6,
              padding: "2px 8px",
              fontWeight: 600,
              background: cc[0],
              color: cc[1],
            }}
          >
            {issue.cat}
          </span>
          {issue.owner && issue.owner !== "-" && (
            <span style={{ fontSize: 11, color: "#888780" }}>担当 {issue.owner}</span>
          )}
          {issue.due && (
            <span style={{ fontSize: 11, color: "#888780" }}>期限 {issue.due}</span>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            className="mini"
            onClick={() => setEditing({ mode: "edit", index, draft: { ...issue } })}
            style={miniBtn}
          >
            編集
          </button>
          <button className="mini" onClick={() => remove(index)} style={miniBtn}>
            削除
          </button>
        </div>
      </div>
    );
  };

  const dropProps = (quad: Quadrant) => ({
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIdx !== null) move(dragIdx, quad);
      setDragIdx(null);
    },
  });

  const done = byQuad["完了"] || [];

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
        課題ボード <span style={{ color: "#C0492B" }}>緊急 × 重要</span>（アイゼンハワー型）
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", margin: "8px 0 4px" }}>
        <button onClick={aiSuggest} style={aiBtn}>
          🤖 AIで課題を提案（数値から自動抽出）
        </button>
        <button onClick={() => setIssues(loadIssues())} style={plainBtn}>
          ↻ 再読込
        </button>
        <span style={{ fontSize: 12, color: "#888780" }}>読込済（{issues.length}枚）</span>
        {savedLabel && <span style={{ fontSize: 12, color: "#0F6E56" }}>{savedLabel}</span>}
      </div>
      <div style={{ fontSize: 11, color: "#9b9a93", marginBottom: 10 }}>
        ドラッグで象限を移動。カード「編集」でタイトル・メモ・カテゴリ変更。各象限「＋追加」。完了したら下のDoneへ。保存先＝課題ボードGoogleシート（Slackキャンバスへは別途書き出し）。
      </div>
      <div style={{ display: "flex", gap: 14, margin: "6px 0", fontSize: 12, color: "#888780" }}>
        <div style={{ flex: 1, textAlign: "center" }}>緊急</div>
        <div style={{ flex: 1, textAlign: "center" }}>緊急でない</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {QUADS.map((q) => {
          const items = byQuad[q.key] || [];
          return (
            <div
              key={q.key}
              style={{ background: "#fff", border: "1px solid #E5E3DB", borderRadius: 12, overflow: "hidden" }}
            >
              <div
                style={{
                  background: q.color,
                  color: "#fff",
                  padding: "9px 13px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>{q.key}</span>
                <span style={{ opacity: 0.85, fontWeight: 400, fontSize: 12, marginLeft: 6 }}>
                  {q.sub}
                </span>
                <span style={countBadge}>{items.length}</span>
              </div>
              <div style={{ padding: 12, background: "#FCFBF8", minHeight: 110 }} {...dropProps(q.key)}>
                {items.map(({ issue, index }) => card(issue, index, q.color))}
                <button
                  style={addBtn}
                  onClick={() =>
                    setEditing({ mode: "add", index: -1, draft: { ...EMPTY, quad: q.key } })
                  }
                >
                  ＋ 追加
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, background: "#fff", border: "1px solid #E5E3DB", borderRadius: 12, padding: 12 }} {...dropProps("完了")}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>✅ 完了（Done）</h3>
        {done.length === 0 && (
          <div style={{ fontSize: 12, color: "#9b9a93" }}>ここにドラッグで完了に移動。</div>
        )}
        {done.map(({ issue, index }) => (
          <div
            key={index}
            draggable
            onDragStart={() => setDragIdx(index)}
            onDragEnd={() => setDragIdx(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#5F5E5A",
              padding: "6px 0",
              borderBottom: "1px solid #F0EEE7",
              cursor: "grab",
            }}
          >
            <span style={{ color: "#0F6E56", fontWeight: 700 }}>✓</span> {issue.title}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#9b9a93" }}>
              {issue.cat} ・ {issue.due}
            </span>
            <button className="mini" onClick={() => remove(index)} style={miniBtn}>
              削除
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div style={overlay} onClick={() => setEditing(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              {editing.mode === "add" ? "課題を追加" : "課題を編集"}
            </div>
            {field(
              "課題",
              <input
                style={inp}
                value={editing.draft.title}
                onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, title: e.target.value } })}
              />,
            )}
            {field(
              "メモ",
              <textarea
                style={{ ...inp, height: 70, resize: "vertical" }}
                value={editing.draft.memo}
                onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, memo: e.target.value } })}
              />,
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {field(
                "カテゴリ",
                <select
                  style={inp}
                  value={editing.draft.cat}
                  onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, cat: e.target.value } })}
                >
                  {CAT_LIST.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>,
              )}
              {field(
                "象限",
                <select
                  style={inp}
                  value={editing.draft.quad}
                  onChange={(e) =>
                    setEditing({ ...editing, draft: { ...editing.draft, quad: e.target.value as Quadrant } })
                  }
                >
                  {[...QUADS.map((q) => q.key), "完了"].map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>,
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {field(
                "担当",
                <input
                  style={inp}
                  value={editing.draft.owner}
                  onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, owner: e.target.value } })}
                />,
              )}
              {field(
                "期限",
                <input
                  style={inp}
                  value={editing.draft.due}
                  onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, due: e.target.value } })}
                />,
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button style={plainBtn} onClick={() => setEditing(null)}>
                キャンセル
              </button>
              <button style={aiBtn} onClick={commitEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function field(label: string, control: React.ReactNode) {
  return (
    <label style={{ display: "block", flex: 1, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "#888780" }}>{label}</span>
      {control}
    </label>
  );
}

const miniBtn: React.CSSProperties = {
  fontSize: 11,
  padding: "3px 9px",
  borderRadius: 6,
  border: "1px solid #D3D1C7",
  background: "#fff",
  marginRight: 6,
  cursor: "pointer",
};
const aiBtn: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #534AB7",
  background: "#534AB7",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};
const plainBtn: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #D3D1C7",
  background: "#fff",
  cursor: "pointer",
};
const addBtn: React.CSSProperties = {
  width: "100%",
  border: "1px dashed #CFCDC4",
  background: "transparent",
  borderRadius: 10,
  padding: 9,
  color: "#888780",
  cursor: "pointer",
  fontSize: 12,
};
const countBadge: React.CSSProperties = {
  marginLeft: "auto",
  background: "rgba(255,255,255,.25)",
  borderRadius: 20,
  minWidth: 22,
  height: 22,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
};
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};
const modal: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  width: "min(520px, 92vw)",
  boxShadow: "0 10px 40px rgba(0,0,0,.2)",
};
const inp: React.CSSProperties = {
  width: "100%",
  marginTop: 3,
  padding: "7px 9px",
  borderRadius: 8,
  border: "1px solid #D3D1C7",
  fontSize: 13,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
