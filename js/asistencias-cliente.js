function obtenerUidDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

function formatearFecha(fechaTexto) {
  const partes = fechaTexto.split("-");
  if (partes.length !== 3) return fechaTexto;

  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const fecha = new Date(anio, mes, dia);

  return fecha.toLocaleDateString("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function cargarAsistenciasCliente() {
  const uid = obtenerUidDesdeURL();
  const lista = document.getElementById("lista-asistencias");
  const tituloCliente = document.getElementById("tituloCliente");
  const resumenAsistencias = document.getElementById("resumenAsistencias");

  if (!uid) {
    lista.innerHTML =
      '<p class="empty-state">No se recibió el UID del cliente.</p>';
    resumenAsistencias.textContent = "Error al cargar datos.";
    return;
  }

  try {
    const docUsuario = await db.collection("usuarios").doc(uid).get();

    if (!docUsuario.exists) {
      lista.innerHTML = '<p class="empty-state">El cliente no existe.</p>';
      resumenAsistencias.textContent = "No se encontró información.";
      return;
    }

    const userData = docUsuario.data();
    const nombreCliente = userData.nombres || userData.email || "Cliente";

    tituloCliente.textContent = `Asistencias de ${nombreCliente}`;

    const snapshot = await db
      .collection("usuarios")
      .doc(uid)
      .collection("asistencias")
      .orderBy("fecha", "desc")
      .get();

    lista.innerHTML = "";

    if (snapshot.empty) {
      resumenAsistencias.textContent =
        "Este cliente aún no tiene asistencias registradas.";
      lista.innerHTML =
        '<p class="empty-state">No hay asistencias registradas.</p>';
      return;
    }

    resumenAsistencias.textContent = `Total de asistencias registradas: ${snapshot.size}`;

    snapshot.forEach((doc) => {
      const asistencia = doc.data();
      const fechaMostrada = formatearFecha(asistencia.fecha || doc.id);
      const horaMostrada = asistencia.horaEntrada || "Hora no registrada";

      const card = document.createElement("div");
      card.classList.add("cliente-card", "asistencia-card");

      card.innerHTML = `
        <div class="asistencia-top">
          <h3>✅ ${fechaMostrada}</h3>
        </div>
        <p class="asistencia-hora">${horaMostrada}</p>
      `;

      lista.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando asistencias del cliente:", error);
    lista.innerHTML = '<p class="empty-state">Error cargando asistencias.</p>';
    resumenAsistencias.textContent = "Ocurrió un error al consultar los datos.";
  }
}

cargarAsistenciasCliente();
