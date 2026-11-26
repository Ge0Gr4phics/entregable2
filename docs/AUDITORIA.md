# Auditoría

## Inicio

| id  | Hallazgo                                   | Evidencia                                       | Gravedad | Decisión       |
| --- | ------------------------------------------ | ----------------------------------------------- | -------- | -------------- |
| A1  | Las pantallas mezclaban datos y navegación | `src/screens/*`, `src/context/AppContext.tsx`   | Media    | Corregir ahora |
| A2  | Los colores estaban dispersos              | `src/screens/*.tsx`                             | Media    | Corregir ahora |
| A3  | No existían tests ni Vitest                | `package.json`                                  | Alta     | Corregir ahora |
| A4  | No existía modelo de fecha TMDB anual      | `src/types.ts`, `src/services/myListService.ts` | Alta     | Corregir ahora |

## Cierre

Fecha de cierre: 2026-11-26.
Se agregó dominio puro, campos nuevos, migración, enriquecimiento TMDB, pantalla anual y harness.
Las verificaciones automáticas pasan; los sensores están registrados en Vitest.

## Riesgos pendientes

- Completar la prueba humana en teléfono y registrar los resultados obtenidos.
- Publicar las reglas y validar aislamiento y escrituras con dos cuentas.
- Tomar las capturas solicitadas y demostrar la demo ensayada.
