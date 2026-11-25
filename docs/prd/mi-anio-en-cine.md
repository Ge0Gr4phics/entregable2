# PRD - Mi año en cine

## Objetivo

Mostrar un resumen anual de obras vistas y permitir seleccionar los años disponibles.

## Reglas de negocio

D1 `vistaEn` se guarda con `serverTimestamp` al pasar a vista; cambiar a otro estado lo deja en null; volver a vista usa una fecha nueva; editar calificación/comentario no cambia la fecha.

D2 Las obras vistas sin `vistaEn` reciben una sola vez el valor de `actualizadoEn` al abrir el resumen.
D3 El año se obtiene del año calendario local de `vistaEn`; cada obra cuenta una vez.
D4 El selector contiene años vistos y el año actual, ordenados del más reciente al más antiguo.
D5 Al agregar se guardan `generos`, `duracionMin` y `directores`.
D6 Los datos faltantes se completan de TMDB uno a uno desde la pantalla; los fallos quedan contados sin afectar horas, género ni director.
D7 Las horas usan minutos de películas y un decimal.
D8 El género suma una obra por género y usa promedio personal y alfabeto como desempate.
D9 El director se calcula solo con películas con las mismas reglas.
D10 El mes más activo empata al mes más reciente; se muestran 12 meses.
D11 La destacada usa calificación y luego fecha `vistaEn` más reciente.
D12 Un año sin obras vistas muestra el estado vacío y el botón a Mi lista.
D13 Sin conexión se usa AsyncStorage, se muestra aviso y no se migran ni completan datos.

## Puntos abiertos

- No se define comportamiento para dos directores con igual nombre normalizado.
- Los géneros desconocidos de TMDB se consideran datos incompletos.
