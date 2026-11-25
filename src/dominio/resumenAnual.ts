import { MyListItem } from "../types";

export interface ResumenAnual {
  anio: number;
  totalObras: number;
  peliculas: number;
  series: number;
  horas: number;
  peliculasSinDuracion: number;
  obrasSinDatos: number;
  generoTop: { nombre: string; obras: number } | null;
  directorTop: { nombre: string; obras: number } | null;
  obrasPorMes: number[];
  mesTop: number | null;
  destacada: MyListItem | null;
}

function yearOf(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

function monthOf(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getMonth();
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

export function aniosDisponibles(
  items: MyListItem[],
  anioActual: number,
): number[] {
  const years = new Set<number>([anioActual]);
  for (const item of items) {
    if (item.estado === "vista") {
      const year = yearOf(item.vistaEn);
      if (year !== null) {
        years.add(year);
      }
    }
  }
  return [...years].sort((a, b) => b - a);
}

export type VistaEnTransition = "set-server-now" | "clear" | "unchanged";

export function vistaEnTransition(
  estadoAnterior: "por_ver" | "viendo" | "vista",
  estadoNuevo: "por_ver" | "viendo" | "vista",
): VistaEnTransition {
  if (estadoAnterior !== "vista" && estadoNuevo === "vista")
    return "set-server-now";
  if (estadoNuevo !== "vista") return "clear";
  return "unchanged";
}

function rankedNames(
  items: MyListItem[],
  getNames: (item: MyListItem) => string[],
): { nombre: string; obras: number } | null {
  const counts = new Map<string, MyListItem[]>();

  for (const item of items) {
    for (const name of unique(getNames(item))) {
      const matches = counts.get(name) ?? [];
      matches.push(item);
      counts.set(name, matches);
    }
  }

  if (counts.size === 0) {
    return null;
  }

  const entries = [...counts.entries()].map(([nombre, matches]) => {
    const rated = matches.filter((item) => item.calificacion !== null);
    const average =
      rated.length > 0
        ? rated.reduce((sum, item) => sum + (item.calificacion ?? 0), 0) /
          rated.length
        : 0;
    return { nombre, obras: matches.length, average, ratedCount: rated.length };
  });

  entries.sort((a, b) => {
    if (b.obras !== a.obras) return b.obras - a.obras;
    if (b.ratedCount !== a.ratedCount) return b.ratedCount - a.ratedCount;
    if (a.ratedCount > 0 && b.average !== a.average)
      return b.average - a.average;
    return a.nombre.localeCompare(b.nombre, "es");
  });

  return { nombre: entries[0].nombre, obras: entries[0].obras };
}

export function resumenAnual(items: MyListItem[], anio: number): ResumenAnual {
  const viewed = items.filter(
    (item) => item.estado === "vista" && yearOf(item.vistaEn) === anio,
  );
  const movies = viewed.filter((item) => item.type === "movie");
  const series = viewed.filter((item) => item.type === "tv");

  const obrasPorMes = Array.from({ length: 12 }, () => 0);
  for (const item of viewed) {
    const month = monthOf(item.vistaEn);
    if (month !== null) {
      obrasPorMes[month] += 1;
    }
  }

  let mesTop: number | null = null;
  if (viewed.length > 0) {
    mesTop = 0;
    for (let month = 1; month < 12; month += 1) {
      if (
        obrasPorMes[month] > obrasPorMes[mesTop] ||
        (obrasPorMes[month] === obrasPorMes[mesTop] && month > mesTop)
      ) {
        mesTop = month;
      }
    }
  }

  const peliculasSinDuracion = movies.filter(
    (item) => item.duracionMin === null,
  ).length;
  const totalMinutes = movies.reduce(
    (sum, item) => sum + (item.duracionMin ?? 0),
    0,
  );
  const obrasSinDatos = viewed.filter((item) => {
    if (item.generos.length === 0) return true;
    if (item.type === "movie") {
      return item.duracionMin === null || item.directores.length === 0;
    }
    return false;
  }).length;

  const rated = viewed.filter((item) => item.calificacion !== null);
  const destacada =
    [...rated].sort((a, b) => {
      if ((b.calificacion ?? 0) !== (a.calificacion ?? 0)) {
        return (b.calificacion ?? 0) - (a.calificacion ?? 0);
      }
      const aTime = a.vistaEn ? new Date(a.vistaEn).getTime() : 0;
      const bTime = b.vistaEn ? new Date(b.vistaEn).getTime() : 0;
      return bTime - aTime;
    })[0] ?? null;

  return {
    anio,
    totalObras: viewed.length,
    peliculas: movies.length,
    series: series.length,
    horas: Math.round((totalMinutes / 60) * 10) / 10,
    peliculasSinDuracion,
    obrasSinDatos,
    generoTop: rankedNames(viewed, (item) => item.generos),
    directorTop: rankedNames(movies, (item) => item.directores),
    obrasPorMes,
    mesTop,
    destacada,
  };
}
