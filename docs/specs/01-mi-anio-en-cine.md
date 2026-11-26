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
  | Criterio | Verificación asignada |
  |---|---|
  | D1 | Test de transición `vistaEn` y edición manual |
  | D2 | Migración de Firestore y revisión manual |
  | D3 | Test de resumen por año local |
  | D4 | Test `aniosDisponibles` y prueba manual |
  | D5 | Test de datos por tipo y documento Firestore |
  | D6 | Test de obras sin datos y manejo de errores TMDB |
  | D7 | Test de horas y duraciones faltantes |
  | D8 | Test de desempate de géneros |
  | D9 | Test de director y películas |
  | D10 | Test de meses y empate |
  | D11 | Test de obra destacada |
  | D12 | Test de resumen vacío y prueba manual |
  | D13 | Prueba manual de modo avión y AsyncStorage |

## Comportamiento de preparación

La migración y el enriquecimiento TMDB se ejecutan una sola vez por usuario y por obra durante la sesión.
Si TMDB falla o no devuelve datos, la obra queda registrada como pendiente de datos sin repetir consultas de forma continua.
