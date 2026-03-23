let newWorker;

function crearBannerUpdate() {
  const banner = document.createElement("div");
  banner.id = "update-banner";
  banner.style.position = "fixed";
  banner.style.left = "12px";
  banner.style.right = "12px";
  banner.style.bottom = "20px";
  banner.style.background = "#111";
  banner.style.color = "#fff";
  banner.style.padding = "14px";
  banner.style.borderRadius = "14px";
  banner.style.display = "none";
  banner.style.zIndex = "9999";
  banner.style.justifyContent = "space-between";
  banner.style.alignItems = "center";

  banner.innerHTML = `
    <span>Nueva versión disponible</span>
    <button id="update-now-btn" style="padding:8px 14px;border:none;border-radius:8px;font-weight:700;">
      Actualizar
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById("update-now-btn").addEventListener("click", () => {
    if (newWorker) {
      newWorker.postMessage({ type: "SKIP_WAITING" });
    }
  });

  return banner;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const banner = crearBannerUpdate();

    const registration = await navigator.serviceWorker.register("/gym/sw.js");

    if (registration.waiting) {
      newWorker = registration.waiting;
      banner.style.display = "flex";
    }

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;

      installing.addEventListener("statechange", () => {
        if (
          installing.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          newWorker = installing;
          banner.style.display = "flex";
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}
