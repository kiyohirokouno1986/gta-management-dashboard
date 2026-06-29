// 課題ボードの読み書き境界。
//  読み: window.__ISSUES__（Apps Scriptがシートから注入）> localStorage > 埋め込み
//  書き: Apps Script の saveIssues()（google.script.run）にシート保存。
//        Apps Script 環境でない時（手元の単一HTML等）は localStorage に保存。
import type { Issue } from "./types";
import issuesJson from "../data/issues.json";

const bundled = issuesJson as Issue[];
const LS_KEY = "gta-issues";

declare global {
  interface Window {
    __ISSUES__?: Issue[];
    google?: {
      script?: {
        run?: {
          withSuccessHandler: (cb: (r: unknown) => void) => {
            withFailureHandler: (cb: (e: unknown) => void) => {
              saveIssues: (json: string) => void;
            };
          };
        };
      };
    };
  }
}

export function loadIssues(): Issue[] {
  if (typeof window !== "undefined") {
    if (window.__ISSUES__ && window.__ISSUES__.length) return window.__ISSUES__;
    try {
      const ls = window.localStorage?.getItem(LS_KEY);
      if (ls) return JSON.parse(ls) as Issue[];
    } catch {
      /* ignore */
    }
  }
  return bundled;
}

export type SaveTarget = "sheet" | "local";

/** 課題を保存。Apps Script があればシートへ、無ければ localStorage へ。 */
export function saveIssues(issues: Issue[]): Promise<SaveTarget> {
  const json = JSON.stringify(issues);
  try {
    window.localStorage?.setItem(LS_KEY, json);
  } catch {
    /* ignore */
  }
  const run = window.google?.script?.run;
  if (run) {
    return new Promise<SaveTarget>((resolve) => {
      run
        .withSuccessHandler(() => resolve("sheet"))
        .withFailureHandler(() => resolve("local"))
        .saveIssues(json);
    });
  }
  return Promise.resolve("local");
}
