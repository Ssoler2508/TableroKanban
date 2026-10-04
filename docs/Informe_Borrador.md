# Plan de Pruebas y Calidad de Software: Gestor de Tareas y Proyectos Académicos (Kanban)

**Asignatura:** Calidad y Pruebas de Software (2026-2)
**Integrantes:** _(completar)_
**Repositorio:** _(enlace)_

> Cómo usar este borrador: rellena cada sección **a medida que obtengas resultados reales**. Pega salidas reales de las herramientas, no resúmenes escritos por la IA. Todo lo que diga `_(pendiente)_` falta por completar.

---

## Sección I: Idea de negocio y aplicación generada

### 1. Descripción de la idea

Gestor de Tareas y Proyectos Académicos con tablero Kanban de tres columnas (Pendiente, En Proceso, Completado). Reglas de negocio:

1. La columna "En Proceso" admite máximo 3 tareas simultáneas (límite WIP).
2. No se puede crear una tarea con fecha de entrega anterior a hoy.
3. Al mover una tarea a "Completado" se guarda automáticamente la fecha y hora de finalización.

### 2. Prompt utilizado

_(pegar aquí el Prompt 1 exacto que se ejecutó en opencode)_

**Herramienta de IA y modelo usados:** opencode, modelo _(completar)_.

---

## Sección II: Listas de chequeo

### 1. Checklist de requerimientos y funcionalidad

_(pegar la tabla llenada a mano tras probar la app; ver `docs/checklists.md`)_

| ID | Requerimiento / Criterio de aceptación | Estado (Pasa/Falla) | Observaciones / Defecto encontrado |
|---|---|---|---|
| REQ01 | _(pendiente)_ | | |

### 2. Checklist de calidad de código (revisión manual)

- [ ] Legibilidad
- [ ] Estructura (lógica vs. UI)
- [ ] Manejo de errores
- [ ] Seguridad básica
- [ ] Consistencia de nombres
- [ ] Duplicación
- [ ] Comentarios útiles
- [ ] Uso de const/let

_(marcar tras leer `index.html` y añadir una observación por cada casilla)_

---

## Sección III: Pruebas estáticas con SonarQube (Dockerizado)

### 1. Dashboard y Quality Gate

_(insertar captura del dashboard de SonarQube)_

### 2. Defectos estáticos identificados

_(copiar lo que Sonar reporta, sin inventar)_

| Tipo (Bug / Smell / Vulnerability) | Severidad | Descripción del hallazgo | Solución sugerida |
|---|---|---|---|
| _(pendiente)_ | | | |

---

## Sección IV: Pruebas unitarias (Dockerizadas)

### 1. Matriz de casos de prueba unitarios

_(construir desde la salida real de `npx jest --verbose`, después de depurar los tests)_

| ID prueba | Función a testear | Datos de entrada | Resultado esperado | Resultado obtenido | ¿Pasa? |
|---|---|---|---|---|---|
| UT-01 | _(pendiente)_ | | | | |

**Resumen de ejecución:** _(pegar la línea `Tests: X failed, Y passed, Z total`)_

### 2. Evidencia de ejecución en Docker

_(insertar captura de la consola con `docker compose run --rm unit-tests`)_

---

## Conclusiones

### Tabla cruzada: qué técnica detectó cada defecto

| Defecto | Checklist | Análisis estático (Sonar) | Pruebas unitarias |
|---|---|---|---|
| _(pendiente: agregar una fila por cada defecto confirmado)_ | | | |

_(Marcar con una X la técnica que detectó cada defecto. Un mismo defecto puede ser detectado por más de una técnica.)_

### Reflexión

_(2 o 3 párrafos: qué técnica encontró más defectos, cuáles solo pudo encontrar una técnica, qué aprendiste sobre la complementariedad de las pruebas)_

---

## Bitácora de evidencias

- [ ] Prompt 1 exacto (Sección I)
- [ ] Checklist de requerimientos llena
- [ ] Checklist de código llena
- [ ] Captura del dashboard de SonarQube con Quality Gate
- [ ] Tabla de hallazgos de Sonar
- [ ] Salidas reales de Jest (primera y segunda ejecución, en `docs/evidencias/`)
- [ ] Captura de `docker compose run --rm unit-tests`
- [ ] Repositorio con `src/`, `tests/`, `Dockerfile` y `docker-compose.yml`
- [ ] PDF final exportado