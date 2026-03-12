export interface FigmaZipHtmlTemplateTokens {
  lang: string;
  title: string;
  rootElementId: string;
  mainModulePath: string;
}

const DEFAULT_TOKENS: FigmaZipHtmlTemplateTokens = {
  lang: "en",
  title: "zencoder-admin",
  rootElementId: "root",
  mainModulePath: "/src/main.tsx",
};

export function buildIndexHtml(tokens: FigmaZipHtmlTemplateTokens = DEFAULT_TOKENS): string {
  const { lang, title, rootElementId, mainModulePath } = tokens;

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>

  <body>
    <div id="${rootElementId}"></div>
    <script type="module" src="${mainModulePath}"></script>
  </body>
</html>`;
}
