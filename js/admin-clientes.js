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

async function cargarClientes() {
  const lista = document.getElementById("clientes-lista");

  try {
    const snapshot = await db.collection("usuarios").get();

    lista.innerHTML = "";

    snapshot.forEach((doc) => {
      const user = doc.data();
      const uid = doc.id;

      if (user.rol === "usuario") {
        const nombreCliente = user.nombres || user.email || "Usuario";

        const card = document.createElement("div");
        card.classList.add("cliente-card");

        card.innerHTML = `
          <h3>${nombreCliente}</h3>
          <p>${user.email || "Sin correo"}</p>
          <button class="btn-asistencia">Registrar asistencia</button>
        `;

        const boton = card.querySelector(".btn-asistencia");
        boton.addEventListener("click", () => {
          registrarAsistencia(uid, nombreCliente);
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
