import { UNITS } from "../config/units";

export type TabKey =
  | number
  | "summary"
  | "issues"
  | "progress"
  | "vision"
  | "rules";

interface TabDef {
  key: TabKey;
  label: string;
  /** active 時の [背景色, 枠色]。既定は紫。 */
  active?: [string, string];
}

const LEAD: TabDef[] = [{ key: "summary", label: "経営サマリー" }];

const EXTRA: TabDef[] = [
  { key: "issues", label: "課題" },
  { key: "progress", label: "進捗" },
  { key: "vision", label: "目指す姿" },
  { key: "rules", label: "ルール・方針", active: ["#9C7B2E", "#9C7B2E"] },
];

export function Tabs({
  current,
  onSelect,
}: {
  current: TabKey;
  onSelect: (k: TabKey) => void;
}) {
  const unitTabs: TabDef[] = UNITS.map((u, k) => ({ key: k, label: u.name }));
  const all = [...LEAD, ...unitTabs, ...EXTRA];
  return (
    <div className="tabs">
      {all.map((t) => {
        const isActive = current === t.key;
        const style =
          isActive && t.active
            ? { background: t.active[0], color: "#fff", borderColor: t.active[1] }
            : undefined;
        return (
          <button
            key={String(t.key)}
            className={"tab" + (isActive ? " active" : "")}
            style={style}
            onClick={() => onSelect(t.key)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
