const logica = require('../src/logic.js');

test('logic.js exporta las funciones de logica del tablero Kanban', () => {
  const esperadas = [
    'validarTarea',
    'crearTarea',
    'puedeMoverAEnProceso',
    'moverTarea',
    'eliminarTarea',
    'fechaVencida',
    'contarPorEstado',
    'resumenTareas',
    'formatearFecha',
    'sanitizarTexto',
    'generarId',
    'esFechaISOValida',
    'hoyISO',
    'ordenarPorEntrega'
  ];

  esperadas.forEach((nombre) => {
    expect(typeof logica[nombre]).toBe('function');
  });
});