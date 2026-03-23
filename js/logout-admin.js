const logoutBtn = document.getElementById("logoutAdminBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const ok = confirm("¿Deseas cerrar sesión?");
    if (!ok) return;

    try {
      await firebase.auth().signOut();
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión.");
    }
  });
}
