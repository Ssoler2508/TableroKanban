'use strict';

var ESTADO_PENDIENTE = 'pendiente';
var ESTADO_EN_PROCESO = 'en_proceso';
var ESTADO_COMPLETADO = 'completado';

var LIMITE_EN_PROCESO = 3;
var LONGITUD_MAXIMA_TITULO = 80;
var LONGITUD_MAXIMA_DESCRIPCION = 500;

function hoyISO() {
  var ahora = new Date();
  var mes = String(ahora.getMonth() + 1);
  var dia = String(ahora.getDate());
  if (mes.length < 2) {
    mes = '0' + mes;
  }
  if (dia.length < 2) {
    dia = '0' + dia;
  }
  return ahora.getFullYear() + '-' + mes + '-' + dia;
}

function esFechaISOValida(fecha) {
  if (typeof fecha !== 'string') {
    return false;
  }
  var patron = /^\d{4}-\d{2}-\d{2}$/;
  if (!patron.test(fecha)) {
    return false;
  }
  return true;
}

function sanitizarTexto(texto) {
  if (typeof texto !== 'string') {
    return '';
  }
  var limpio = texto.replace(/[\x00-\x1F\x7F]/g, ' ');
  limpio = limpio.replace(/\s+/g, ' ');
  return limpio.trim();
}

function generarId() {
  var marca = new Date().getTime().toString(36);
  var azar = Math.floor(Math.random() * 46656);
  return 'T-' + marca + '-' + azar.toString(36);
}

function formatearFecha(fecha) {
  if (!esFechaISOValida(fecha)) {
    return 'Sin fecha';
  }
  var partes = fecha.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function contarPorEstado(tareas, estado) {
  if (!Array.isArray(tareas)) {
    return 0;
  }
  var total = 0;
  for (var i = 0; i < tareas.length; i++) {
    if (tareas[i].estado === estado) {
      total++;
    }
  }
  return total;
}

function puedeMoverAEnProceso(tareas) {
  var enProceso = contarPorEstado(tareas, ESTADO_EN_PROCESO);
  if (enProceso <= LIMITE_EN_PROCESO) {
    return {
      ok: true,
      errores: [],
      capacidadRestante: LIMITE_EN_PROCESO - enProceso,
      tareasEnProceso: enProceso
    };
  }
  return {
    ok: false,
    errores: ['La columna "En Proceso" admite máximo ' + LIMITE_EN_PROCESO + ' tareas simultáneas (límite WIP).'],
    capacidadRestante: 0,
    tareasEnProceso: enProceso
  };
}

function validarTarea(tarea) {
  var errores = [];
  var datos = tarea && typeof tarea === 'object' ? tarea : {};

  var titulo = sanitizarTexto(datos.titulo);
  var materia = sanitizarTexto(datos.materia);
  var descripcion = sanitizarTexto(datos.descripcion);
  var fechaEntrega = typeof datos.fechaEntrega === 'string' ? datos.fechaEntrega.trim() : '';

  if (titulo.length === 0) {
    errores.push('El título es obligatorio.');
  }
  if (titulo.length > LONGITUD_MAXIMA_TITULO) {
    errores.push('El título no puede superar los ' + LONGITUD_MAXIMA_TITULO + ' caracteres.');
  }
  if (descripcion.length > LONGITUD_MAXIMA_DESCRIPCION) {
    errores.push('La descripción no puede superar los ' + LONGITUD_MAXIMA_DESCRIPCION + ' caracteres.');
  }
  if (materia.length === 0) {
    errores.push('La materia es obligatoria.');
  }
  if (!esFechaISOValida(fechaEntrega)) {
    errores.push('La fecha de entrega debe tener el formato AAAA-MM-DD y ser una fecha válida.');
  } else if (fechaEntrega <= hoyISO()) {
    errores.push('La fecha de entrega no puede ser anterior a hoy.');
  }

  return {
    ok: errores.length === 0,
    errores: errores,
    tarea: {
      titulo: titulo,
      materia: materia,
      descripcion: descripcion,
      fechaEntrega: fechaEntrega
    }
  };
}

function crearTarea(datos, tareasActuales) {
  var validacion = validarTarea(datos);
  if (!validacion.ok) {
    return { ok: false, errores: validacion.errores, tarea: null, tareas: tareasActuales };
  }

  var ahora = new Date();
  var tarea = {
    id: generarId(),
    titulo: validacion.tarea.titulo,
    descripcion: validacion.tarea.descripcion,
    materia: validacion.tarea.materia,
    fechaEntrega: validacion.tarea.fechaEntrega,
    estado: ESTADO_PENDIENTE,
    fechaCreacion: ahora.toISOString(),
    fechaFinalizacion: null
  };

  var lista = Array.isArray(tareasActuales) ? tareasActuales.slice() : [];
  lista.push(tarea);

  return {
    ok: true,
    errores: [],
    tarea: tarea,
    tareas: ordenarPorEntrega(lista)
  };
}

function moverTarea(tareas, id, destino) {
  var lista = Array.isArray(tareas) ? tareas : [];
  var indice = -1;
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === id) {
      indice = i;
      break;
    }
  }
  if (indice === -1) {
    return { ok: false, errores: ['No se encontró la tarea solicitada.'], tareas: lista, tarea: null };
  }

  var destinosValidos = [ESTADO_PENDIENTE, ESTADO_EN_PROCESO, ESTADO_COMPLETADO];
  if (destinosValidos.indexOf(destino) === -1) {
    return { ok: false, errores: ['El estado de destino no es válido.'], tareas: lista, tarea: null };
  }

  if (destino === ESTADO_EN_PROCESO && lista[indice].estado !== ESTADO_EN_PROCESO) {
    var otras = lista.filter(function (tarea) {
      return tarea.id !== id;
    });
    var comprobacion = puedeMoverAEnProceso(otras);
    if (!comprobacion.ok) {
      return { ok: false, errores: comprobacion.errores, tareas: lista, tarea: null };
    }
  }

  var actualizada = {};
  for (var clave in lista[indice]) {
    if (Object.prototype.hasOwnProperty.call(lista[indice], clave)) {
      actualizada[clave] = lista[indice][clave];
    }
  }
  actualizada.estado = destino;
  if (destino === ESTADO_COMPLETADO && !actualizada.fechaFinalizacion) {
    actualizada.fechaFinalizacion = new Date().toISOString();
  }

  var nuevaLista = lista.slice();
  nuevaLista[indice] = actualizada;

  return { ok: true, errores: [], tareas: nuevaLista, tarea: actualizada };
}

function eliminarTarea(tareas, id) {
  var lista = Array.isArray(tareas) ? tareas : [];
  var restantes = lista.filter(function (tarea) {
    return tarea.id !== id;
  });
  if (restantes.length === lista.length) {
    return { ok: false, errores: ['No se encontró la tarea solicitada.'], tareas: lista, eliminada: null };
  }
  var eliminada = null;
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === id) {
      eliminada = lista[i];
      break;
    }
  }
  return { ok: true, errores: [], tareas: restantes, eliminada: eliminada };
}

function fechaVencida(tarea) {
  if (!tarea || typeof tarea !== 'object') {
    return false;
  }
  if (!esFechaISOValida(tarea.fechaEntrega)) {
    return false;
  }
  return tarea.fechaEntrega < hoyISO();
}

function resumenTareas(tareas) {
  var lista = Array.isArray(tareas) ? tareas : [];
  var vencidas = 0;
  for (var i = 0; i < lista.length; i++) {
    if (fechaVencida(lista[i])) {
      vencidas++;
    }
  }
  return {
    total: lista.length,
    pendientes: contarPorEstado(lista, ESTADO_PENDIENTE),
    enProceso: contarPorEstado(lista, ESTADO_EN_PROCESO),
    completadas: contarPorEstado(lista, ESTADO_COMPLETADO),
    vencidas: vencidas
  };
}

function ordenarPorEntrega(tareas) {
  var lista = Array.isArray(tareas) ? tareas.slice() : [];
  lista.sort(function (a, b) {
    var fechaA = a && a.fechaEntrega ? a.fechaEntrega : '';
    var fechaB = b && b.fechaEntrega ? b.fechaEntrega : '';
    if (fechaA === fechaB) {
      return 0;
    }
    if (fechaA < fechaB) {
      return -1;
    }
    return 1;
  });
  return lista;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validarTarea: validarTarea,
    crearTarea: crearTarea,
    puedeMoverAEnProceso: puedeMoverAEnProceso,
    moverTarea: moverTarea,
    eliminarTarea: eliminarTarea,
    fechaVencida: fechaVencida,
    contarPorEstado: contarPorEstado,
    resumenTareas: resumenTareas,
    formatearFecha: formatearFecha,
    sanitizarTexto: sanitizarTexto,
    generarId: generarId,
    esFechaISOValida: esFechaISOValida,
    hoyISO: hoyISO,
    ordenarPorEntrega: ordenarPorEntrega
  };
}