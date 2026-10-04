## Paso 1: generar la app con defectos deliberados

```
Actúa como un Desarrollador Software Junior. Crea una aplicación web de
Gestor de Tareas y Proyectos Académicos (tablero Kanban) con exactamente
estos dos archivos:

src/index.html   -> HTML + CSS básico + JS de interfaz (DOM, eventos, localStorage)
src/logic.js     -> funciones de lógica pura, sin tocar el DOM ni localStorage

Requisitos:
1. Debe abrirse con doble clic en index.html, sin servidores ni dependencias.
   index.html carga logic.js con <script src="logic.js">.
2. logic.js funciona en navegador y en Node. Al final usa este patrón:
   if (typeof module !== 'undefined' && module.exports) { module.exports = {...} }
3. Tablero con 3 columnas: "Pendiente", "En Proceso", "Completado". Estados
   internos: 'pendiente', 'en_proceso', 'completado'. Cada tarea tiene: id,
   titulo, descripcion, materia, fechaEntrega (AAAA-MM-DD), estado,
   fechaCreacion y fechaFinalizacion.
4. Permitir crear, mover entre columnas y eliminar tareas. Persistencia en
   localStorage.
5. Reglas de negocio:
   - "En Proceso" admite máximo 3 tareas simultáneas (límite WIP).
   - No se puede crear una tarea con fecha de entrega anterior a hoy.
   - Al mover una tarea a "Completado" se guarda automáticamente la fecha
     y hora de finalización.
6. Toda regla de negocio vive en logic.js y la interfaz la llama. Las
   funciones reciben los datos que necesitan y devuelven resultados con la
   forma { ok, errores, ... } cuando pueden fallar.
7. Funciones exportadas con estos nombres exactos: validarTarea, crearTarea,
   puedeMoverAEnProceso, moverTarea, eliminarTarea, fechaVencida,
   contarPorEstado, resumenTareas, formatearFecha, sanitizarTexto,
   generarId, esFechaISOValida, hoyISO, ordenarPorEntrega.

INSTRUCCIÓN CLAVE DE CALIDAD: introduce entre 7 y 9 problemas de calidad de
software deliberados, que solo se detecten con pruebas adecuadas:
- Al menos 3 en logic.js, detectables con pruebas unitarias (valores límite,
  lógica de fechas, validación de entradas).
- Al menos 2 detectables con análisis estático de SonarQube (por ejemplo
  uso de var, innerHTML con entrada de usuario, código duplicado, catch
  vacío, variables sin usar, complejidad alta).
- Al menos 2 detectables con checklists manuales (persistencia
  inconsistente, caracteres especiales, comportamiento de la UI, manejo de
  datos corruptos en localStorage).
Deben ser sutiles y realistas, como los cometería un junior. La app debe
verse y funcionar normal a primera vista.

NO me digas cuáles son los errores, ni dónde están, ni dejes comentarios en
el código que los delaten. NO crees ningún otro archivo (ni package.json,
ni tests, ni Docker, ni README). Al terminar, solo dime cómo abrir la app.
