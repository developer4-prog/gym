let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isSafari() {
  return (
    /safari/i.test(window.navigator.userAgent) &&
    !/chrome|android/i.test(window.navigator.userAgent)
  );
}

function showInstallButton() {
  if (installBtn) installBtn.hidden = false;
}

function hideInstallButton() {
  if (installBtn) installBtn.hidden = true;
}

window.addEventListener("load", () => {
  if (isStandaloneMode()) {
    hideInstallButton();
    return;
  }

  // En iPhone/iPad no suele aparecer beforeinstallprompt
  // entonces mostramos el botón manualmente como guía
  if (isIOS() && isSafari()) {
    showInstallButton();
  }
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (!isStandaloneMode()) {
    showInstallButton();
  }
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    // Caso iPhone / Safari
    if (isIOS() && isSafari()) {
      alert(
        "Para instalar esta app en iPhone:\n\n1. Toca el botón Compartir\n2. Luego 'Agregar a pantalla de inicio'",
      );
      return;
    }

    // Caso Android / Chrome / Edge
    if (deferredPrompt) {
      deferredPrompt.prompt();

      try {
        await deferredPrompt.userChoice;
      } catch (error) {
        console.log("No se pudo completar la instalación:", error);
      }

      deferredPrompt = null;
      hideInstallButton();
    }
  });
}

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  hideInstallButton();
  console.log("La app fue instalada");
});
