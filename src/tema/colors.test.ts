import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "tema" ? [] : sourceFiles(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry.name) && entry.name !== "theme.ts"
      ? [fullPath]
      : [];
  });
}

describe("colores fijos", () => {
  it("no permite colores hexadecimal fuera de src/tema", () => {
    const findings: string[] = [];

    for (const file of sourceFiles(path.resolve(__dirname, ".."))) {
      const matches = fs.readFileSync(file, "utf8").match(/#[0-9a-f]{3,8}\b/gi);
      if (matches) {
        findings.push(
          `${path.relative(process.cwd(), file)}: ${[...new Set(matches)].join(", ")}`,
        );
      }
    }

    expect(findings, findings.join("\n")).toEqual([]);
  });
});
