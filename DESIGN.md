# Sistema de diseño

## Principios

- Editorial, cálido y legible.
- El resumen debe sentirse como un cartel personal, no como un panel administrativo.
- Conservar la navegación y los tokens existentes de Mi Cartelera.

## Tokens

Los valores viven en `src/tema/index.ts`: colores, espacios, radios y tipografía.

## Componentes

- Tarjeta de dato: superficie elevada, radio grande y dato destacado.
- Tarjetas divididas para género y director.
- Barras mensuales construidas con `View`, sin librerías gráficas.
- Selector de año: botón táctil de 44 px, seleccionado con acento.
- Tarjeta destacada y estados de carga, vacío, error y sin conexión.

## Pantallas

Mi año en cine usa un ScrollView, resumenes compactos y textos en español.

## Accesibilidad

Área táctil mínima de 44 px. Contraste mínimo 4.5:1 para texto principal. Mensajes no dependen solo del color.

## Sí y no

- Sí: jerarquía clara, datos grandes, tono cercano.
- No: gráficos decorativos, texto diminuto, colores fuera de `src/tema`, acciones táctiles menores a 44 px.

## Pendientes

Definir animaciones y variantes oscuras adicionales después de la demostración.
