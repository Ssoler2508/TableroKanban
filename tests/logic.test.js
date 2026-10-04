const logica = require('../src/logic.js');

const {
  validarTarea,
  crearTarea,
  puedeMoverAEnProceso,
  moverTarea,
  eliminarTarea,
  fechaVencida,
  contarPorEstado,
  resumenTareas,
  formatearFecha,
  sanitizarTexto,
  generarId,
  esFechaISOValida,
  hoyISO,
  ordenarPorEntrega
} = logica;

function fechaLocal(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function hoyLocal() {
  return fechaLocal(new Date());
}

function ayerLocal() {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  return fechaLocal(ayer);
}

function mananaLocal() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return fechaLocal(manana);
}

function fechaFutura(dias) {
  const futura = new Date();
  futura.setDate(futura.getDate() + dias);
  return fechaLocal(futura);
}

const HOY = hoyLocal();
const AYER = ayerLocal();
const MANANA = mananaLocal();
const FECHA_PASADA = '2020-01-01';
const FECHA_FUERA_DE_CALENDARIO = '2026-04-31';
const FECHA_MES_INEXISTENTE = '2026-13-01';
const FECHA_MAL_FORMADA = '31-12-2026';
const TITULO_79 = 'a'.repeat(79);
const TITULO_80 = 'a'.repeat(80);
const TITULO_81 = 'a'.repeat(81);
const CON_ESPECIALES = '<script>alerta("x")</script> & áéíóú ñ Ñ 😀';

function datosTarea(sobrescritos = {}) {
  return {
    titulo: 'Ensayo de metodología',
    descripcion: 'Revisar el marco teórico',
    materia: 'Calidad y Pruebas de Software',
    fechaEntrega: fechaFutura(10),
    ...sobrescritos
  };
}

function tareaEnLista(id, estado, fechaEntrega, sobrescritos = {}) {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: 'Descripción de la tarea',
    materia: 'Calidad y Pruebas de Software',
    fechaEntrega,
    estado,
    fechaCreacion: `${FECHA_PASADA}T10:00:00.000Z`,
    fechaFinalizacion: null,
    ...sobrescritos
  };
}

function listaEnProceso(cantidad) {
  const tareas = [];
  for (let i = 1; i <= cantidad; i += 1) {
    tareas.push(tareaEnLista(`EP-${i}`, 'en_proceso', fechaFutura(5 + i)));
  }
  return tareas;
}

describe('esFechaISOValida', () => {
  it('UT-01 acepta una fecha futura con formato AAAA-MM-DD', () => {
    expect(esFechaISOValida(fechaFutura(3))).toBe(true);
  });

  it('UT-02 acepta la fecha de hoy en formato AAAA-MM-DD', () => {
    expect(esFechaISOValida(HOY)).toBe(true);
  });

  it('UT-03 rechaza una fecha con formato DD-MM-AAAA', () => {
    expect(esFechaISOValida(FECHA_MAL_FORMADA)).toBe(false);
  });

  it('UT-04 rechaza una fecha que no existe en el calendario', () => {
    expect(esFechaISOValida(FECHA_FUERA_DE_CALENDARIO)).toBe(false);
  });

  it('UT-05 rechaza un mes fuera del rango válido', () => {
    expect(esFechaISOValida(FECHA_MES_INEXISTENTE)).toBe(false);
  });

  it('UT-06 rechaza una fecha con longitud incorrecta', () => {
    expect(esFechaISOValida('2026-1-01')).toBe(false);
  });

  it('UT-07 rechaza null', () => {
    expect(esFechaISOValida(null)).toBe(false);
  });

  it('UT-08 rechaza undefined', () => {
    expect(esFechaISOValida(undefined)).toBe(false);
  });

  it('UT-09 rechaza un número', () => {
    expect(esFechaISOValida(20260401)).toBe(false);
  });
});

describe('hoyISO', () => {
  it('UT-10 devuelve la fecha de hoy calculada en hora local', () => {
    expect(hoyISO()).toBe(HOY);
  });

  it('UT-11 devuelve la fecha con el formato AAAA-MM-DD', () => {
    expect(hoyISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('sanitizarTexto', () => {
  it('UT-12 recorta los espacios del principio y del final', () => {
    expect(sanitizarTexto('   Ensayo final   ')).toBe('Ensayo final');
  });

  it('UT-13 reduce los espacios internos repetidos a uno solo', () => {
    expect(sanitizarTexto('Ensayo    del    trabajo')).toBe('Ensayo del trabajo');
  });

  it('UT-14 elimina los caracteres de control', () => {
    expect(sanitizarTexto('Ensayo\u0000del\u0000trabajo')).toBe('Ensayo del trabajo');
  });

  it('UT-15 devuelve cadena vacía con null', () => {
    expect(sanitizarTexto(null)).toBe('');
  });

  it('UT-16 devuelve cadena vacía con undefined', () => {
    expect(sanitizarTexto(undefined)).toBe('');
  });

  it('UT-17 conserva las tildes y la letra ñ', () => {
    expect(sanitizarTexto('  Añadir  análisis  ñandú ')).toBe('Añadir análisis ñandú');
  });

  it('UT-18 conserva los emojis', () => {
    expect(sanitizarTexto('  Tarea   😀🚀  ')).toBe('Tarea 😀🚀');
  });

  it('UT-19 conserva los caracteres especiales < > & y las comillas', () => {
    expect(sanitizarTexto(' <b>hola</b> & "adiós" ')).toBe('<b>hola</b> & "adiós"');
  });

  it('UT-20 conserva un número negativo escrito como texto', () => {
    expect(sanitizarTexto('  -42 ')).toBe('-42');
  });
});

describe('generarId', () => {
  it('UT-21 devuelve un identificador no vacío', () => {
    expect(generarId().length).toBeGreaterThan(0);
  });

  it('UT-22 devuelve identificadores distintos en llamadas consecutivas', () => {
    expect(generarId()).not.toBe(generarId());
  });

  it('UT-23 el identificador no contiene espacios', () => {
    expect(generarId()).not.toMatch(/\s/);
  });
});

describe('formatearFecha', () => {
  it('UT-24 formatea una fecha válida como DD/MM/AAAA', () => {
    expect(formatearFecha('2026-03-09')).toBe('09/03/2026');
  });

  it('UT-25 devuelve "Sin fecha" con una fecha que no existe', () => {
    expect(formatearFecha(FECHA_FUERA_DE_CALENDARIO)).toBe('Sin fecha');
  });

  it('UT-26 devuelve "Sin fecha" con una fecha mal formada', () => {
    expect(formatearFecha(FECHA_MAL_FORMADA)).toBe('Sin fecha');
  });

  it('UT-27 devuelve "Sin fecha" con null', () => {
    expect(formatearFecha(null)).toBe('Sin fecha');
  });
});

describe('contarPorEstado', () => {
  const lista = [
    tareaEnLista('A-1', 'pendiente', MANANA),
    tareaEnLista('A-2', 'en_proceso', fechaFutura(4)),
    tareaEnLista('A-3', 'completado', FECHA_PASADA),
    tareaEnLista('A-4', 'pendiente', fechaFutura(6))
  ];

  it('UT-28 cuenta cero tareas en una lista vacía', () => {
    expect(contarPorEstado([], 'pendiente')).toBe(0);
  });

  it('UT-29 cuenta las tareas en estado pendiente', () => {
    expect(contarPorEstado(lista, 'pendiente')).toBe(2);
  });

  it('UT-30 cuenta las tareas en estado en_proceso', () => {
    expect(contarPorEstado(lista, 'en_proceso')).toBe(1);
  });

  it('UT-31 cuenta las tareas en estado completado', () => {
    expect(contarPorEstado(lista, 'completado')).toBe(1);
  });

  it('UT-32 devuelve cero para un estado inexistente', () => {
    expect(contarPorEstado(lista, 'archivado')).toBe(0);
  });

  it('UT-33 devuelve cero cuando recibe null', () => {
    expect(contarPorEstado(null, 'pendiente')).toBe(0);
  });
});

describe('puedeMoverAEnProceso', () => {
  it('UT-34 permite mover con 0 tareas en proceso', () => {
    expect(puedeMoverAEnProceso([]).ok).toBe(true);
  });

  it('UT-35 permite mover con 1 tarea en proceso', () => {
    expect(puedeMoverAEnProceso(listaEnProceso(1)).ok).toBe(true);
  });

  it('UT-36 permite mover con 2 tareas en proceso', () => {
    expect(puedeMoverAEnProceso(listaEnProceso(2)).ok).toBe(true);
  });

  it('UT-37 no permite mover con 3 tareas en proceso', () => {
    expect(puedeMoverAEnProceso(listaEnProceso(3)).ok).toBe(false);
  });

  it('UT-38 no permite mover con 4 tareas en proceso', () => {
    expect(puedeMoverAEnProceso(listaEnProceso(4)).ok).toBe(false);
  });

  it('UT-39 el error menciona el límite máximo de 3 tareas', () => {
    expect(puedeMoverAEnProceso(listaEnProceso(3)).errores.join(' ')).toMatch(/máximo\s+3/i);
  });

  it('UT-40 ignora las tareas de otros estados al contar', () => {
    const lista = [
      tareaEnLista('P-1', 'pendiente', MANANA),
      tareaEnLista('P-2', 'pendiente', fechaFutura(2)),
      tareaEnLista('C-1', 'completado', FECHA_PASADA)
    ];
    expect(puedeMoverAEnProceso(lista).ok).toBe(true);
  });

  it('UT-41 trata una lista vacía como 0 tareas en proceso', () => {
    expect(puedeMoverAEnProceso([]).errores).toEqual([]);
  });

  it('UT-42 no lanza error cuando recibe null', () => {
    expect(puedeMoverAEnProceso(null).ok).toBe(true);
  });
});

describe('validarTarea', () => {
  it('UT-43 acepta una tarea completa con fecha de entrega futura', () => {
    expect(validarTarea(datosTarea()).ok).toBe(true);
  });

  it('UT-44 acepta fecha de entrega hoy', () => {
    expect(validarTarea(datosTarea({ fechaEntrega: HOY })).ok).toBe(true);
  });

  it('UT-45 acepta fecha de entrega mañana', () => {
    expect(validarTarea(datosTarea({ fechaEntrega: MANANA })).ok).toBe(true);
  });

  it('UT-46 rechaza fecha de entrega de ayer', () => {
    expect(validarTarea(datosTarea({ fechaEntrega: AYER })).ok).toBe(false);
  });

  it('UT-47 el error por fecha de ayer menciona que no puede ser anterior a hoy', () => {
    const resultado = validarTarea(datosTarea({ fechaEntrega: AYER }));
    expect(resultado.errores.join(' ')).toMatch(/anterior a hoy/i);
  });

  it('UT-48 acepta un título de 79 caracteres', () => {
    expect(validarTarea(datosTarea({ titulo: TITULO_79 })).ok).toBe(true);
  });

  it('UT-49 acepta un título de 80 caracteres', () => {
    expect(validarTarea(datosTarea({ titulo: TITULO_80 })).ok).toBe(true);
  });

  it('UT-50 rechaza un título de 81 caracteres', () => {
    expect(validarTarea(datosTarea({ titulo: TITULO_81 })).ok).toBe(false);
  });

  it('UT-51 el error de título menciona la palabra título', () => {
    const resultado = validarTarea(datosTarea({ titulo: TITULO_81 }));
    expect(resultado.errores.join(' ')).toMatch(/título/i);
  });

  it('UT-52 rechaza un título vacío', () => {
    expect(validarTarea(datosTarea({ titulo: '' })).ok).toBe(false);
  });

  it('UT-53 rechaza un título formado solo por espacios', () => {
    const resultado = validarTarea(datosTarea({ titulo: '     ' }));
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.join(' ')).toMatch(/título/i);
  });

  it('UT-54 rechaza un título undefined', () => {
    expect(validarTarea(datosTarea({ titulo: undefined })).ok).toBe(false);
  });

  it('UT-55 rechaza una materia vacía', () => {
    expect(validarTarea(datosTarea({ materia: '' })).ok).toBe(false);
  });

  it('UT-56 el error de materia menciona la palabra materia', () => {
    const resultado = validarTarea(datosTarea({ materia: '' }));
    expect(resultado.errores.join(' ')).toMatch(/materia/i);
  });

  it('UT-57 rechaza una fecha de entrega con formato DD-MM-AAAA', () => {
    expect(validarTarea(datosTarea({ fechaEntrega: FECHA_MAL_FORMADA })).ok).toBe(false);
  });

  it('UT-58 el error de fecha inválida menciona la palabra válido', () => {
    const resultado = validarTarea(datosTarea({ fechaEntrega: FECHA_MAL_FORMADA }));
    expect(resultado.errores.join(' ')).toMatch(/válido|válida/i);
  });

  it('UT-59 rechaza una fecha de entrega numérica negativa', () => {
    expect(validarTarea(datosTarea({ fechaEntrega: -5 })).ok).toBe(false);
  });

  it('UT-60 rechaza null', () => {
    expect(validarTarea(null).ok).toBe(false);
  });

  it('UT-61 rechaza undefined', () => {
    expect(validarTarea(undefined).ok).toBe(false);
  });

  it('UT-62 acepta un título con caracteres especiales, tildes y emojis', () => {
    expect(validarTarea(datosTarea({ titulo: CON_ESPECIALES })).ok).toBe(true);
  });

  it('UT-63 devuelve el título normalizado sin espacios sobrantes', () => {
    const resultado = validarTarea(datosTarea({ titulo: '   Ensayo   final   ' }));
    expect(resultado.tarea.titulo).toBe('Ensayo final');
  });
});

describe('crearTarea', () => {
  it('UT-64 crea la tarea en estado pendiente', () => {
    expect(crearTarea(datosTarea(), []).tarea.estado).toBe('pendiente');
  });

  it('UT-65 genera un identificador para la tarea creada', () => {
    expect(typeof crearTarea(datosTarea(), []).tarea.id).toBe('string');
  });

  it('UT-66 registra la fecha de creación de la tarea', () => {
    expect(crearTarea(datosTarea(), []).tarea.fechaCreacion).toBeTruthy();
  });

  it('UT-67 inicia la fecha de finalización en null', () => {
    expect(crearTarea(datosTarea(), []).tarea.fechaFinalizacion).toBeNull();
  });

  it('UT-68 añade la tarea nueva a la lista', () => {
    expect(crearTarea(datosTarea(), []).tareas).toHaveLength(1);
  });

  it('UT-69 devuelve la lista ordenada por fecha de entrega', () => {
    const lista = [
      tareaEnLista('A-1', 'pendiente', fechaFutura(20)),
      tareaEnLista('A-2', 'pendiente', fechaFutura(2))
    ];
    const fechas = crearTarea(datosTarea({ fechaEntrega: fechaFutura(9) }), lista)
      .tareas.map((tarea) => tarea.fechaEntrega);
    expect(fechas).toEqual([...fechas].sort());
  });

  it('UT-70 no modifica la lista original', () => {
    const lista = [tareaEnLista('A-1', 'pendiente', MANANA)];
    crearTarea(datosTarea(), lista);
    expect(lista).toHaveLength(1);
  });

  it('UT-71 no crea la tarea si la validación falla', () => {
    expect(crearTarea(datosTarea({ titulo: '' }), []).tarea).toBeNull();
  });

  it('UT-72 devuelve los errores de validación', () => {
    const resultado = crearTarea(datosTarea({ titulo: '' }), []);
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.length).toBeGreaterThan(0);
  });

  it('UT-73 crea la tarea cuando la lista actual está vacía', () => {
    expect(crearTarea(datosTarea(), []).ok).toBe(true);
  });

  it('UT-74 crea la tarea cuando no se pasa lista actual', () => {
    expect(crearTarea(datosTarea(), undefined).tareas).toHaveLength(1);
  });

  it('UT-75 normaliza el título con espacios sobrantes', () => {
    expect(crearTarea(datosTarea({ titulo: '  Ensayo  ' }), []).tarea.titulo).toBe('Ensayo');
  });

  it('UT-76 conserva tildes, ñ y emojis en el título', () => {
    const resultado = crearTarea(datosTarea({ titulo: `  ${CON_ESPECIALES}  ` }), []);
    expect(resultado.tarea.titulo).toBe(CON_ESPECIALES);
  });
});

describe('moverTarea', () => {
  it('UT-77 mueve una tarea de pendiente a en proceso', () => {
    const lista = [tareaEnLista('P-1', 'pendiente', MANANA)];
    expect(moverTarea(lista, 'P-1', 'en_proceso').tarea.estado).toBe('en_proceso');
  });

  it('UT-78 mueve una tarea de en proceso a completado', () => {
    const lista = [tareaEnLista('EP-1', 'en_proceso', MANANA)];
    expect(moverTarea(lista, 'EP-1', 'completado').tarea.estado).toBe('completado');
  });

  it('UT-79 mueve una tarea de completado a pendiente', () => {
    const lista = [tareaEnLista('C-1', 'completado', FECHA_PASADA)];
    expect(moverTarea(lista, 'C-1', 'pendiente').tarea.estado).toBe('pendiente');
  });

  it('UT-80 registra la fecha y hora de finalización al completar', () => {
    const lista = [tareaEnLista('P-1', 'pendiente', MANANA)];
    const fecha = moverTarea(lista, 'P-1', 'completado').tarea.fechaFinalizacion;
    expect(typeof fecha).toBe('string');
    expect(Number.isNaN(Date.parse(fecha))).toBe(false);
  });

  it('UT-81 no vuelve a registrar la fecha de finalización si ya estaba completada', () => {
    const previa = `${FECHA_PASADA}T12:00:00.000Z`;
    const lista = [tareaEnLista('C-1', 'completado', FECHA_PASADA, { fechaFinalizacion: previa })];
    expect(moverTarea(lista, 'C-1', 'completado').tarea.fechaFinalizacion).toBe(previa);
  });

  it('UT-82 no cambia el estado si el movimiento falla', () => {
    const lista = listaEnProceso(3).concat([tareaEnLista('P-1', 'pendiente', MANANA)]);
    expect(moverTarea(lista, 'P-1', 'en_proceso').ok).toBe(false);
  });

  it('UT-83 no modifica la lista original', () => {
    const lista = [tareaEnLista('P-1', 'pendiente', MANANA)];
    moverTarea(lista, 'P-1', 'en_proceso');
    expect(lista[0].estado).toBe('pendiente');
  });

  it('UT-84 permite entrar en en proceso con 2 tareas en proceso', () => {
    const lista = listaEnProceso(2).concat([tareaEnLista('P-1', 'pendiente', MANANA)]);
    expect(moverTarea(lista, 'P-1', 'en_proceso').ok).toBe(true);
  });

  it('UT-85 no permite entrar en en proceso con 3 tareas en proceso', () => {
    const lista = listaEnProceso(3).concat([tareaEnLista('P-1', 'pendiente', MANANA)]);
    expect(moverTarea(lista, 'P-1', 'en_proceso').ok).toBe(false);
  });

  it('UT-86 no permite entrar en en proceso con 4 tareas en proceso', () => {
    const lista = listaEnProceso(4).concat([tareaEnLista('P-1', 'pendiente', MANANA)]);
    expect(moverTarea(lista, 'P-1', 'en_proceso').ok).toBe(false);
  });

  it('UT-87 el error de límite menciona la columna En Proceso', () => {
    const lista = listaEnProceso(3).concat([tareaEnLista('P-1', 'pendiente', MANANA)]);
    expect(moverTarea(lista, 'P-1', 'en_proceso').errores.join(' ')).toMatch(/En Proceso/);
  });

  it('UT-88 permite mover a pendiente una tarea con 3 tareas en proceso', () => {
    const lista = listaEnProceso(3).concat([tareaEnLista('EP-9', 'en_proceso', MANANA)]);
    expect(moverTarea(lista, 'EP-9', 'pendiente').ok).toBe(true);
  });

  it('UT-89 permite mover dentro de en proceso cuando ya hay 3 tareas', () => {
    expect(moverTarea(listaEnProceso(3), 'EP-1', 'en_proceso').ok).toBe(true);
  });

  it('UT-90 devuelve error si el identificador no existe', () => {
    const resultado = moverTarea(listaEnProceso(1), 'NO-EXISTE', 'en_proceso');
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.join(' ')).toMatch(/no se encontr/i);
  });

  it('UT-91 rechaza un estado de destino no válido', () => {
    expect(moverTarea(listaEnProceso(1), 'EP-1', 'archivado').ok).toBe(false);
  });

  it('UT-92 el error de destino no válido menciona la palabra válido', () => {
    const resultado = moverTarea(listaEnProceso(1), 'EP-1', 'archivado');
    expect(resultado.errores.join(' ')).toMatch(/válido|válida/i);
  });

  it('UT-93 completa una tarea con fecha de entrega vencida', () => {
    const lista = [tareaEnLista('P-1', 'pendiente', AYER)];
    expect(moverTarea(lista, 'P-1', 'completado').ok).toBe(true);
  });
});

describe('eliminarTarea', () => {
  const lista = [
    tareaEnLista('A-1', 'pendiente', MANANA),
    tareaEnLista('A-2', 'en_proceso', fechaFutura(4)),
    tareaEnLista('A-3', 'completado', FECHA_PASADA)
  ];

  it('UT-94 elimina la tarea existente', () => {
    expect(eliminarTarea(lista, 'A-2').ok).toBe(true);
  });

  it('UT-95 conserva el resto de tareas de la lista', () => {
    const restantes = eliminarTarea(lista, 'A-2').tareas;
    expect(restantes.map((tarea) => tarea.id)).toEqual(['A-1', 'A-3']);
  });

  it('UT-96 devuelve error si el identificador no existe', () => {
    const resultado = eliminarTarea(lista, 'NO-EXISTE');
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.join(' ')).toMatch(/no se encontr/i);
  });

  it('UT-97 no modifica la lista original', () => {
    eliminarTarea(lista, 'A-2');
    expect(lista).toHaveLength(3);
  });

  it('UT-98 devuelve error al eliminar de una lista vacía', () => {
    expect(eliminarTarea([], 'A-1').ok).toBe(false);
  });

  it('UT-99 elimina solo la tarea indicada entre tareas de la misma materia', () => {
    const mismaMateria = [
      tareaEnLista('A-1', 'pendiente', MANANA),
      tareaEnLista('A-2', 'pendiente', MANANA)
    ];
    expect(eliminarTarea(mismaMateria, 'A-1').tareas).toHaveLength(1);
  });
});

describe('fechaVencida', () => {
  it('UT-100 marca como vencida una tarea pendiente con fecha de ayer', () => {
    expect(fechaVencida(tareaEnLista('P-1', 'pendiente', AYER))).toBe(true);
  });

  it('UT-101 no marca como vencida una tarea con fecha de hoy', () => {
    expect(fechaVencida(tareaEnLista('P-1', 'pendiente', HOY))).toBe(false);
  });

  it('UT-102 no marca como vencida una tarea con fecha de mañana', () => {
    expect(fechaVencida(tareaEnLista('P-1', 'pendiente', MANANA))).toBe(false);
  });

  it('UT-103 no marca como vencida una tarea en proceso con fecha de mañana', () => {
    expect(fechaVencida(tareaEnLista('EP-1', 'en_proceso', MANANA))).toBe(false);
  });

  it('UT-104 no marca como vencida una tarea completada con fecha de ayer', () => {
    expect(fechaVencida(tareaEnLista('C-1', 'completado', AYER))).toBe(false);
  });

  it('UT-105 marca como vencida una tarea con fecha lejana pasada', () => {
    expect(fechaVencida(tareaEnLista('P-1', 'pendiente', FECHA_PASADA))).toBe(true);
  });

  it('UT-106 no marca como vencida una tarea con fecha inválida', () => {
    expect(fechaVencida(tareaEnLista('P-1', 'pendiente', FECHA_FUERA_DE_CALENDARIO))).toBe(false);
  });

  it('UT-107 no marca como vencida con null', () => {
    expect(fechaVencida(null)).toBe(false);
  });

  it('UT-108 no marca como vencida con undefined', () => {
    expect(fechaVencida(undefined)).toBe(false);
  });
});

describe('resumenTareas', () => {
  const lista = [
    tareaEnLista('V-1', 'pendiente', AYER),
    tareaEnLista('V-2', 'pendiente', MANANA),
    tareaEnLista('V-3', 'en_proceso', fechaFutura(4)),
    tareaEnLista('V-4', 'completado', FECHA_PASADA)
  ];

  it('UT-109 cuenta el total de tareas', () => {
    expect(resumenTareas(lista).total).toBe(4);
  });

  it('UT-110 cuenta las tareas pendientes', () => {
    expect(resumenTareas(lista).pendientes).toBe(2);
  });

  it('UT-111 cuenta las tareas en proceso', () => {
    expect(resumenTareas(lista).enProceso).toBe(1);
  });

  it('UT-112 cuenta las tareas completadas', () => {
    expect(resumenTareas(lista).completadas).toBe(1);
  });

  it('UT-113 cuenta solo las tareas vencidas', () => {
    expect(resumenTareas(lista).vencidas).toBe(1);
  });

  it('UT-114 devuelve todos los contadores a cero con lista vacía', () => {
    expect(resumenTareas([])).toEqual({
      total: 0,
      pendientes: 0,
      enProceso: 0,
      completadas: 0,
      vencidas: 0
    });
  });

  it('UT-115 devuelve los contadores a cero con null', () => {
    expect(resumenTareas(null).total).toBe(0);
  });

  it('UT-116 el total coincide con la suma de los tres estados', () => {
    const resumen = resumenTareas(lista);
    expect(resumen.total).toBe(resumen.pendientes + resumen.enProceso + resumen.completadas);
  });
});

describe('ordenarPorEntrega', () => {
  const desordenada = [
    tareaEnLista('B-1', 'pendiente', fechaFutura(20)),
    tareaEnLista('B-2', 'pendiente', fechaFutura(2)),
    tareaEnLista('B-3', 'pendiente', MANANA)
  ];

  it('UT-117 ordena por fecha de entrega ascendente', () => {
    const fechas = ordenarPorEntrega(desordenada).map((tarea) => tarea.fechaEntrega);
    expect(fechas).toEqual([MANANA, fechaFutura(2), fechaFutura(20)]);
  });

  it('UT-118 mantiene el orden cuando todas las fechas son iguales', () => {
    const misma = [
      tareaEnLista('C-1', 'pendiente', MANANA),
      tareaEnLista('C-2', 'pendiente', MANANA),
      tareaEnLista('C-3', 'pendiente', MANANA)
    ];
    expect(ordenarPorEntrega(misma).map((tarea) => tarea.id)).toEqual(['C-1', 'C-2', 'C-3']);
  });

  it('UT-119 no modifica el array original', () => {
    const original = desordenada.map((tarea) => ({ ...tarea }));
    ordenarPorEntrega(desordenada);
    expect(desordenada.map((tarea) => tarea.id)).toEqual(original.map((tarea) => tarea.id));
  });

  it('UT-120 devuelve un array vacío con una lista vacía', () => {
    expect(ordenarPorEntrega([])).toEqual([]);
  });

  it('UT-121 devuelve un array vacío con null', () => {
    expect(ordenarPorEntrega(null)).toEqual([]);
  });

  it('UT-122 ordena una lista de cuatro tareas con fechas distintas', () => {
    const cuatro = [
      tareaEnLista('D-1', 'pendiente', fechaFutura(15)),
      tareaEnLista('D-2', 'pendiente', HOY),
      tareaEnLista('D-3', 'pendiente', fechaFutura(30)),
      tareaEnLista('D-4', 'pendiente', MANANA)
    ];
    expect(ordenarPorEntrega(cuatro)[0].id).toBe('D-2');
  });
});