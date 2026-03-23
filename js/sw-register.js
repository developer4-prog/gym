function mostrarAvisoActualizacion() {
  if (document.querySelector(".update-banner")) return;

  const aviso = document.createElement("div");
  aviso.className = "update-banner";

  aviso.innerHTML = `
    <span>⚡ Nueva versión disponible</span>
    <button id="updateAppBtn">Actualizar</button>
  `;

  document.body.appendChild(aviso);

  document.getElementById("updateAppBtn").addEventListener("click", () => {
    window.location.reload();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js");

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            mostrarAvisoActualizacion();
          }
        });
      });
    } catch (err) {
      console.log("Error registrando Service Worker", err);
    }
  });
}
