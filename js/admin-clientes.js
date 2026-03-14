async function registrarAsistencia(uid, nombreCliente) {
  try {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    const fechaId = `${year}-${month}-${day}`;

    const hora = hoy.toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log("Guardando asistencia para:", uid, nombreCliente, fechaId);

    await db
      .collection("usuarios")
      .doc(uid)
      .collection("asistencias")
      .doc(fechaId)
      .set({
        fecha: fechaId,
        horaEntrada: hora,
        registradoPor: "admin",
        estado: "asistio",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

    alert(`Asistencia registrada para ${nombreCliente}`);
  } catch (error) {
    console.error("Error registrando asistencia:", error);
    alert("No se pudo registrar la asistencia: " + error.message);
  }
}

function verAsistencias(uid) {
  window.location.href = `asistencias-cliente.html?uid=${uid}`;
}

async function guardarMembresia(uid, nombreCliente) {
  const inicioInput = document.getElementById(`membresia-inicio-${uid}`);
  const finInput = document.getElementById(`membresia-fin-${uid}`);
  const estadoTexto = document.getElementById(`estado-membresia-${uid}`);

  const membresiaInicio = inicioInput.value;
  const membresiaFin = finInput.value;

  if (!membresiaInicio || !membresiaFin) {
    alert("Completa la fecha de inicio y fin de membresía");
    return;
  }

  if (membresiaFin < membresiaInicio) {
    alert("La fecha de fin no puede ser menor que la de inicio");
    return;
  }

  try {
    await db.collection("usuarios").doc(uid).update({
      membresiaInicio,
      membresiaFin,
    });

    const hoy = new Date();
    const fin = new Date(membresiaFin + "T23:59:59");

    if (hoy > fin) {
      estadoTexto.textContent = "Estado: Vencida";
      estadoTexto.className = "estado-membresia vencida";
    } else {
      estadoTexto.textContent = "Estado: Activa";
      estadoTexto.className = "estado-membresia activa";
    }

    alert(`Membresía guardada para ${nombreCliente}`);
  } catch (error) {
    console.error("Error guardando membresía:", error);
    alert("No se pudo guardar la membresía");
  }
}

function calcularEstadoMembresia(membresiaFin) {
  if (!membresiaFin) {
    return { texto: "Sin registrar", clase: "sin-membresia" };
  }

  const hoy = new Date();
  const fin = new Date(membresiaFin + "T23:59:59");

  if (hoy > fin) {
    return { texto: "Vencida", clase: "vencida" };
  }

  return { texto: "Activa", clase: "activa" };
}

async function cargarClientes() {
  const lista = document.getElementById("clientes-lista");

  try {
    const snapshot = await db.collection("usuarios").get();

    lista.innerHTML = "";

    snapshot.forEach((doc) => {
      const user = doc.data();
      const uid = doc.id;

      if (user.rol === "usuario") {
        const nombreCliente = user.nombres || "Usuario";
        const estadoMembresia = calcularEstadoMembresia(user.membresiaFin);

        const card = document.createElement("div");
        card.classList.add("cliente-card");

        card.innerHTML = `
          <h3>${nombreCliente}</h3>

          <p id="estado-membresia-${uid}" class="estado-membresia ${estadoMembresia.clase}">
            Estado: ${estadoMembresia.texto}
          </p>

          <button class="btn-toggle-membresia">Membresía</button>

          <div class="membresia-box oculto" id="membresia-box-${uid}">
            <label for="membresia-inicio-${uid}">Inicio membresía</label>
            <input
              type="date"
              id="membresia-inicio-${uid}"
              value="${user.membresiaInicio || ""}"
            />

            <label for="membresia-fin-${uid}">Fin membresía</label>
            <input
              type="date"
              id="membresia-fin-${uid}"
              value="${user.membresiaFin || ""}"
            />

            <button class="btn-guardar-membresia">Guardar membresía</button>
          </div>

          <button class="btn-asistencia">Registrar asistencia</button>
          <button class="btn-ver-asistencias">Ver días asistidos</button>
        `;

        const botonToggleMembresia = card.querySelector(
          ".btn-toggle-membresia",
        );
        const cajaMembresia = card.querySelector(`#membresia-box-${uid}`);

        botonToggleMembresia.addEventListener("click", () => {
          cajaMembresia.classList.toggle("oculto");
        });

        const botonGuardarMembresia = card.querySelector(
          ".btn-guardar-membresia",
        );
        botonGuardarMembresia.addEventListener("click", () => {
          guardarMembresia(uid, nombreCliente);
        });

        const botonAsistencia = card.querySelector(".btn-asistencia");
        botonAsistencia.addEventListener("click", () => {
          registrarAsistencia(uid, nombreCliente);
        });

        const botonVerAsistencias = card.querySelector(".btn-ver-asistencias");
        botonVerAsistencias.addEventListener("click", () => {
          verAsistencias(uid);
        });

        lista.appendChild(card);
      }
    });

    if (lista.innerHTML.trim() === "") {
      lista.innerHTML = "<p>No hay clientes registrados.</p>";
    }
  } catch (error) {
    console.error("Error cargando clientes:", error);
    lista.innerHTML = "<p>Error cargando clientes.</p>";
  }
}

cargarClientes();

const buscador = document.getElementById("buscarCliente");

if (buscador) {
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
    const tarjetas = document.querySelectorAll(".cliente-card");

    tarjetas.forEach((card) => {
      const nombre = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = nombre.includes(texto) ? "block" : "none";
    });
  });
}
