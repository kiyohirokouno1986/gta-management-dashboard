// Number formatting helpers, ported verbatim from Page.html.

/** 円。四捨五入してカンマ区切り（en-US grouping）。 */
export const yen = (v: number): string => Math.round(v).toLocaleString("en-US");

/** 万円（÷10000して四捨五入・カンマ区切り）。 */
export const mm = (v: number): string =>
  Math.round(v / 10000).toLocaleString("en-US");

/** 配賦人月の表示（整数も小数もそのまま文字列化）。 */
export const jinFmt = (v: number): string => "" + v;
