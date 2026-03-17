function goLogin() {
  window.location.href = "login.html";
}

auth.onAuthStateChanged(async (user) => {
  const rememberSelected =
    localStorage.getItem("rememberSessionSelected") === "true";

  if (!user || !rememberSelected) {
    return;
  }

  try {
    const userDoc = await db.collection("usuarios").doc(user.uid).get();

    if (!userDoc.exists) return;

    const userData = userDoc.data();

    if (userData.rol === "admin") {
      window.location.replace("admin.html");
    } else if (userData.rol === "usuario") {
      window.location.replace("dashboard.html");
    }
  } catch (error) {
    console.error("Error verificando sesión en index:", error);
  }
});
