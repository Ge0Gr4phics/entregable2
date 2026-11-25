# Auditoría

## Inicio

| id  | Hallazgo                                   | Evidencia                                       | Gravedad | Decisión       |
| --- | ------------------------------------------ | ----------------------------------------------- | -------- | -------------- |
| A1  | Las pantallas mezclaban datos y navegación | `src/screens/*`, `src/context/AppContext.tsx`   | Media    | Corregir ahora |
| A2  | Los colores estaban dispersos              | `src/screens/*.tsx`                             | Media    | Corregir ahora |
| A3  | No existían tests ni Vitest                | `package.json`                                  | Alta     | Corregir ahora |
| A4  | No existía modelo de fecha TMDB anual      | `src/types.ts`, `src/services/myListService.ts` | Alta     | Corregir ahora |

## Cierre

Fecha: 2026-11-24.
Se agregó dominio puro, campos nuevos, migración, enriquecimiento TMDB, pantalla anual y harness.
Pendiente: completar prueba humana en teléfono y validar reglas en Firebase con dos cuentas.
