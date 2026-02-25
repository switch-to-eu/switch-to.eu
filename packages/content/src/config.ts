import path from "path";

let contentRoot: string | null = null;

export function setContentRoot(dir: string): void {
  contentRoot = dir;
}

export function getContentRoot(): string {
  return contentRoot ?? path.resolve(__dirname, "..", "content");
}
