import type { FigmaFileResponse } from "./types.ts";

export interface IFigmaApi {
  getFile(fileKey: string): Promise<FigmaFileResponse>;
}

export class FigmaRestApi implements IFigmaApi {
  private readonly token: string;

  public constructor(token: string) {
    this.token = token;
  }

  public async getFile(fileKey: string): Promise<FigmaFileResponse> {
    const endpoint = `https://api.figma.com/v1/files/${fileKey}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Figma-Token": this.token
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Figma API request failed (${response.status} ${response.statusText}): ${body}`);
    }

    return (await response.json()) as FigmaFileResponse;
  }
}
