const logoutBtn = document.getElementById("logoutAdminBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const confirmar = confirm("¿Deseas cerrar sesión?");
    if (!confirmar) return;

    try {
      await firebase.auth().signOut();
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión.");
    }
  });
}
