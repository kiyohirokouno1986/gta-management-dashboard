// Unit definitions, target logic, and per-unit rules.
// Ported verbatim from the canonical Apps Script Page.html (UNITS / TARGETS / UNIT_RULES).
// These are the evaluation core: changing a target rate re-computes every month.

export type UnitKey =
  | "zen"
  | "saas"
  | "chumon"
  | "fudosan"
  | "cx"
  | "auka"
  | "consul";

/** Snapshot metric keys (department PL profit tiers). */
export type MetricKey =
  | "uri"
  | "gp"
  | "dc1"
  | "dc2"
  | "dctot"
  | "kou"
  | "ind"
  | "bu"
  | "jin";

/** A row expression into the 10期 sheet: a row number, or "a+b" (e.g. "12+25"). */
export type RowExpr = number | string;

export interface Unit {
  key: UnitKey;
  name: string;
  tag: string;
  desc: string;
  /** Sales-plan row in the 10期 sheet (number or "12+25"). */
  plan: RowExpr;
  /** Sales breakdown rows: [label, rowExpr]. */
  brk: [string, string][];
}

export type Target =
  | { label: string; kind: "op_line" }
  | { label: string; kind: "plan_sales" }
  | { label: string; kind: "plan_margin"; m: "bu" | "kou"; rate: number }
  | { label: string; kind: "flat"; m: "bu" | "kou"; th: number }
  | { label: string; kind: "monthly"; m: "bu" | "kou"; arr: number[] };

export interface UnitRule {
  ev: string;
  rate?: string;
  note?: string;
}

/** 表示対象の4ヶ月（部門別PLスナップショットの範囲）。 */
export const MONTHS = ["2月", "3月", "4月", "5月"] as const;

/** 通期12ヶ月のラベル（2月始まり）。 */
export const ML12 = [
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
  "1月",
] as const;

export const UNITS: Unit[] = [
  {
    key: "zen",
    name: "全社",
    tag: "全社合計",
    desc: "5部門の合計。会社全体の損益",
    plan: 6,
    brk: [["全社合計", "6"]],
  },
  {
    key: "saas",
    name: "SaaS全体",
    tag: "収益（SaaS3事業の合計）",
    desc: "注文・不動産仲介・CXの合算",
    plan: 8,
    brk: [
      ["SaaS注文", "12+25"],
      ["不動産仲介", "18"],
      ["CX", "30"],
    ],
  },
  {
    key: "chumon",
    name: "SaaS注文",
    tag: "収益部門",
    desc: "当期の部門利益（黒字）で評価する",
    plan: "12+25",
    brk: [
      ["初期導入（ALL GRIT）", "13"],
      ["MRR（ALL GRIT）", "14"],
      ["BPO（らくらく集客）", "25"],
    ],
  },
  {
    key: "fudosan",
    name: "不動産仲介",
    tag: "投資部門",
    desc: "先行投資フェーズ。当期の赤字を許容し、KPI（査定・契約数）で進捗を見る",
    plan: 18,
    brk: [["不動産仲介売上", "18"]],
  },
  {
    key: "cx",
    name: "CX",
    tag: "収益部門（一部 投資フェーズ）",
    desc: "コール代行は収益、コンサル・動画作成は立ち上げ投資フェーズ",
    plan: 30,
    brk: [
      ["コール代行", "31"],
      ["コンサル・動画作成", "35"],
    ],
  },
  {
    key: "auka",
    name: "auka",
    tag: "収益部門",
    desc: "当期の部門利益（黒字）で評価する",
    plan: 39,
    brk: [
      ["自社チャネル", "40"],
      ["提携・TLチャネル", "44"],
    ],
  },
  {
    key: "consul",
    name: "コンサル",
    tag: "収益部門",
    desc: "当期の部門利益（黒字）で評価する",
    plan: 48,
    brk: [["コンサル売上", "48"]],
  },
];

export const TARGETS: Record<UnitKey, Target[]> = {
  zen: [{ label: "営業利益を 事業計画ライン以上 に", kind: "op_line" }],
  saas: [
    { label: "部門利益を 計画ペース以上 に", kind: "plan_margin", m: "bu", rate: 0.05 },
  ],
  chumon: [
    { label: "部門利益を 計画ペース以上 に", kind: "plan_margin", m: "bu", rate: 0.4 },
  ],
  fudosan: [
    { label: "売上を 計画（事業計画）達成 に", kind: "plan_sales" },
    {
      label: "貢献利益の赤字を ▲200円以内 に（維持）",
      kind: "flat",
      m: "kou",
      th: -2000000,
    },
  ],
  cx: [
    { label: "貢献利益（直接）を 黒字キープ（0以上）に", kind: "flat", m: "kou", th: 0 },
    {
      label: "貢献利益を 計画ペースまで伸ばす（コンサル受注で積み増し）",
      kind: "plan_margin",
      m: "kou",
      rate: 0.25,
    },
  ],
  auka: [
    { label: "貢献利益を 計画ペース以上 に", kind: "plan_margin", m: "kou", rate: 0.5 },
  ],
  consul: [
    { label: "部門利益を 計画ペース以上 に", kind: "plan_margin", m: "bu", rate: 0.45 },
  ],
};

export const UNIT_RULES: Record<UnitKey, UnitRule> = {
  zen: {
    ev: "全社の営業利益を事業計画ライン以上（黒字化）",
    note: "5部門の合計。各部門の計画ペース維持が前提。",
  },
  saas: {
    ev: "SaaS3事業のグロスで黒字を評価",
    note: "注文＋不動産仲介＋CXの合算で見る。",
  },
  chumon: {
    ev: "部門利益の黒字（計画ペース）",
    rate: "40%",
    note: "全社の屋台骨。MRRと新規・解約を注視。",
  },
  fudosan: {
    ev: "売上の計画達成・KPIで評価（投資・赤字許容）",
    note: "貢献利益の赤字は▲200万以内。利益でなくKPIで進捗を見る。",
  },
  cx: {
    ev: "まず直接の貢献利益で黒字、次に配賦後",
    rate: "25%",
    note: "アルバイトは何名でも配賦上は「1人月」に固定。CXは アルバイト分（1）＋ アルバイト以外の山内・降旗（2名）＝ 合計3人月。コンサル・動画は立ち上げ投資フェーズ。",
  },
  auka: {
    ev: "貢献利益の黒字（計画ペース）",
    rate: "50%",
    note: "売上の振れが大きい。先行きの相談カウンター件数を見る。",
  },
  consul: {
    ev: "部門利益の黒字（計画ペース）",
    rate: "45%",
    note: "高粗利の収益柱。安定維持。",
  },
};
