import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { allEndpointMetadata } from "@/contracts/http/endpointRegistry";
import { API_VERSION } from "@/contracts/http/versioning";

type OpenApiPathItem = Record<string, unknown>;

function collectPathParameters(path: string): string[] {
  const matches = path.match(/\{[^}]+\}/g) ?? [];
  return matches.map((segment) => segment.slice(1, -1));
}

function ensurePathMethod(paths: Record<string, OpenApiPathItem>, path: string, method: string, value: unknown): void {
  const pathItem = paths[path] ?? {};
  pathItem[method] = value;
  paths[path] = pathItem;
}

function buildOpenApiDocument(): Record<string, unknown> {
  const paths: Record<string, OpenApiPathItem> = {};

  const schemaNames = new Set<string>(["ApiError"]);
  for (const endpoint of allEndpointMetadata) {
    schemaNames.add(endpoint.requestType);
    schemaNames.add(endpoint.responseType);

    const parameters = collectPathParameters(endpoint.path).map((name) => ({
      name,
      in: "path",
      required: true,
      schema: { type: "string" },
      description: `Path parameter: ${name}`,
    }));

    const responses: Record<string, unknown> = {
      [String(endpoint.successStatus)]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${endpoint.responseType}` },
          },
        },
      },
    };

    for (const error of endpoint.errorResponses) {
      responses[String(error.status)] = {
        description: `${error.code}: ${error.description}`,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      };
    }

    const operation: Record<string, unknown> = {
      operationId: endpoint.operationId,
      summary: endpoint.summary,
      tags: [endpoint.feature],
      security: [{ bearerAuth: [] }],
      parameters,
      responses,
      "x-requestType": endpoint.requestType,
      "x-responseType": endpoint.responseType,
      "x-tenantScoped": endpoint.tenantScoped,
    };

    if (endpoint.method !== "GET" && endpoint.method !== "DELETE") {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${endpoint.requestType}` },
          },
        },
      };
    }

    ensurePathMethod(paths, endpoint.path, endpoint.method.toLowerCase(), operation);
  }

  const schemas = Object.fromEntries(
    Array.from(schemaNames)
      .sort((left, right) => left.localeCompare(right))
      .map((schemaName) => [schemaName, { type: "object", description: `Schema placeholder for ${schemaName}.` }]),
  );

  return {
    openapi: "3.1.0",
    info: {
      title: "Zencoder Admin API",
      version: API_VERSION,
      description: "Generated endpoint contract from frontend endpoint registry.",
    },
    servers: [{ url: `/${API_VERSION}` }],
    security: [{ bearerAuth: [] }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas,
    },
  };
}

function main(): void {
  const outputPath = resolve(process.cwd(), "openapi", "admin-api-v1.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  const doc = buildOpenApiDocument();
  writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
}

main();
