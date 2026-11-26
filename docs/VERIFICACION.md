# Verificación humana

| Criterio | Pasos                                                                    | Resultado esperado                                                                           | Resultado obtenido                                                                      |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| D1       | Marcar vista, editar comentario, volver a por ver y volver a vista       | Primera fecha se conserva al editar; dejarla de estar vista la borra; volver cambia la fecha | No ejecutado: requiere dispositivo, cuenta Firebase y resultados observados manualmente |
| D2       | Abrir resumen con obra antigua vista                                     | Se migra `vistaEn` desde `actualizadoEn` una sola vez                                        | No ejecutado: requiere abrir el proyecto en Expo Go y revisar Firestore                 |
| D4       | Cambiar año                                                              | Se ven los años con obras vistas y el año actual, del más reciente al más antiguo            | No ejecutado: requiere datos reales en Mi lista                                         |
| D12      | Elegir año vacío                                                         | Aparece el estado vacío y el botón `Ir a Mi lista` funciona                                  | No ejecutado: requiere configurar un año sin obras                                      |
| D13      | Activar modo avión                                                       | Se muestra el aviso offline y se usa la copia de AsyncStorage                                | No ejecutado: requiere desconectar el teléfono físico                                   |
| UI       | Abrir en teléfono                                                        | No hay desborde, botones táctiles de al menos 44 px y se ven los 12 meses                    | No ejecutado: requiere inspección visual en Expo Go                                     |
| Reglas   | Con dos cuentas, leer o editar la lista ajena y probar `duracionMin: -5` | El documento ajeno se rechaza y la duración negativa no se escribe                           | No ejecutado: requiere publicar las reglas y usar dos cuentas                           |

## Registro automático disponible

- `npm test`: 16 pruebas aprobadas.
- `npx tsc --noEmit`: aprobado.
- `npx expo lint`: aprobado.

La IA no puede afirmar estas pruebas humanas: no tuvo acceso al teléfono, a las cuentas reales ni a la consola de Firebase durante la comprobación.
