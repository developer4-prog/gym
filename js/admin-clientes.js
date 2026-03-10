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

        const card = document.createElement("div");
        card.classList.add("cliente-card");

        card.innerHTML = `
          <h3>${nombreCliente}</h3>
  
          <button class="btn-asistencia">Registrar asistencia</button>
          <button class="btn-ver-asistencias">Ver días asistidos</button>
        `;

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

      if (nombre.includes(texto)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}
