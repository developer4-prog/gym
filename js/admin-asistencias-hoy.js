let asistenciasFiltradas = [];
let filtroActual = {
  tipo: "hoy",
  fechaInicio: "",
  fechaFin: "",
};

function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escaparCSV(valor) {
  if (valor === null || valor === undefined) return '""';
  return `"${String(valor).replace(/"/g, '""')}"`;
}

function descargarArchivo(
  nombreArchivo,
  contenido,
  tipo = "text/csv;charset=utf-8;",
) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}

function fechaDentroDeRango(fecha, inicio, fin) {
  return fecha >= inicio && fecha <= fin;
}

async function obtenerAsistencias(fechaInicio, fechaFin) {
  const asistentes = [];
  const usuariosSnapshot = await db.collection("usuarios").get();

  for (const usuarioDoc of usuariosSnapshot.docs) {
    const uid = usuarioDoc.id;
    const usuario = usuarioDoc.data();

    if (usuario.rol !== "usuario") continue;

    try {
      const asistenciasSnapshot = await db
        .collection("usuarios")
        .doc(uid)
        .collection("asistencias")
        .orderBy("fecha", "asc")
        .get();

      asistenciasSnapshot.forEach((asistenciaDoc) => {
        const asistencia = asistenciaDoc.data();
        const fecha = asistencia.fecha || asistenciaDoc.id;

        if (!fechaDentroDeRango(fecha, fechaInicio, fechaFin)) return;

        asistentes.push({
          uid,
          nombre: usuario.nombres || "Usuario",
          email: usuario.email || "Sin email",
          fecha,
          horaEntrada: asistencia.horaEntrada || "No registrada",
          estado: asistencia.estado || "",
          registradoPor: asistencia.registradoPor || "",
          membresiaInicio: usuario.membresiaInicio || "",
          membresiaFin: usuario.membresiaFin || "",
        });
      });
    } catch (error) {
      console.warn(`Error revisando asistencias de ${uid}:`, error);
    }
  }

  asistentes.sort((a, b) => {
    if (a.fecha !== b.fecha) {
      return a.fecha.localeCompare(b.fecha);
    }
    return a.horaEntrada.localeCompare(b.horaEntrada);
  });

  return asistentes;
}

function renderizarAsistencias(asistentes) {
  const lista = document.getElementById("lista-asistencias-hoy");
  const resumen = document.getElementById("resumenAsistenciasHoy");

  lista.innerHTML = "";

  if (!asistentes.length) {
    if (filtroActual.tipo === "hoy") {
      resumen.textContent = "Hoy no hay asistencias registradas.";
      lista.innerHTML =
        '<p class="empty-state">No se registraron asistencias el día de hoy.</p>';
    } else {
      resumen.textContent = `No hay asistencias entre ${filtroActual.fechaInicio} y ${filtroActual.fechaFin}.`;
      lista.innerHTML =
        '<p class="empty-state">No se encontraron asistencias en ese rango.</p>';
    }
    return;
  }

  if (filtroActual.tipo === "hoy") {
    resumen.textContent = `Total de asistentes hoy: ${asistentes.length}`;
  } else {
    resumen.textContent = `Total de registros del ${filtroActual.fechaInicio} al ${filtroActual.fechaFin}: ${asistentes.length}`;
  }

  asistentes.forEach((asistente) => {
    const card = document.createElement("div");
    card.classList.add(
      "cliente-card",
      "asistencia-card",
      "asistencia-card-compacta",
    );

    card.innerHTML = `
      <div class="asistencia-header-compacta">
        <h3>✅ ${asistente.nombre}</h3>
        <span class="hora-chip">${asistente.horaEntrada}</span>
      </div>

      <p class="correo-compacto">${asistente.email}</p>

      <div class="asistencia-meta-compacta">
        <span><strong>Fecha:</strong> ${asistente.fecha}</span>
      </div>
    `;

    lista.appendChild(card);
  });
}

async function cargarAsistencias(fechaInicio, fechaFin, tipo = "rango") {
  const lista = document.getElementById("lista-asistencias-hoy");
  const resumen = document.getElementById("resumenAsistenciasHoy");

  try {
    lista.innerHTML = '<p class="empty-state">Cargando asistencias...</p>';
    resumen.textContent = "Consultando datos...";

    filtroActual = {
      tipo,
      fechaInicio,
      fechaFin,
    };

    asistenciasFiltradas = await obtenerAsistencias(fechaInicio, fechaFin);
    renderizarAsistencias(asistenciasFiltradas);
  } catch (error) {
    console.error("Error cargando asistencias:", error);
    resumen.textContent = "Ocurrió un error al cargar las asistencias.";
    lista.innerHTML = '<p class="empty-state">Error cargando asistencias.</p>';
  }
}

async function cargarAsistenciasDeHoy() {
  const hoy = obtenerFechaHoyLocal();
  const fechaInicioInput = document.getElementById("fechaInicio");
  const fechaFinInput = document.getElementById("fechaFin");

  fechaInicioInput.value = hoy;
  fechaFinInput.value = hoy;

  await cargarAsistencias(hoy, hoy, "hoy");
}

async function buscarPorRango() {
  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;

  if (!fechaInicio || !fechaFin) {
    alert("Selecciona la fecha de inicio y la fecha de fin.");
    return;
  }

  if (fechaFin < fechaInicio) {
    alert("La fecha final no puede ser menor que la fecha inicial.");
    return;
  }

  await cargarAsistencias(fechaInicio, fechaFin, "rango");
}

async function exportarAsistenciasDeHoy() {
  const btn = document.getElementById("btnExportarHoy");
  const textoOriginal = btn.textContent;

  try {
    btn.disabled = true;
    btn.textContent = "Exportando...";

    if (!asistenciasFiltradas.length) {
      alert("No hay asistencias cargadas para exportar.");
      return;
    }

    const separador = ";";

    const encabezados = [
      "Nombre",
      "Email",
      "Fecha",
      "Hora de entrada",
      "Estado",
      "Registrado por",
      "Inicio membresia",
      "Fin membresia",
    ];

    const lineas = [
      "sep=;",
      encabezados.map(escaparCSV).join(separador),
      ...asistenciasFiltradas.map((item) =>
        [
          item.nombre,
          item.email,
          item.fecha,
          item.horaEntrada,
          item.estado,
          item.registradoPor,
          item.membresiaInicio,
          item.membresiaFin,
        ]
          .map(escaparCSV)
          .join(separador),
      ),
    ];

    const csv = "\uFEFF" + lineas.join("\n");

    let nombreArchivo = "asistencias.csv";

    if (filtroActual.tipo === "hoy") {
      nombreArchivo = `asistencias-${filtroActual.fechaInicio}.csv`;
    } else {
      nombreArchivo = `asistencias-${filtroActual.fechaInicio}-a-${filtroActual.fechaFin}.csv`;
    }

    descargarArchivo(nombreArchivo, csv);

    alert(`CSV exportado correctamente. Total: ${asistenciasFiltradas.length}`);
  } catch (error) {
    console.error("Error exportando asistencias:", error);
    alert("No se pudo exportar el reporte.");
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnHoy = document.getElementById("btnHoy");
  const btnBuscarRango = document.getElementById("btnBuscarRango");
  const btnExportarHoy = document.getElementById("btnExportarHoy");

  if (btnHoy) {
    btnHoy.addEventListener("click", cargarAsistenciasDeHoy);
  }

  if (btnBuscarRango) {
    btnBuscarRango.addEventListener("click", buscarPorRango);
  }

  if (btnExportarHoy) {
    btnExportarHoy.addEventListener("click", exportarAsistenciasDeHoy);
  }

  cargarAsistenciasDeHoy();
});
