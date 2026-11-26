# Registro de uso de IA

1. **Completar la épica:** se pidió implementar todo el entregable y el agente revisó la app existente antes de crear código.
   - Corrección: se respetó la separación entre pantallas, contexto y servicios.
   - Harness que lo habría evitado: la obligación de partir de auditoría y spec.
2. **Crear el dominio:** se pidió calcular el resumen anual con las decisiones D1 a D13.
   - Corrección: las funciones quedaron puras y reciben el año actual como dato.
   - Harness que lo habría evitado: tests Vitest antes de implementar el dominio.
3. **Actualizar los datos:** se pidió registrar fecha, géneros, duración y directores.
   - Corrección: se añadieron tipos, normalización Firestore y reglas de validación.
   - Harness que lo habría evitado: la spec del modelo y el test de reglas.
4. **Construir la interfaz:** se pidió añadir Mi año sin romper el diseño existente.
   - Corrección: se creó una pestaña anual y se conservaron carga, vacío, error y offline.
   - Harness que lo habría evitado: leer `DESIGN.md` antes de tocar pantallas.
5. **Preparar y publicar:** se pidió corregir el proceso de carga y GitHub Pages.
   - Corrección: se evitaron consultas repetidas y se agregó la base `/entregable2`.
   - Harness que lo habría evitado: tests de regresión, lint y revisión del diff.
