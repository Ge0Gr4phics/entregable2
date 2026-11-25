import { describe, expect, it } from "vitest";

import { MyListItem } from "../types";
import {
  aniosDisponibles,
  resumenAnual,
  vistaEnTransition,
} from "./resumenAnual";

function item(overrides: Partial<MyListItem>): MyListItem {
  return {
    id: "movie_1",
    tmdbId: 1,
    type: "movie",
    title: "Obra",
    year: "2025",
    posterPath: null,
    estado: "vista",
    calificacion: null,
    comentario: "",
    agregadoEn: null,
    actualizadoEn: "2025-06-10T12:00:00.000Z",
    vistaEn: "2025-06-10T12:00:00.000Z",
    generos: ["Drama"],
    duracionMin: 120,
    directores: ["Ana"],
    ...overrides,
  };
}

describe("resumenAnual", () => {
  it("D1 establece vistaEn al entrar en vista y la conserva al editar", () => {
    expect(vistaEnTransition("viendo", "vista")).toBe("set-server-now");
    expect(vistaEnTransition("vista", "vista")).toBe("unchanged");
    expect(vistaEnTransition("vista", "viendo")).toBe("clear");
  });
  it("D3 cuenta una obra una vez en el año local de vistaEn", () => {
    const result = resumenAnual([item({})], 2025);
    expect(result.totalObras).toBe(1);
  });

  it("D4 permite contar obras migradas con vistaEn", () => {
    expect(
      aniosDisponibles([item({ vistaEn: "2023-01-01T10:00:00.000Z" })], 2026),
    ).toEqual([2026, 2023]);
  });

  it("D5 conserva datos separados por tipo", () => {
    const result = resumenAnual(
      [
        item({ type: "movie", duracionMin: 90, directores: ["Ana"] }),
        item({
          id: "tv_2",
          tmdbId: 2,
          type: "tv",
          duracionMin: null,
          directores: [],
        }),
      ],
      2025,
    );
    expect(result.peliculas).toBe(1);
    expect(result.series).toBe(1);
  });

  it("D6 cuenta obras sin datos TMDB", () => {
    const result = resumenAnual(
      [item({ generos: [], duracionMin: null, directores: [] })],
      2025,
    );
    expect(result.obrasSinDatos).toBe(1);
  });

  it("D7 suma horas y indica películas sin duración", () => {
    const result = resumenAnual(
      [
        item({ duracionMin: 120 }),
        item({ id: "movie_2", tmdbId: 2, duracionMin: null }),
        item({
          id: "tv_3",
          tmdbId: 3,
          type: "tv",
          duracionMin: null,
          directores: [],
        }),
      ],
      2025,
    );
    expect(result.horas).toBe(2);
    expect(result.peliculasSinDuracion).toBe(1);
  });

  it("D8 desempata géneros por promedio y luego alfabéticamente", () => {
    const result = resumenAnual(
      [
        item({ id: "1", generos: ["Drama"], calificacion: 5 }),
        item({ id: "2", generos: ["Drama"], calificacion: 3 }),
        item({ id: "3", generos: ["Comedia"], calificacion: 4 }),
      ],
      2025,
    );
    expect(result.generoTop?.nombre).toBe("Drama");
  });

  it("D8 considera sin calificaciones como peor que calificadas", () => {
    const result = resumenAnual(
      [
        item({ generos: ["Drama"], calificacion: null }),
        item({ generos: ["Comedia"], calificacion: 2 }),
      ],
      2025,
    );
    expect(result.generoTop?.nombre).toBe("Comedia");
  });

  it("D9 muestra director solo para películas", () => {
    const result = resumenAnual(
      [
        item({ directores: ["Ana"], duracionMin: 90 }),
        item({
          id: "tv_2",
          tmdbId: 2,
          type: "tv",
          directores: ["Luis"],
          generos: ["Drama"],
        }),
      ],
      2025,
    );
    expect(result.directorTop?.nombre).toBe("Ana");
  });

  it("D10 muestra los 12 meses y el empate se resuelve al mes más reciente", () => {
    const result = resumenAnual(
      [
        item({ vistaEn: "2025-01-10T12:00:00.000Z" }),
        item({ id: "2", vistaEn: "2025-12-10T12:00:00.000Z" }),
      ],
      2025,
    );
    expect(result.obrasPorMes).toHaveLength(12);
    expect(result.obrasPorMes[0]).toBe(1);
    expect(result.obrasPorMes[11]).toBe(1);
    expect(result.mesTop).toBe(11);
  });

  it("D11 desempata destacada por fecha más reciente", () => {
    const older = item({
      id: "1",
      calificacion: 5,
      vistaEn: "2025-01-10T12:00:00.000Z",
    });
    const newer = item({
      id: "2",
      calificacion: 5,
      vistaEn: "2025-08-10T12:00:00.000Z",
    });
    expect(resumenAnual([older, newer], 2025).destacada?.id).toBe("2");
  });

  it("D12 devuelve resumen vacío para un año sin obras vistas", () => {
    const result = resumenAnual([item({ estado: "viendo" })], 2025);
    expect(result.totalObras).toBe(0);
  });
});
