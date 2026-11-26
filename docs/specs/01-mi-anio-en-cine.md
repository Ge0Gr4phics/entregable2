# Spec 01 - Mi año en cine

## Alcance

Nueva pestaña Mi año, resumen puro anual, migración de fechas, enriquecimiento TMDB y reglas Firestore.

## Fuera de alcance

Gráficas externas, revisiones, exportación PDF y recomendaciones.

## Modelo

Agregar `vistaEn`, `generos`, `duracionMin` y `directores` sin romper documentos antiguos.

## Dominio

`aniosDisponibles(items, anioActual)` y `resumenAnual(items, anio)` son funciones puras.

## Servicios

Firestore persiste campos y transiciones. TMDB se consulta de una obra a la vez en pantalla.

## Componentes

Usar los tokens y componentes definidos en `DESIGN.md`.

## Criterio a verificación

- D1-D13: tests de dominio, reglas y acciones manuales documentadas.
- Contraste y área táctil: inspección del brand board y de la pantalla.

## Comportamiento de preparación

La migración y el enriquecimiento TMDB se ejecutan una sola vez por usuario y por obra durante la sesión.
Si TMDB falla o no devuelve datos, la obra queda registrada como pendiente de datos sin repetir consultas de forma continua.
