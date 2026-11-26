# Épica y criterios

## HU-A.1 Recordar cuándo se vio

DADO una obra por ver; CUANDO pasa a vista; ENTONCES se guarda `vistaEn` con fecha del servidor.

## HU-A.2 Ver el resumen

DADO obras vistas en un año; CUANDO se abre Mi año; ENTONCES se muestran totales, horas, género, director, meses y destacada.

## HU-A.3 Cambiar de año

DADO varios años; CUANDO se abre el selector; ENTONCES se muestran los vistos y el actual.

## HU-A.4 Migrar obras antiguas

DADO una obra vista sin `vistaEn`; CUANDO se abre el resumen online; ENTONCES recibe `actualizadoEn` una sola vez.

## HU-A.5 Entender estados

DADO carga, vacío, error o desconexión; CUANDO ocurre; ENTONCES se muestra el mensaje correspondiente.

## Definition of Done

Código en `src/dominio/`, test asociado, spec, datos persistidos y prueba humana registrada.

## Tickets

| Ticket | Alcance                                   | Verificación                         | Estado       |
| ------ | ----------------------------------------- | ------------------------------------ | ------------ |
| MC-1   | Añadir `vistaEn` y controlar transiciones | Test D1 y revisión Firestore         | Implementado |
| MC-2   | Migrar obras vistas antiguas              | Lectura de `actualizadoEn` una vez   | Implementado |
| MC-3   | Completar datos TMDB de obras vistas      | Progreso por obra y manejo de fallos | Implementado |
| MC-4   | Implementar resumen anual puro            | Tests D3-D11                         | Implementado |
| MC-5   | Crear selector de años y estado vacío     | Prueba manual D4 y D12               | Implementado |
| MC-6   | Mostrar estado offline                    | Prueba manual D13                    | Implementado |
| MC-7   | Crear pantalla y componentes con tokens   | Lint de colores y prueba visual UI   | Implementado |
