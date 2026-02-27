declare module "node:fs/promises" {
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding?: string): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
}

declare module "node:path" {
  export function resolve(...segments: string[]): string;
  export function join(...segments: string[]): string;
}

declare module "node:url" {
  export class URL {
    constructor(input: string, base?: string);
    pathname: string;
    searchParams: {
      get(name: string): string | null;
    };
  }
}

declare const process: {
  cwd(): string;
  argv: string[];
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare function fetch(
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
  }
): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json(): Promise<unknown>;
}>;
