// **Gestión de Operaciones Financieras**

// == Obtención de referencias a los elementos del DOM ==
const addBtn = document.getElementById('add-btn'); // Botón para abrir el modal de agregar operación
const modal = document.getElementById('modal'); // Modal donde se ingresan los datos de la operación
const closeModalBtn = document.querySelector('.close-btn'); // Botón para cerrar el modal
const form = document.getElementById('operation-form'); // Formulario de operación (ingreso/gasto)
const historial = document.querySelector('.historial'); // Contenedor para mostrar operaciones
const detallesContainer = document.getElementById('detalles-container'); // Contenedor para detalles de ingresos
const cerrarDetallesBtn = document.getElementById('cerrar-detalles'); // Botón para cerrar el contenedor de detalles

// == Gestión de almacenamiento en localStorage ==
let operacionesGuardadas = JSON.parse(localStorage.getItem('operaciones')) || []; // Cargar operaciones guardadas
let saldosGuardados = JSON.parse(localStorage.getItem('saldos')) || {}; // Cargar saldos guardados

// == Inicialización de la aplicación ==
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar operaciones guardadas en el historial
  operacionesGuardadas.forEach(({ tipoOperacion, descripcion, tipoMoneda, cantidad, hora }) => {
    agregarElementoAlHistorial(tipoOperacion, descripcion, tipoMoneda, cantidad, hora);
  });

  // Actualizar saldos en el DOM
  actualizarDOMConSaldos(saldosGuardados);
});

// == Eventos para manejar la interfaz de usuario ==

// Abrir el modal al hacer clic en el botón "Agregar operación"
addBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

// Cerrar el modal al hacer clic en el botón "Cerrar"
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Cerrar los detalles al hacer clic en el botón "Cerrar detalles"
cerrarDetallesBtn.addEventListener('click', () => {
  detallesContainer.style.display = 'none';
});

// Umbral mínimo para mostrar alerta de "Poco saldo"
const UMBRAL_MINIMO_SALDO = 10;

// Manejar el envío del formulario de operación
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

  // Obtener los datos del formulario
  const tipoMoneda = document.getElementById('tipo-moneda').value; // Tipo de moneda
  const tipoOperacion = document.getElementById('tipo-operacion').value; // Tipo de operación (ingreso o gasto)
  const cantidad = parseFloat(document.getElementById('tipo-monto').value); // Monto de la operación
  const descripcion = document.getElementById('descripcion').value; // Descripción de la operación

  // Validar que el monto sea un número válido y mayor que cero
  if (isNaN(cantidad) || cantidad <= 0) {
    alert('Por favor, ingrese un monto válido.');
    return;
  }

  // Obtener el saldo actual de la moneda seleccionada
  const saldoActual = saldosGuardados[tipoMoneda] || 0;

  // Calcular el nuevo saldo según el tipo de operación (ingreso o gasto)
  const nuevoSaldo = tipoOperacion === 'ingreso' ? saldoActual + cantidad : saldoActual - cantidad;

  // Validar que no se intente hacer un gasto mayor al saldo disponible
  if (nuevoSaldo < 0) {
    alert('No puedes realizar un gasto que exceda el saldo disponible.');
    return;
  }

  // Validar si el saldo resultante está por debajo del umbral mínimo
  if (tipoOperacion === 'gasto' && nuevoSaldo < UMBRAL_MINIMO_SALDO) {
    alert(`Aviso: Tu saldo restante será bajo (${tipoMoneda} ${nuevoSaldo.toFixed(2)}). ¡Por favor, ten cuidado!`);
  }

  // Agregar la nueva operación al historial visual
  agregarElementoAlHistorial(tipoOperacion, descripcion, tipoMoneda, cantidad);

  // Guardar la operación en el array de operaciones
  operacionesGuardadas.push({
    tipoOperacion,
    descripcion,
    tipoMoneda,
    cantidad,
    hora: new Date().toLocaleTimeString(), // Hora actual
  });

  // Guardar las operaciones en localStorage
  localStorage.setItem('operaciones', JSON.stringify(operacionesGuardadas));

  // Actualizar el saldo de la moneda seleccionada
  saldosGuardados[tipoMoneda] = nuevoSaldo;

  // Guardar los saldos actualizados en localStorage
  localStorage.setItem('saldos', JSON.stringify(saldosGuardados));

  // Actualizar los saldos mostrados en el DOM
  actualizarDOMConSaldos(saldosGuardados);

  // Cerrar el modal y limpiar el formulario
  modal.style.display = 'none';
  form.reset();
});


// == Funciones para la lógica del negocio ==

/**
 * Agrega una operación al historial visual.
 */
function agregarElementoAlHistorial(tipoOperacion, descripcion, tipoMoneda, cantidad, hora = new Date().toLocaleTimeString()) {
  const nuevoElemento = document.createElement('div');
  nuevoElemento.className = `historial-item ${tipoOperacion}`;
  nuevoElemento.innerHTML = `
    <strong style="color: ${tipoOperacion === 'ingreso' ? 'green' : 'red'};">
      ${tipoOperacion === 'ingreso' ? 'Ingreso' : 'Gasto'}
    </strong> 
    - ${descripcion} (${tipoMoneda}) ${cantidad.toFixed(2)}
    <br>
    <small style="color: gray;">Hora: ${hora}</small>
  `;
  if (tipoOperacion === 'ingreso') {
    nuevoElemento.addEventListener('click', () => {
      mostrarDetallesIngreso(descripcion, cantidad, tipoMoneda);
    });
  }
  historial.appendChild(nuevoElemento);
}

/**
 * Guarda una operación en localStorage.
 */
function guardarOperacion(tipoOperacion, descripcion, tipoMoneda, cantidad) {
  const nuevaOperacion = {
    tipoOperacion,
    descripcion,
    tipoMoneda,
    cantidad,
    hora: new Date().toLocaleTimeString(),
  };
  operacionesGuardadas.push(nuevaOperacion);
  localStorage.setItem('operaciones', JSON.stringify(operacionesGuardadas));
}

/**
 * Actualiza el saldo de una moneda.
 */
function actualizarSaldo(tipoOperacion, tipoMoneda, cantidad) {
  const saldoActual = saldosGuardados[tipoMoneda] || 0;
  const nuevoSaldo = tipoOperacion === 'ingreso' ? saldoActual + cantidad : saldoActual - cantidad;

  if (nuevoSaldo < 0) {
    alert('No puedes realizar un gasto que exceda el saldo disponible.');
    return false;
  }

  saldosGuardados[tipoMoneda] = nuevoSaldo;
  localStorage.setItem('saldos', JSON.stringify(saldosGuardados));
  actualizarDOMConSaldos(saldosGuardados);
  return true;
}

/**
 * Actualiza los saldos mostrados en el DOM.
 */
function actualizarDOMConSaldos(saldosGuardados) {
  document.querySelectorAll('.saldo').forEach(saldoElement => {
    const tipoMoneda = saldoElement.dataset.moneda;
    const saldoActualizado = saldosGuardados[tipoMoneda] || 0;
    saldoElement.textContent = `${tipoMoneda} ${saldoActualizado.toFixed(2)}`;
  });
}

/**
 * Muestra detalles de un ingreso, incluyendo los gastos relacionados.
 */
function mostrarDetallesIngreso(descripcionIngreso, montoIngreso, tipoMoneda) {
  const gastosRelacionados = operacionesGuardadas.filter(op => op.tipoOperacion === 'gasto' && op.tipoMoneda === tipoMoneda);
  const totalGastos = gastosRelacionados.reduce((total, gasto) => total + gasto.cantidad, 0);

  detallesContainer.innerHTML = `
    <h3>Detalles del Ingreso: ${descripcionIngreso}</h3>
    <p>Monto Total del Ingreso: ${tipoMoneda} ${montoIngreso.toFixed(2)}</p>
    <p>Total Gastos: ${tipoMoneda} ${totalGastos.toFixed(2)}</p>
    <canvas id="grafica-gastos" width="400" height="200"></canvas>
  `;
  detallesContainer.style.display = 'block';

  generarGraficaGastos(gastosRelacionados, montoIngreso, tipoMoneda);
}

/**
 * Genera una gráfica de tipo "pie" para mostrar los gastos relacionados.
 */
function generarGraficaGastos(gastosRelacionados, montoIngreso, tipoMoneda) {
  const ctx = document.getElementById('grafica-gastos').getContext('2d');
  const labels = gastosRelacionados.map(gasto => gasto.descripcion);
  const data = gastosRelacionados.map(gasto => gasto.cantidad);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: `Gastos en ${tipoMoneda}`,
        data: data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}
