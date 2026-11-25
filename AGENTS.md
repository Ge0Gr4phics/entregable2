# Mi Cartelera Personal

Aplicación Expo/React Native existente que permite buscar obras con TMDB, conservar una lista personal en Firestore y consultar una copia offline.

## Arquitectura

- `src/screens/`: pantallas y estados visuales.
- `src/navigation/`: navegación React Navigation.
- `src/context/`: estado compartido de autenticación y lista.
- `src/services/`: Firebase, TMDB, caché y servicios externos.
- `src/dominio/`: funciones puras probadas sin Firebase ni fechas del sistema.
- `src/tema/`: única fuente de verdad de colores, espacios y tamaños.
- `docs/specs/`: especificaciones que preceden al código.

## Instrucciones obligatorias

Antes de tocar cualquier pantalla o componente, leer `DESIGN.md`.
No crear código sin una spec correspondiente.
No usar `any` injustificado.
No leer `.env` ni imprimir tokens o configuración de Firebase.
Mantener pantallas sin dependencias directas de Firebase; usan el contexto y servicios.
Mantener carga, éxito y error visibles.
Conservar botones táctiles de al menos 44 px y atribución de TMDB.

## Expo

La app usa Expo SDK definido en `package.json`. Antes de cambiar APIs de Expo consultar la documentación de la versión mayor y `https://docs.expo.dev/llms.txt`.

## Verificación

```bash
npm test
npx tsc --noEmit
npx expo lint
npx prettier --write <archivos editados>
```
