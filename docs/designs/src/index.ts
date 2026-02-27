import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildCleanedSpec } from "./cleaner.ts";
import { getCliConfig, type CliConfig } from "./config.ts";
import { FigmaRestApi, type IFigmaApi } from "./figmaApi.ts";
import { toMarkdown } from "./markdown.ts";
import type { FigmaFileResponse } from "./types.ts";

async function saveArtifacts(
  outputRoot: string,
  raw: FigmaFileResponse,
  cleaned: ReturnType<typeof buildCleanedSpec>
): Promise<void> {
  await mkdir(outputRoot, { recursive: true });

  const rawPath = join(outputRoot, "figma.raw.json");
  const cleanedPath = join(outputRoot, "figma.cleaned.json");
  const tokensPath = join(outputRoot, "figma.tokens.json");
  const markdownPath = join(outputRoot, "figma.ui-spec.md");

  await writeFile(rawPath, JSON.stringify(raw, null, 2), "utf8");
  await writeFile(cleanedPath, JSON.stringify(cleaned, null, 2), "utf8");
  await writeFile(tokensPath, JSON.stringify(cleaned.tokens, null, 2), "utf8");
  await writeFile(markdownPath, toMarkdown(cleaned), "utf8");

  console.log(`Saved raw JSON: ${rawPath}`);
  console.log(`Saved cleaned JSON: ${cleanedPath}`);
  console.log(`Saved tokens: ${tokensPath}`);
  console.log(`Saved AI markdown spec: ${markdownPath}`);
}

async function run(api: IFigmaApi, config: CliConfig): Promise<void> {
  const outputRoot = resolve(process.cwd(), config.outputDir);

  console.log(`Fetching Figma file ${config.fileKey}...`);
  const raw = await api.getFile(config.fileKey);

  const cleaned = buildCleanedSpec(config.fileKey, raw);
  await saveArtifacts(outputRoot, raw, cleaned);

  console.log(
    `Done. Nodes: ${cleaned.summary.totalNodes}, screens: ${cleaned.summary.screens}, components: ${cleaned.summary.components}`
  );
}

const config = getCliConfig();
run(new FigmaRestApi(config.figmaToken), config).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown error", error);
  }

  process.exit(1);
});
