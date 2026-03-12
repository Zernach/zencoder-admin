import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildIndexHtml } from "./indexHtmlTemplate";

function main(): void {
  const outputPath = resolve(process.cwd(), "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${buildIndexHtml()}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
}

main();
