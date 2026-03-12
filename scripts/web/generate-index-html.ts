import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildIndexHtml } from "../../src/web/indexHtmlTemplate";

function main(): void {
  const outputPath = resolve(process.cwd(), "public", "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${buildIndexHtml()}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
}

main();
