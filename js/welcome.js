document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.getElementById("welcomeUser");

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) return; // si no hay sesión, no cambia nada

    try {
      const doc = await firebase
        .firestore()
        .collection("usuarios")
        .doc(user.uid)
        .get();

      if (doc.exists) {
        const nombre = doc.data().nombre;

        welcomeText.textContent = `Bienvenido ${nombre} 💪`;
      }
    } catch (error) {
      console.error("Error cargando nombre:", error);
    }
  });
});
