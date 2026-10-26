# Mi Cartelera Personal

Aplicación móvil para descubrir películas y series con TMDB y administrar una lista personal sincronizada por cuenta con Firebase Authentication y Cloud Firestore.

## Requisitos

- Node.js compatible con el proyecto y npm.
- Un proyecto de Firebase con Email/Password Authentication y Cloud Firestore habilitados.
- Una credencial de lectura de TMDB.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y completa la configuración web de Firebase y la credencial de lectura de TMDB.

   ```dotenv
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN=
   ```

   Los valores `EXPO_PUBLIC_*` se incorporan a la aplicación cliente. No pongas contraseñas ni credenciales de cuentas de servicio aquí. El token de TMDB no es un secreto una vez incluido en la app; aplica las restricciones disponibles en TMDB y rótalo si se expone.

3. En Firebase, habilita **Authentication → Email/Password** y crea la base de datos de Cloud Firestore.

4. Publica las reglas de Firestore desde la raíz del proyecto:

   ```bash
   npx firebase-tools deploy --only firestore:rules --project TU_PROJECT_ID
   ```

5. Inicia la app:

   ```bash
   npm start
   ```

   Usa la terminal de Expo para abrirla en un dispositivo, emulador o navegador.

## Qué incluye

- Registro, inicio y cierre de sesión con correo y contraseña.
- Persistencia de la sesión en móvil y restauración del usuario al volver a abrir la app.
- Búsqueda, tendencias, detalles y selección aleatoria de películas/series mediante TMDB.
- Mi lista por usuario, con prevención de duplicados, filtros, edición de estado, calificación y comentario, y eliminación con confirmación.
- Copia local separada por cuenta para consulta sin conexión; los cambios requieren conexión.
- Reglas de Firestore que limitan el acceso al propietario y validan el esquema, los tipos, los estados, la calificación y la longitud del comentario.
- Atribución y aviso de TMDB en la pantalla **Acerca de**.

## Verificación antes de entregar

### Comprobaciones automáticas

```bash
npx tsc --noEmit
npx expo lint
```

Si Expo indica que no hay un linter configurado, registra esa limitación en la entrega en vez de asumir que el lint pasó.

### Prueba funcional sugerida

1. Registra una cuenta de prueba y confirma que aparece la pantalla principal.
2. Cierra y vuelve a abrir la app: la sesión debe restaurarse sin volver a iniciar sesión.
3. Busca una película o serie; abre su detalle y verifica sinopsis, póster, valoración y elenco.
4. Agrégala a Mi lista. Intenta agregarla otra vez y confirma que se evita el duplicado.
5. Edita el estado a **Vista**, selecciona una calificación y guarda un comentario. Comprueba que la calificación no se puede guardar para los otros estados.
6. Usa los filtros de tipo y estado; elimina una entrada y confirma primero la acción.
7. Desconecta el dispositivo y verifica que se muestra la copia local y el aviso de desconexión. Vuelve a conectarlo para sincronizar.
8. Cierra sesión, inicia con otra cuenta y comprueba que no aparece la lista de la primera cuenta.
9. Abre **Acerca de** y verifica la marca de la app, el identificador TMDB y el aviso de atribución.

### Comprobación de reglas de seguridad

Con dos cuentas de prueba distintas en un proyecto de Firebase no productivo, verifica en **Firestore → Rules playground** o con Firebase Emulator Suite:

| Operación | Resultado esperado |
|---|---|
| Leer o crear elementos dentro del UID de la cuenta autenticada | Permitido si el documento cumple el esquema |
| Leer, crear, editar o borrar elementos bajo el UID de otra cuenta | Denegado |
| Crear un elemento con estado desconocido, tipo inválido, título vacío o comentario de más de 500 caracteres | Denegado |
| Guardar una calificación fuera del rango 1–5 o para un elemento que no está marcado como visto | Denegado |
| Cambiar durante una edición el ID de TMDB, el título o el tipo | Denegado |
| Borrar un elemento propio | Permitido |

Las reglas fuente están en [`firestore.rules`](./firestore.rules); la configuración para desplegarlas está en [`firebase.json`](./firebase.json). Publicar el archivo y realizar estas pruebas en el proyecto Firebase son pasos necesarios antes de afirmar que el aislamiento ya fue comprobado en producción.

## Guion de demo (3–4 minutos)

1. **Autenticación (30 s):** iniciar sesión con una cuenta de prueba y mostrar el acceso a la app.
2. **TMDB (60 s):** buscar un título, abrir un resultado y mostrar la información del detalle.
3. **CRUD (75 s):** agregarlo, demostrar que el duplicado se evita, editar estado/calificación/comentario y guardar.
4. **Lista (30 s):** filtrar por estado o tipo y quitar una entrada con confirmación.
5. **Seguridad y atribución (30 s):** mostrar el aviso de desconexión/caché si la red lo permite y terminar en **Acerca de** con la atribución TMDB.

Usa cuentas de prueba y evita mostrar credenciales, tokens o datos personales durante la grabación.

## Atribución

Esta aplicación utiliza la API y las imágenes de TMDB, pero no está respaldada, avalada ni certificada por TMDB. Consulta las [directrices de logos y atribución de TMDB](https://www.themoviedb.org/about/logos-attribution) y sus [términos de uso de la API](https://www.themoviedb.org/api-terms-of-use).
