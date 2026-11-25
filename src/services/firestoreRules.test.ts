import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("reglas de Mi lista", () => {
  const rules = fs.readFileSync(
    path.resolve(process.cwd(), "firestore.rules"),
    "utf8",
  );

  it("rechaza duracionMin negativa", () => {
    expect(rules).toMatch(/duracionMin.*is int/s);
    expect(rules).toMatch(/duracionMin.*> 0/s);
  });

  it("solo permite calificar cuando el estado es vista", () => {
    expect(rules).toMatch(
      /\(data\.estado == 'vista' \|\| data\.calificacion == null\)/,
    );
  });

  it("valida vistaEn solo para obras vistas", () => {
    expect(rules).toContain(
      "data.estado == 'vista' && data.get('vistaEn', null) is timestamp",
    );
  });
});
