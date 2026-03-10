async function cargarClientes() {
  const lista = document.getElementById("clientes-lista");

  try {
    const snapshot = await db.collection("usuarios").get();

    lista.innerHTML = "";

    snapshot.forEach((doc) => {
      const user = doc.data();

      if (user.rol === "usuario") {
        const card = document.createElement("div");
        card.classList.add("cliente-card");

        card.innerHTML = `
          <h3>${user.nombre || "Usuario"}</h3>
          <p>${user.email || "Sin correo"}</p>
        `;

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
