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

  let fin;

  if (typeof membresiaFin.toDate === "function") {
    fin = membresiaFin.toDate();
  } else {
    fin = new Date(membresiaFin + "T23:59:59");
  }

  const hoy = new Date();

  if (hoy > fin) {
    return { texto: "Vencida", clase: "vencida" };
  }

  return { texto: "Activa", clase: "activa" };
}

function cerrarTodosLosMenus() {
  document.querySelectorAll(".cliente-menu").forEach((menu) => {
    menu.classList.add("oculto");
  });
}

async function eliminarCliente(uid, nombreCliente, card) {
  const confirmado = confirm(
    `¿Seguro que deseas eliminar a ${nombreCliente}?\n\nSe borrarán también todas sus asistencias registradas.`,
  );

  if (!confirmado) return;

  const botonEliminar = card.querySelector(".btn-eliminar-cliente");
  const textoOriginal = botonEliminar
    ? botonEliminar.textContent
    : "Eliminar cliente";

  try {
    if (botonEliminar) {
      botonEliminar.disabled = true;
      botonEliminar.textContent = "Eliminando...";
    }

    const asistenciasRef = db
      .collection("usuarios")
      .doc(uid)
      .collection("asistencias");

    const asistenciasSnapshot = await asistenciasRef.get();

    for (const asistenciaDoc of asistenciasSnapshot.docs) {
      await asistenciaDoc.ref.delete();
    }

    await db.collection("usuarios").doc(uid).delete();

    card.remove();

    const lista = document.getElementById("clientes-lista");
    const cardsVisibles = lista.querySelectorAll(".cliente-card");

    if (!cardsVisibles.length) {
      lista.innerHTML = "<p>No hay clientes registrados.</p>";
    }

    alert(`Cliente eliminado: ${nombreCliente}`);
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    alert("No se pudo eliminar el cliente.");
    if (botonEliminar) {
      botonEliminar.disabled = false;
      botonEliminar.textContent = textoOriginal;
    }
  }
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
        card.classList.add("cliente-card", "cliente-card-admin");

        card.innerHTML = `
          <div class="cliente-card-top">
            <button class="btn-menu-cliente" type="button" aria-label="Más opciones">
              ⋮
            </button>

            <div class="cliente-menu oculto">
              <button class="btn-eliminar-cliente" type="button">
                Eliminar cliente
              </button>
            </div>
          </div>

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
              value="${formatearFechaInput(user.membresiaInicio)}"
            />

            <label for="membresia-fin-${uid}">Fin membresía</label>
            <input
              type="date"
              id="membresia-fin-${uid}"
              value="${formatearFechaInput(user.membresiaFin)}"
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
        const botonGuardarMembresia = card.querySelector(
          ".btn-guardar-membresia",
        );
        const botonAsistencia = card.querySelector(".btn-asistencia");
        const botonVerAsistencias = card.querySelector(".btn-ver-asistencias");
        const botonMenu = card.querySelector(".btn-menu-cliente");
        const menuCliente = card.querySelector(".cliente-menu");
        const botonEliminarCliente = card.querySelector(
          ".btn-eliminar-cliente",
        );

        botonToggleMembresia.addEventListener("click", () => {
          cajaMembresia.classList.toggle("oculto");
        });

        botonGuardarMembresia.addEventListener("click", () => {
          guardarMembresia(uid, nombreCliente);
        });

        botonAsistencia.addEventListener("click", () => {
          registrarAsistencia(uid, nombreCliente);
        });

        botonVerAsistencias.addEventListener("click", () => {
          verAsistencias(uid);
        });

        botonMenu.addEventListener("click", (e) => {
          e.stopPropagation();
          const estabaOculto = menuCliente.classList.contains("oculto");
          cerrarTodosLosMenus();
          if (estabaOculto) {
            menuCliente.classList.remove("oculto");
          }
        });

        menuCliente.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        botonEliminarCliente.addEventListener("click", async () => {
          cerrarTodosLosMenus();
          await eliminarCliente(uid, nombreCliente, card);
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

document.addEventListener("click", () => {
  cerrarTodosLosMenus();
});

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

function formatearFechaInput(fecha) {
  if (!fecha) return "";

  if (fecha.toDate) {
    const d = fecha.toDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof fecha === "string") return fecha;

  return "";
}
