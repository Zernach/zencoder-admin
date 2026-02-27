import { URL } from "node:url";

export interface CliConfig {
  figmaToken: string;
  fileKey: string;
  outputDir: string;
}

const DEFAULT_FIGMA_URL = "https://www.figma.com/design/8xHt2xu01fBIGp0huXJkG7/DesignZencoder";

interface ParsedArgs {
  figmaUrl?: string;
  outputDir?: string;
  fileKey?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--figma-url" && next) {
      parsed.figmaUrl = next;
      index += 1;
      continue;
    }

    if (arg === "--out" && next) {
      parsed.outputDir = next;
      index += 1;
      continue;
    }

    if (arg === "--file-key" && next) {
      parsed.fileKey = next;
      index += 1;
    }
  }

  return parsed;
}

export function extractFigmaFileKey(figmaUrl: string): string {
  const url = new URL(figmaUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  const makeIndex = parts.findIndex((part) => part === "make");
  if (makeIndex >= 0 && parts[makeIndex + 1]) {
    throw new Error(
      "Figma Make files are not supported by the REST API. Use a regular Figma Design file instead (URL should contain /file/, not /make/). " +
        "You can copy designs from Make into a Design file, or create your designs in Figma Design directly."
    );
  }

  const designIndex = parts.findIndex((part) => part === "design" || part === "file");
  if (designIndex >= 0 && parts[designIndex + 1]) {
    return parts[designIndex + 1];
  }

  throw new Error(`Could not extract file key from URL: ${figmaUrl}`);
}

export function getCliConfig(): CliConfig {
  const args = parseArgs(process.argv.slice(2));

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    throw new Error("Missing FIGMA_TOKEN environment variable.");
  }

  const figmaUrl = args.figmaUrl ?? process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const fileKey = args.fileKey ?? process.env.FIGMA_FILE_KEY ?? (figmaUrl ? extractFigmaFileKey(figmaUrl) : undefined);

  if (!fileKey) {
    throw new Error("Missing Figma file key. Provide --file-key, FIGMA_FILE_KEY, or --figma-url/FIGMA_URL.");
  }

  return {
    figmaToken,
    fileKey,
    outputDir: args.outputDir ?? process.env.FIGMA_OUTPUT_DIR ?? "docs/designs/out"
  };
}
