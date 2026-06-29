// 共通の小ヘルパ（色・ステータス判定）。Page.html から移植。

/** 区分タグ → [背景色, 文字色]。 */
export function tagColor(t: string): [string, string] {
  if (t.indexOf("投資部門") === 0) return ["#E6F1FB", "#185FA5"];
  if (t.indexOf("全社") === 0) return ["#F1EFE8", "#5F5E5A"];
  if (t.indexOf("一部") >= 0) return ["#EEEDFE", "#3C3489"];
  return ["#E1F5EE", "#0F6E56"];
}
