// dist-single/index.html（自己完結ビルド）を Apps Script 配信用バンドル gas/ に取り込む。
// 使い方: `npm run build:gas`（SINGLE ビルド → このスクリプトで gas/Index.html を更新）
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "dist-single/index.html");
const outDir = resolve(root, "gas");
mkdirSync(outDir, { recursive: true });

const html = readFileSync(src, "utf8");
writeFileSync(resolve(outDir, "Index.html"), html);
console.log(`gas/Index.html updated (${html.length.toLocaleString("en-US")} bytes)`);
